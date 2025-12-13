// Catálogo de músicas de karaokê
// Formato: código, música, artista, URL do vídeo de karaokê no YouTube

export interface KaraokeSong {
  code: string;
  song: string;
  artist: string;
  youtubeId: string;
  language: 'pt-BR' | 'en' | 'es';
}

export const SONG_CATALOG: KaraokeSong[] = [
  // Músicas Brasileiras
  {
    code: '0001',
    song: 'Pais e Filhos',
    artist: 'Legião Urbana',
    youtubeId: 'Pr2ULIk8QSQ',
    language: 'pt-BR',
  },
  {
    code: '0002',
    song: 'Evidências',
    artist: 'Chitãozinho e Xororó',
    youtubeId: 'pXRviuL6vMY',
    language: 'pt-BR',
  },
  {
    code: '0003',
    song: 'Anunciação',
    artist: 'Alceu Valença',
    youtubeId: '1jQFdz0FClE',
    language: 'pt-BR',
  },
  {
    code: '0004',
    song: 'Amor I Love You',
    artist: 'Marisa Monte',
    youtubeId: 'GPLZQ0UKpkw',
    language: 'pt-BR',
  },
  {
    code: '0005',
    song: 'Tocando em Frente',
    artist: 'Almir Sater',
    youtubeId: '7DRPJxMEVN4',
    language: 'pt-BR',
  },
  {
    code: '0006',
    song: 'Trem Bala',
    artist: 'Ana Vilela',
    youtubeId: 'vSCDfFPVFZA',
    language: 'pt-BR',
  },
  {
    code: '0007',
    song: 'Tempo Perdido',
    artist: 'Legião Urbana',
    youtubeId: 'vSCDfFPVFZA',
    language: 'pt-BR',
  },
  {
    code: '0008',
    song: 'O Segundo Sol',
    artist: 'Cássia Eller',
    youtubeId: 'F_cLfmA7PMs',
    language: 'pt-BR',
  },

  // Músicas Internacionais
  {
    code: '0101',
    song: 'Bohemian Rhapsody',
    artist: 'Queen',
    youtubeId: 'fJ9rUzIMcZQ',
    language: 'en',
  },
  {
    code: '0102',
    song: 'Let It Be',
    artist: 'The Beatles',
    youtubeId: 'hbzGGrHLUxw',
    language: 'en',
  },
  {
    code: '0103',
    song: 'Shallow',
    artist: 'Lady Gaga & Bradley Cooper',
    youtubeId: 'YkgkThdzX-8',
    language: 'en',
  },
  {
    code: '0104',
    song: 'Perfect',
    artist: 'Ed Sheeran',
    youtubeId: 'RBumgq5yVrA',
    language: 'en',
  },
  {
    code: '0105',
    song: 'Someone Like You',
    artist: 'Adele',
    youtubeId: '8uD6s-X3590',
    language: 'en',
  },
  {
    code: '0106',
    song: 'Imagine',
    artist: 'John Lennon',
    youtubeId: 'M5azNpTwVk8',
    language: 'en',
  },
  {
    code: '0107',
    song: 'Hotel California',
    artist: 'Eagles',
    youtubeId: 'lrfhf1Gv4Tw',
    language: 'en',
  },
  {
    code: '0108',
    song: 'Sweet Child O Mine',
    artist: "Guns N' Roses",
    youtubeId: 'YkwQbVzY6kQ',
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
