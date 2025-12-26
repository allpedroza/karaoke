"""
Melody Extraction Microservice
Extrai a melodia (pitch) de músicas do YouTube para usar como gabarito no karaokê.
"""

import os
import json
import tempfile
import shutil
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from melody_extractor import MelodyExtractor

app = FastAPI(
    title="Melody Extraction Service",
    description="Extrai melodia de músicas para karaokê",
    version="1.0.0"
)

# CORS para permitir chamadas do backend Node.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Diretório para cache de processamento
CACHE_DIR = Path("./cache")
CACHE_DIR.mkdir(exist_ok=True)

# Instância do extrator
extractor = MelodyExtractor(cache_dir=CACHE_DIR)


class ProcessRequest(BaseModel):
    """Request para processar uma música"""
    youtube_url: str
    song_code: str
    song_title: Optional[str] = None


class MelodyNote(BaseModel):
    """Uma nota na melodia"""
    start: float      # Tempo de início em segundos
    end: float        # Tempo de fim em segundos
    note: str         # Nome da nota (ex: "C4", "A#3")
    frequency: float  # Frequência em Hz
    confidence: float # Confiança da detecção (0-1)


class MelodyResponse(BaseModel):
    """Resposta com a melodia extraída"""
    song_code: str
    duration: float
    notes: list[MelodyNote]
    processed_at: str


class ProcessingStatus(BaseModel):
    """Status do processamento"""
    song_code: str
    status: str  # "processing", "completed", "error"
    progress: Optional[int] = None
    error: Optional[str] = None


# Armazena status de processamentos em andamento
processing_status: dict[str, ProcessingStatus] = {}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "melody-extraction"}


@app.post("/extract", response_model=MelodyResponse)
async def extract_melody(request: ProcessRequest):
    """
    Extrai a melodia de uma música do YouTube.
    Processo síncrono - aguarda até completar.
    """
    try:
        result = extractor.extract_melody(
            youtube_url=request.youtube_url,
            song_code=request.song_code,
            song_title=request.song_title
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/extract/async")
async def extract_melody_async(request: ProcessRequest, background_tasks: BackgroundTasks):
    """
    Inicia extração de melodia em background.
    Use GET /status/{song_code} para verificar progresso.
    """
    song_code = request.song_code

    # Verifica se já está processando
    if song_code in processing_status:
        status = processing_status[song_code]
        if status.status == "processing":
            return {"message": "Already processing", "song_code": song_code}

    # Inicia processamento em background
    processing_status[song_code] = ProcessingStatus(
        song_code=song_code,
        status="processing",
        progress=0
    )

    background_tasks.add_task(
        process_in_background,
        request.youtube_url,
        song_code,
        request.song_title
    )

    return {"message": "Processing started", "song_code": song_code}


async def process_in_background(youtube_url: str, song_code: str, song_title: Optional[str]):
    """Processa melodia em background"""
    try:
        def progress_callback(progress: int):
            processing_status[song_code].progress = progress

        result = extractor.extract_melody(
            youtube_url=youtube_url,
            song_code=song_code,
            song_title=song_title,
            progress_callback=progress_callback
        )

        # Salva resultado em cache
        cache_file = CACHE_DIR / f"{song_code}.json"
        with open(cache_file, "w") as f:
            json.dump(result, f)

        processing_status[song_code] = ProcessingStatus(
            song_code=song_code,
            status="completed",
            progress=100
        )
    except Exception as e:
        processing_status[song_code] = ProcessingStatus(
            song_code=song_code,
            status="error",
            error=str(e)
        )


@app.get("/status/{song_code}", response_model=ProcessingStatus)
async def get_processing_status(song_code: str):
    """Retorna status do processamento de uma música"""
    if song_code not in processing_status:
        # Verifica se existe em cache
        cache_file = CACHE_DIR / f"{song_code}.json"
        if cache_file.exists():
            return ProcessingStatus(
                song_code=song_code,
                status="completed",
                progress=100
            )
        raise HTTPException(status_code=404, detail="Song not found")

    return processing_status[song_code]


@app.get("/melody/{song_code}", response_model=MelodyResponse)
async def get_melody(song_code: str):
    """Retorna a melodia de uma música já processada"""
    cache_file = CACHE_DIR / f"{song_code}.json"

    if not cache_file.exists():
        raise HTTPException(status_code=404, detail="Melody not found. Process the song first.")

    with open(cache_file, "r") as f:
        return json.load(f)


@app.delete("/melody/{song_code}")
async def delete_melody(song_code: str):
    """Remove melodia do cache"""
    cache_file = CACHE_DIR / f"{song_code}.json"

    if cache_file.exists():
        cache_file.unlink()
        if song_code in processing_status:
            del processing_status[song_code]
        return {"message": "Deleted", "song_code": song_code}

    raise HTTPException(status_code=404, detail="Melody not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
