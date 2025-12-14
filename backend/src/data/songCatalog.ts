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
  OriginalSongId: string;
  language: 'pt-BR' | 'en' | 'es';
  duration: string;
  genre: string;
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
    OriginalSongId: '0-MSRDgWseE',
    language: 'pt-BR',
    duration: '5:08',
    genre: 'Rock Nacional',
  },
  {
    code: '0002',
    song: 'Evidências',
    artist: 'Chitãozinho e Xororó',
    youtubeId: 'TGXkdU9S0OU', // Verificado
    OriginalSongId: 'etHo9ZOGgdY',
    language: 'pt-BR',
    duration: '4:39',
    genre: 'Sertanejo',
  },
  {
    code: '0003',
    song: 'Você é Linda',
    artist: 'Caetano Veloso',
    youtubeId: 'Fr794p3aG-g', // Verificado
    OriginalSongId: '122xDmxYr8A',
    language: 'pt-BR',
    duration: '4:54',
    genre: 'MPB',
  },
  {
    code: '0004',
    song: 'Quem de Nós Dois',
    artist: 'Ana Carolina',
    youtubeId: '0H820U7Wpu8', // Verificado
    OriginalSongId: 'UgkcQ78tqDo',
    language: 'pt-BR',
    duration: '5:04',
    genre: 'MPB',
  },
  {
    code: '0005',
    song: 'Telefone Mudo',
    artist: 'Trio Parada Dura', // Nota: O ID e a música são clássicos do Trio Parada Dura
    youtubeId: 'nJR1pGpG7n0', // Verificado
    OriginalSongId: 'pq2JKVI6F5s', 
    language: 'pt-BR',
    duration: '3:05',
    genre: 'Sertanejo',
  },
  {
    code: '0006',
    song: 'Eva',
    artist: 'Ivete Sangalo',
    youtubeId: 'ArQA_uAVPac', // Verificado
    OriginalSongId: 'l86drhSgUEU', 
    language: 'pt-BR',
    duration: '4:04',
    genre: 'Axé',
  },
  {
    code: '0007',
    song: 'Garçom',
    artist: 'Reginaldo Rossi',
    youtubeId: 'dhDBR7AGVhU', // Verificado
    OriginalSongId: 'v=mdBnm0pUiYk',
    language: 'pt-BR',
    duration: '4:14',
    genre: 'Brega',
  },
  {
    code: '0008',
    song: 'Várias Queixas',
    artist: 'Os Gilsons',
    youtubeId: '9LKIlW3DhpY', // Verificado
    OriginalSongId: 'bBHPq3UQFsw', 
    language: 'pt-BR',
    duration: '2:47',
    genre: 'MPB',
  },
  {
    code: '0009',
    song: 'Burguesinha',
    artist: 'Seu Jorge',
    youtubeId: 'EfTzWbIN0_M', // Verificado
    OriginalSongId: 'bWSn9jL1g7I',
    language: 'pt-BR',
    duration: '4:09',
    genre: 'Samba Rock',
  },
  {
    code: '0010',
    song: 'Sandra Rosa Madalena',
    artist: 'Sidney Magal',
    youtubeId: 'sk8yiqSR3uI', // Verificado
    OriginalSongId: 'xL6ZHzTvm3g',
    language: 'pt-BR',
    duration: '2:39',
    genre: 'Brega/Pop',
  },
  {
    code: '0011',
    song: 'Chão de Giz',
    artist: 'Zé Ramalho',
    youtubeId: 'kyLIabrj3Zg', // Verificado
    OriginalSongId: 'nL_QNpNOssI',
    language: 'pt-BR',
    duration: '4:45',
    genre: 'MPB',
  },
  {
    code: '0012',
    song: 'Vai Lá Vai Lá',
    artist: 'Grupo Revelação',
    youtubeId: 'ek_Kk3uiG0U', // Verificado
    OriginalSongId: 'MLrezTSZWMA',
    language: 'pt-BR',
    duration: '3:32',
    genre: 'Pagode',
  },
  {
    code: '0013',
    song: 'De zero a cem',
    artist: 'Os Garotin, Anchietx',
    youtubeId: 'qHI5OH7bVm8', // Verificado
    OriginalSongId: 'uuQK2Q16XuQ', 
    language: 'pt-BR',
    duration: '2:48',
    genre: 'Soul/MPB',
  },
   {
    code: '0014',
    song: 'Dezesseis',
    artist: 'Legião Urbana',
    youtubeId: 'kZEiEw-lVV8', // Verificado (Karaokê Club)
    OriginalSongId: 'Or0FflpaOQs',
    language: 'pt-BR',
    duration: '4:38',
    genre: 'Rock Nacional',
  },
  // ============================================
  // MÚSICAS INTERNACIONAIS (códigos 0100-0199)
  // ============================================
  {
    code: '0100',
    song: 'Rehab',
    artist: 'Amy Winehouse',
    youtubeId: 'KS7emVBQ368', // Verificado
    OriginalSongId: 'HoqSO0hAjZw', 
    language: 'en',
    duration: '3:35',
    genre: 'R&B/Soul',
  },
  {
    code: '0101',
    song: 'Feel Good Inc.',
    artist: 'Gorillaz',
    youtubeId: 'uQW9ysQrMCE', // Verificado
    OriginalSongId: 'HyHNuVaZJ-k',
    language: 'en',
    duration: '3:42',
    genre: 'Alternative/Hip Hop',
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
