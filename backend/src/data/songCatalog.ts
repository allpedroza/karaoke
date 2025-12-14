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
  {
    code: '0005',
    song: 'Telefone Mudo',
    artist: 'Roberto Carlos',
    youtubeId: 'nJR1pGpG7n0', // Verificado
    language: 'pt-BR',
  },
  {
    code: '0006',
    song: 'Eva',
    artist: 'Rádio Táxi',
    youtubeId: 'ArQA_uAVPac', // Verificado
    language: 'pt-BR',
  },
  {
    code: '0007',
    song: 'Garçom',
    artist: 'Reginaldo Rossi',
    youtubeId: 'dhDBR7AGVhU', // Verificado
    language: 'pt-BR',
  },
  {
    code: '0008',
    song: 'Várias Queixas',
    artist: 'Gilberto Gil',
    youtubeId: '9LKIlW3DhpY', // Verificado
    language: 'pt-BR',
  },
  {
    code: '0009',
    song: 'Burguesinha',
    artist: 'Seu Jorge',
    youtubeId: 'EfTzWbIN0_M', // Verificado
    language: 'pt-BR',
  },
  {
    code: '0010',
    song: 'Sandra Rosa Madalena',
    artist: 'Sidney Magal',
    youtubeId: 'sk8yiqSR3uI', // Verificado
    language: 'pt-BR',
  },
  {
    code: '0011',
    song: 'Chão de Giz',
    artist: 'Zé Ramalho',
    youtubeId: 'kyLIabrj3Zg', // Verificado
    language: 'pt-BR',
  },
  {
    code: '0012',
    song: 'Vai Lá Vai Lá',
    artist: 'Grupo Revelação',
    youtubeId: 'ek_Kk3uiG0U', // Verificado
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
