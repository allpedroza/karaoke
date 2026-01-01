// Serviço para buscar melodias do melody-service

const MELODY_SERVICE_URL = 'http://localhost:8000';

export interface MelodyNote {
  time: number;      // Tempo em segundos
  note: string;      // Nome da nota (ex: "C4", "D#5")
  frequency: number; // Frequência em Hz
  duration: number;  // Duração da nota em segundos
}

export interface SongMelody {
  songCode: string;
  notes: MelodyNote[];
  duration: number;
}

/**
 * Busca a melodia de uma música específica
 */
export async function fetchMelody(songCode: string): Promise<SongMelody | null> {
  try {
    const response = await fetch(`${MELODY_SERVICE_URL}/melody/${songCode}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Melodia não encontrada para música ${songCode}`);
        return null;
      }
      throw new Error(`Erro ao buscar melodia: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar melodia:', error);
    return null;
  }
}

/**
 * Converte frequência (Hz) para nome da nota musical
 */
export function frequencyToNote(frequency: number): string {
  const A4 = 440;
  const C0 = A4 * Math.pow(2, -4.75);
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const halfSteps = Math.round(12 * Math.log2(frequency / C0));
  const octave = Math.floor(halfSteps / 12);
  const note = noteNames[halfSteps % 12];

  return `${note}${octave}`;
}

/**
 * Converte nome da nota para frequência (Hz)
 */
export function noteToFrequency(note: string): number {
  const noteMatch = note.match(/^([A-G]#?)(\d+)$/);
  if (!noteMatch) return 0;

  const [, noteName, octaveStr] = noteMatch;
  const octave = parseInt(octaveStr, 10);

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteIndex = noteNames.indexOf(noteName);

  if (noteIndex === -1) return 0;

  const A4 = 440;
  const halfSteps = (octave * 12 + noteIndex) - 57; // 57 = A4

  return A4 * Math.pow(2, halfSteps / 12);
}
