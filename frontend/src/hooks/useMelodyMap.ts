import { useState, useEffect, useCallback } from 'react';
import { MelodyMap, MelodyNote } from '../types';
import { getMelodyMap } from '../services/api';

interface UseMelodyMapReturn {
  melodyMap: MelodyMap | null;
  isLoading: boolean;
  error: string | null;
  // Retorna as notas visíveis na janela de tempo atual
  getVisibleNotes: (currentTime: number, windowSize: number) => MelodyNote[];
  // Retorna a nota que deveria estar sendo cantada no momento
  getCurrentNote: (currentTime: number) => MelodyNote | null;
  // Verifica se o melody map está disponível
  isAvailable: boolean;
}

export function useMelodyMap(songCode: string): UseMelodyMapReturn {
  const [melodyMap, setMelodyMap] = useState<MelodyMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchMelodyMap() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getMelodyMap(songCode);

        if (!cancelled) {
          setMelodyMap(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro desconhecido');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchMelodyMap();

    return () => {
      cancelled = true;
    };
  }, [songCode]);

  // Retorna notas visíveis numa janela de tempo
  // windowSize: quantos segundos à frente mostrar
  const getVisibleNotes = useCallback(
    (currentTime: number, windowSize: number): MelodyNote[] => {
      if (!melodyMap || !melodyMap.notes) return [];

      // Mostra notas de 1 segundo antes até windowSize segundos à frente
      const startTime = currentTime - 1;
      const endTime = currentTime + windowSize;

      return melodyMap.notes.filter((note) => {
        const noteEnd = note.time + note.duration;
        // Nota é visível se está dentro da janela
        return noteEnd >= startTime && note.time <= endTime;
      });
    },
    [melodyMap]
  );

  // Retorna a nota atual (que deveria estar sendo cantada)
  const getCurrentNote = useCallback(
    (currentTime: number): MelodyNote | null => {
      if (!melodyMap || !melodyMap.notes) return null;

      // Encontra a nota que está tocando no momento
      return (
        melodyMap.notes.find((note) => {
          const noteEnd = note.time + note.duration;
          return currentTime >= note.time && currentTime <= noteEnd;
        }) || null
      );
    },
    [melodyMap]
  );

  const isAvailable = melodyMap !== null && melodyMap.status === 'ready' && melodyMap.notes.length > 0;

  return {
    melodyMap,
    isLoading,
    error,
    getVisibleNotes,
    getCurrentNote,
    isAvailable,
  };
}
