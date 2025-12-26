# Melody Extraction Service

Microserviço Python para extração de melodia de músicas do YouTube.
Usado como "gabarito" para a barra de tom do karaokê.

## Funcionalidades

- Download de áudio do YouTube via `yt-dlp`
- Separação de vocais do instrumental via `Demucs`
- Detecção de pitch via `Crepe` (ou `librosa` como fallback)
- API REST para processamento e consulta

## Requisitos

- Python 3.10+
- FFmpeg
- ~4GB RAM (para Demucs)
- GPU opcional (acelera Demucs e Crepe)

## Instalação

### Local

```bash
# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Iniciar servidor
python main.py
# ou: uvicorn main:app --reload
```

### Docker

```bash
# Build
docker build -t melody-service .

# Run
docker run -p 8000:8000 -v $(pwd)/cache:/app/cache melody-service
```

## API Endpoints

### Health Check
```
GET /health
```

### Extrair Melodia (Síncrono)
```
POST /extract
Content-Type: application/json

{
  "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "song_code": "0001",
  "song_title": "Nome da Música"
}
```

Resposta:
```json
{
  "song_code": "0001",
  "duration": 234.5,
  "notes": [
    {"start": 12.5, "end": 13.1, "note": "C4", "frequency": 261.6, "confidence": 0.95},
    {"start": 13.2, "end": 13.8, "note": "E4", "frequency": 329.6, "confidence": 0.92}
  ],
  "total_notes": 150,
  "processed_at": "2025-01-15T10:30:00"
}
```

### Extrair Melodia (Assíncrono)
```
POST /extract/async
```
Mesmo body. Retorna imediatamente e processa em background.

### Verificar Status
```
GET /status/{song_code}
```

Resposta:
```json
{
  "song_code": "0001",
  "status": "processing",  // ou "completed", "error"
  "progress": 45
}
```

### Obter Melodia Processada
```
GET /melody/{song_code}
```

### Deletar Melodia
```
DELETE /melody/{song_code}
```

## Estrutura da Nota

| Campo | Tipo | Descrição |
|-------|------|-----------|
| start | float | Tempo de início em segundos |
| end | float | Tempo de fim em segundos |
| note | string | Nome da nota (ex: "C4", "A#3") |
| frequency | float | Frequência em Hz |
| confidence | float | Confiança da detecção (0-1) |

## Uso via CLI

```bash
# Testar extração diretamente
python melody_extractor.py "https://www.youtube.com/watch?v=VIDEO_ID" song_code
```

## Notas Técnicas

### Tempo de Processamento

- Download: ~30s (depende da conexão)
- Separação de voz (Demucs): ~2-5min (CPU) ou ~30s (GPU)
- Detecção de pitch: ~1-2min

### Precisão

- A detecção funciona melhor com vocais isolados
- Se Demucs falhar, usa áudio original (menos preciso)
- Notas muito curtas (<50ms) são ignoradas
- Confiança < 0.5 é descartada

### Cache

Os resultados são salvos em `./cache/{song_code}.json` para reutilização.
