// Catálogo de músicas de karaokê
// Formato: código, música, artista, URL do vídeo de karaokê no YouTube
//
// IMPORTANTE: Apenas adicionar músicas com vídeos de karaokê VERIFICADOS no YouTube
// Para adicionar nova música:
// 1. Buscar no YouTube: "nome da música + karaoke"
// 2. Copiar o ID do vídeo (ex: youtube.com/watch?v=ABC123 → ID = ABC123)
// 3. Adicionar ao catálogo abaixo

export interface KaraokeSong {
  code: string;
  song: string;
  artist: string;
  youtubeId: string;
  language: 'pt-BR' | 'en' | 'es';
}

export const SONG_CATALOG: KaraokeSong[] = [
  // ============================================
  // MÚSICAS BRASILEIRAS (códigos 0001-0099)
  // ============================================
  {
    code: '0001',
    song: 'Pais e Filhos',
    artist: 'Legião Urbana',
    youtubeId: 'G73LBvMd84Q', // Verificado
    language: 'pt-BR',
  },
  {
    code: '0002',
    song: 'Evidências',
    artist: 'Chitãozinho e Xororó',
    youtubeId: 'TGXkdU9S0OU', // Verificado
    language: 'pt-BR',
  },
  {
    code: '0003',
    song: 'Você é Linda',
    artist: 'Caetano Veloso',
    youtubeId: 'Fr794p3aG-g', // Verificado
    language: 'pt-BR',
  },
  {
    code: '0004',
    song: 'Quem de Nós Dois',
    artist: 'Ana Carolina',
    youtubeId: '0H820U7Wpu8', // Verificado
    language: 'pt-BR',
  },

  // ============================================
  // MÚSICAS INTERNACIONAIS (códigos 0100-0199)
  // ============================================
  {
    code: '0100',
    song: 'Rehab',
    artist: 'Amy Winehouse',
    youtubeId: 'KS7emVBQ368', // Verificado
    language: 'en',
  },
];

// Funções auxiliares
export function getSongByCode(code: string): KaraokeSong | undefined {
  return SONG_CATALOG.find(song => song.code === code);
}

export function searchSongs(query: string): KaraokeSong[] {
  const q = query.toLowerCase();
  return SONG_CATALOG.filter(
    song =>
      song.song.toLowerCase().includes(q) ||
      song.artist.toLowerCase().includes(q) ||
      song.code.includes(q)
  );
}

export function getSongsByLanguage(language: KaraokeSong['language']): KaraokeSong[] {
  return SONG_CATALOG.filter(song => song.language === language);
}
