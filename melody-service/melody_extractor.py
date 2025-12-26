"""
Melody Extractor
Extrai melodia de músicas usando Demucs (separação de voz) e Crepe (detecção de pitch).
"""

import os
import subprocess
import tempfile
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, Callable

import numpy as np
import librosa
import soundfile as sf

# Constantes para detecção de notas
NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
A4_FREQ = 440.0
A4_MIDI = 69


def frequency_to_note(freq: float) -> tuple[str, int]:
    """Converte frequência (Hz) para nota musical."""
    if freq <= 0:
        return "", 0

    # Calcula o número MIDI
    midi_num = 12 * np.log2(freq / A4_FREQ) + A4_MIDI
    midi_num = int(round(midi_num))

    # Extrai nota e oitava
    note_idx = midi_num % 12
    octave = (midi_num // 12) - 1

    note_name = NOTE_NAMES[note_idx]
    return f"{note_name}{octave}", midi_num


def group_notes(times: np.ndarray, frequencies: np.ndarray, confidences: np.ndarray,
                min_duration: float = 0.05, min_confidence: float = 0.5) -> list[dict]:
    """
    Agrupa detecções consecutivas da mesma nota.

    Args:
        times: Array de timestamps
        frequencies: Array de frequências detectadas
        confidences: Array de confiança das detecções
        min_duration: Duração mínima de uma nota (segundos)
        min_confidence: Confiança mínima para considerar uma nota

    Returns:
        Lista de notas agrupadas com start, end, note, frequency, confidence
    """
    notes = []

    if len(times) == 0:
        return notes

    current_note = None
    current_start = 0
    current_freqs = []
    current_confs = []

    for i, (t, freq, conf) in enumerate(zip(times, frequencies, confidences)):
        if conf < min_confidence or freq <= 0:
            # Finaliza nota atual se existir
            if current_note and len(current_freqs) > 0:
                duration = t - current_start
                if duration >= min_duration:
                    notes.append({
                        "start": round(current_start, 3),
                        "end": round(t, 3),
                        "note": current_note,
                        "frequency": round(float(np.median(current_freqs)), 1),
                        "confidence": round(float(np.mean(current_confs)), 2)
                    })
            current_note = None
            current_freqs = []
            current_confs = []
            continue

        note_name, _ = frequency_to_note(freq)

        if note_name != current_note:
            # Finaliza nota anterior
            if current_note and len(current_freqs) > 0:
                duration = t - current_start
                if duration >= min_duration:
                    notes.append({
                        "start": round(current_start, 3),
                        "end": round(t, 3),
                        "note": current_note,
                        "frequency": round(float(np.median(current_freqs)), 1),
                        "confidence": round(float(np.mean(current_confs)), 2)
                    })

            # Inicia nova nota
            current_note = note_name
            current_start = t
            current_freqs = [freq]
            current_confs = [conf]
        else:
            current_freqs.append(freq)
            current_confs.append(conf)

    # Finaliza última nota
    if current_note and len(current_freqs) > 0:
        duration = times[-1] - current_start
        if duration >= min_duration:
            notes.append({
                "start": round(current_start, 3),
                "end": round(float(times[-1]), 3),
                "note": current_note,
                "frequency": round(float(np.median(current_freqs)), 1),
                "confidence": round(float(np.mean(current_confs)), 2)
            })

    return notes


class MelodyExtractor:
    """Extrai melodia de músicas do YouTube."""

    def __init__(self, cache_dir: Path = Path("./cache")):
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(exist_ok=True)

        # Diretório temporário para processamento
        self.temp_dir = Path(tempfile.gettempdir()) / "melody_extractor"
        self.temp_dir.mkdir(exist_ok=True)

    def download_audio(self, youtube_url: str, output_path: Path) -> Path:
        """
        Baixa áudio do YouTube usando yt-dlp.

        Args:
            youtube_url: URL do vídeo do YouTube
            output_path: Caminho para salvar o áudio

        Returns:
            Caminho do arquivo de áudio baixado
        """
        output_template = str(output_path.with_suffix(''))

        cmd = [
            "yt-dlp",
            "-x",  # Extrai apenas áudio
            "--audio-format", "wav",
            "--audio-quality", "0",  # Melhor qualidade
            "-o", f"{output_template}.%(ext)s",
            "--no-playlist",
            youtube_url
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            raise Exception(f"Erro ao baixar áudio: {result.stderr}")

        # yt-dlp pode adicionar extensão diferente
        wav_path = output_path.with_suffix('.wav')
        if wav_path.exists():
            return wav_path

        # Tenta encontrar o arquivo baixado
        for ext in ['.wav', '.m4a', '.mp3', '.webm']:
            path = output_path.with_suffix(ext)
            if path.exists():
                # Converte para WAV se necessário
                if ext != '.wav':
                    self._convert_to_wav(path, wav_path)
                    path.unlink()
                return wav_path

        raise Exception("Arquivo de áudio não encontrado após download")

    def _convert_to_wav(self, input_path: Path, output_path: Path):
        """Converte áudio para WAV usando ffmpeg."""
        cmd = [
            "ffmpeg", "-y",
            "-i", str(input_path),
            "-ar", "22050",  # Sample rate para Crepe
            "-ac", "1",  # Mono
            str(output_path)
        ]
        subprocess.run(cmd, capture_output=True)

    def separate_vocals(self, audio_path: Path, output_dir: Path) -> Path:
        """
        Separa vocais do instrumental usando Demucs.

        Args:
            audio_path: Caminho do áudio original
            output_dir: Diretório para salvar os stems

        Returns:
            Caminho do arquivo de vocais separado
        """
        cmd = [
            "python", "-m", "demucs",
            "--two-stems", "vocals",  # Separa apenas vocais
            "-o", str(output_dir),
            "--mp3",  # Salva em MP3 para economizar espaço
            str(audio_path)
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            # Tenta com modelo mais leve se falhar
            cmd[2:2] = ["-n", "htdemucs"]
            result = subprocess.run(cmd, capture_output=True, text=True)

            if result.returncode != 0:
                raise Exception(f"Erro ao separar vocais: {result.stderr}")

        # Encontra o arquivo de vocais
        stem_name = audio_path.stem
        vocals_patterns = [
            output_dir / "htdemucs" / stem_name / "vocals.mp3",
            output_dir / "htdemucs" / stem_name / "vocals.wav",
            output_dir / "mdx_extra" / stem_name / "vocals.mp3",
            output_dir / "mdx_extra" / stem_name / "vocals.wav",
        ]

        for vocals_path in vocals_patterns:
            if vocals_path.exists():
                return vocals_path

        # Lista diretórios para debug
        for item in output_dir.rglob("*vocals*"):
            return item

        raise Exception("Arquivo de vocais não encontrado após separação")

    def detect_pitch_crepe(self, audio_path: Path) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Detecta pitch usando Crepe.

        Args:
            audio_path: Caminho do áudio (idealmente vocais isolados)

        Returns:
            Tupla de (timestamps, frequências, confiança)
        """
        import crepe

        # Carrega áudio
        audio, sr = librosa.load(str(audio_path), sr=16000, mono=True)

        # Detecta pitch com Crepe
        # step_size em milissegundos (10ms = 100 detecções por segundo)
        time, frequency, confidence, _ = crepe.predict(
            audio, sr,
            step_size=10,  # 10ms entre detecções
            viterbi=True,  # Suaviza a detecção
            model_capacity="medium"  # Balanceia velocidade e precisão
        )

        return time, frequency, confidence

    def detect_pitch_librosa(self, audio_path: Path) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Detecta pitch usando librosa (fallback se Crepe não disponível).

        Args:
            audio_path: Caminho do áudio

        Returns:
            Tupla de (timestamps, frequências, confiança)
        """
        # Carrega áudio
        audio, sr = librosa.load(str(audio_path), sr=22050, mono=True)

        # Detecta pitch usando pyin (probabilistic YIN)
        f0, voiced_flag, voiced_probs = librosa.pyin(
            audio,
            fmin=librosa.note_to_hz('C2'),
            fmax=librosa.note_to_hz('C7'),
            sr=sr,
            frame_length=2048,
            hop_length=512
        )

        # Gera timestamps
        times = librosa.times_like(f0, sr=sr, hop_length=512)

        # Substitui NaN por 0
        f0 = np.nan_to_num(f0, nan=0.0)

        return times, f0, voiced_probs

    def extract_melody(
        self,
        youtube_url: str,
        song_code: str,
        song_title: Optional[str] = None,
        progress_callback: Optional[Callable[[int], None]] = None
    ) -> dict:
        """
        Extrai melodia completa de uma música do YouTube.

        Args:
            youtube_url: URL do vídeo do YouTube
            song_code: Código da música no catálogo
            song_title: Título da música (opcional)
            progress_callback: Callback para reportar progresso (0-100)

        Returns:
            Dicionário com a melodia extraída
        """
        work_dir = self.temp_dir / song_code
        work_dir.mkdir(exist_ok=True)

        try:
            # 1. Download do áudio (0-20%)
            if progress_callback:
                progress_callback(5)

            audio_path = work_dir / "original.wav"
            audio_path = self.download_audio(youtube_url, audio_path)

            if progress_callback:
                progress_callback(20)

            # 2. Separar vocais (20-60%)
            if progress_callback:
                progress_callback(25)

            stems_dir = work_dir / "stems"
            stems_dir.mkdir(exist_ok=True)

            try:
                vocals_path = self.separate_vocals(audio_path, stems_dir)
                if progress_callback:
                    progress_callback(60)
            except Exception as e:
                # Se falhar separação, usa áudio original
                print(f"Aviso: Não foi possível separar vocais: {e}")
                print("Usando áudio original para detecção de pitch...")
                vocals_path = audio_path
                if progress_callback:
                    progress_callback(60)

            # 3. Detectar pitch (60-90%)
            if progress_callback:
                progress_callback(65)

            try:
                times, frequencies, confidences = self.detect_pitch_crepe(vocals_path)
            except Exception as e:
                print(f"Aviso: Crepe falhou ({e}), usando librosa como fallback...")
                times, frequencies, confidences = self.detect_pitch_librosa(vocals_path)

            if progress_callback:
                progress_callback(90)

            # 4. Agrupar notas (90-100%)
            notes = group_notes(times, frequencies, confidences)

            # Calcula duração total
            duration = float(times[-1]) if len(times) > 0 else 0

            result = {
                "song_code": song_code,
                "song_title": song_title,
                "duration": round(duration, 2),
                "notes": notes,
                "total_notes": len(notes),
                "processed_at": datetime.now().isoformat()
            }

            if progress_callback:
                progress_callback(100)

            return result

        finally:
            # Limpa arquivos temporários
            import shutil
            if work_dir.exists():
                shutil.rmtree(work_dir, ignore_errors=True)


# Para teste direto
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Uso: python melody_extractor.py <youtube_url> [song_code]")
        sys.exit(1)

    url = sys.argv[1]
    code = sys.argv[2] if len(sys.argv) > 2 else "test"

    extractor = MelodyExtractor()

    def progress(p):
        print(f"Progresso: {p}%")

    result = extractor.extract_melody(url, code, progress_callback=progress)

    print("\n=== Resultado ===")
    print(f"Duração: {result['duration']}s")
    print(f"Total de notas: {result['total_notes']}")
    print(f"\nPrimeiras 10 notas:")
    for note in result['notes'][:10]:
        print(f"  {note['start']:.2f}s - {note['end']:.2f}s: {note['note']} ({note['frequency']}Hz)")

    # Salva resultado
    with open(f"{code}_melody.json", "w") as f:
        json.dump(result, f, indent=2)
    print(f"\nResultado salvo em {code}_melody.json")
