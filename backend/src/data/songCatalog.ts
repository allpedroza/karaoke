export interface KaraokeSong {
  code: string;
  song: string;
  artist: string;
  youtubeId: string;
  OriginalSongId: string | null;
  language: 'pt-BR' | 'en' | 'es';
  duration: string;
  genre: string;
}

export const SONG_CATALOG: KaraokeSong[] = [
  {
    code: '0001',
    song: 'Trem Das Onze',
    artist: 'Adoniran Barbosa',
    youtubeId: 'f3vHCf1pFBQ',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '02:50',
    genre: 'Samba',
  },
  {
    code: '0002',
    song: 'Devolva-me',
    artist: 'Adriana Calcanhotto',
    youtubeId: 'egp2GyPnQdY',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:50',
    genre: 'MPB',
  },
  {
    code: '0003',
    song: 'Mentiras',
    artist: 'Adriana Calcanhotto',
    youtubeId: 'pjAZPO_6L7o',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '02:58',
    genre: 'MPB',
  },
  {
    code: '0004',
    song: "Cryin'",
    artist: 'Aerosmith',
    youtubeId: 'KzTTeFiBEwo',
    OriginalSongId: null,
    language: 'en',
    duration: '05:08',
    genre: 'Rock'
  },
  {
    code: '0005',
    song: 'Dream On',
    artist: 'Aerosmith',
    youtubeId: 'AhXiU4gdUDY',
    OriginalSongId: null,
    language: 'en',
    duration: '04:27',
    genre: 'Rock'
  },
  {
    code: '0006',
    song: 'Anunciação',
    artist: 'Alceu Valença',
    youtubeId: 'ZXiMbZcxDkU',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '02:50',
    genre: 'MPB',
  },
  {
    code: '0007',
    song: 'Coração bobo',
    artist: 'Alceu Valença',
    youtubeId: 'Uj3bC74XaO0',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:10',
    genre: 'MPB'
  },
  {
    code: '0008',
    song: 'Flor de Tangerina',
    artist: 'Alceu Valença',
    youtubeId: 'eJ8JHP5M7ac',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:00',
    genre: 'MPB'
  },
  {
    code: '0009',
    song: 'La Belle de Jour',
    artist: 'Alceu Valença',
    youtubeId: '226V2Y0-fMY',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:20',
    genre: 'MPB'
  },
  {
    code: '0010',
    song: 'A Loba',
    artist: 'Alcione',
    youtubeId: 'pJ0gMD83mbc',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:20',
    genre: 'Samba'
  },
  {
    code: '0011',
    song: 'Não deixe o samba morrer',
    artist: 'Alcione',
    youtubeId: 'D6eJ-jNW8xc',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:30',
    genre: 'Samba',
  },
  {
    code: '0012',
    song: 'Você me vira a cabeça',
    artist: 'Alcione',
    youtubeId: '76foKvqqDas',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Samba'
  },
  {
    code: '0013',
    song: 'Vem me amar',
    artist: 'Alexandre Pires',
    youtubeId: 'P9NIUX99MAo',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'Pagode'
  },
  {
    code: '0014',
    song: 'Conselho',
    artist: 'Almir Guineto',
    youtubeId: 'RVJF4niSb7w',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Samba'
  },
  {
    code: '0015',
    song: 'Rehab',
    artist: 'Amy Winehouse',
    youtubeId: 'KS7emVBQ368',
    OriginalSongId: null,
    language: 'en',
    duration: '3:35',
    genre: 'R&B/Soul'
  },
  {
    code: '0016',
    song: 'Confesso',
    artist: 'Ana Carolina',
    youtubeId: 'TqIpAErQEBg',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'MPB'
  },
  {
    code: '0017',
    song: 'Entre Olhares',
    artist: 'Ana Carolina',
    youtubeId: 'Ewu84IM-0Ho',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'MPB'
  },
  {
    code: '0018',
    song: 'Garganta',
    artist: 'Ana Carolina',
    youtubeId: 'aKvKZNfSDwg',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'MPB'
  },
  {
    code: '0019',
    song: 'Quem de Nós Dois',
    artist: 'Ana Carolina',
    youtubeId: '0H820U7Wpu8',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '5:04',
    genre: 'MPB'
  },
  {
    code: '0020',
    song: 'Trem Bala',
    artist: 'Ana Vilela e Luan Santana',
    youtubeId: '8-rTz4G9BZc',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:00',
    genre: 'Pop',
  },
  {
    code: '0021',
    song: 'Ai, Amor',
    artist: 'Anavitória',
    youtubeId: 'w3stnHSAH_k',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:50',
    genre: 'Pop'
  },
  {
    code: '0022',
    song: 'Trevo (Tu)',
    artist: 'Anavitória',
    youtubeId: 'iI3XfTsECOs',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Pop',
  },
  {
    code: '0023',
    song: 'Mal Acostumado',
    artist: 'Araketu',
    youtubeId: 'XnBjoHnQzFY',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:20',
    genre: 'Axé'
  },
  {
    code: '0024',
    song: 'Cerveja De Garrafa',
    artist: 'Atitude 67',
    youtubeId: 'eB1JTHvOF84',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Pagode'
  },
  {
    code: '0025',
    song: 'A Lua Me Traiu',
    artist: 'Banda Calypso',
    youtubeId: 'PtOHPo3bbG4',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:50',
    genre: 'Calypso'
  },
  {
    code: '0026',
    song: 'O Poeta Está Vivo',
    artist: 'Barão Vermelho',
    youtubeId: 'INLyag7zAzA',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:45',
    genre: 'Rock Nacional'
  },
  {
    code: '0027',
    song: 'Intriga Da Oposição',
    artist: 'Belo',
    youtubeId: 'opwytY8UYB8',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Pagode'
  },
  {
    code: '0028',
    song: 'Perfume',
    artist: 'Belo',
    youtubeId: '-8qAHYxQlHs',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'Pagode'
  },
  {
    code: '0029',
    song: 'Procura-se um Amor',
    artist: 'Belo',
    youtubeId: 'wUlsnUy1P7Y',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Pagode'
  },
  {
    code: '0030',
    song: 'Quem Será',
    artist: 'Belo',
    youtubeId: 'HpwLVOUgb0w',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:10',
    genre: 'Pagode'
  },
  {
    code: '0031',
    song: 'Reinventar',
    artist: 'Belo',
    youtubeId: 'Usi9VIpdV44',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Pagode'
  },
  {
    code: '0032',
    song: 'Tua Boca',
    artist: 'Belo',
    youtubeId: '4c3MGQdgjI4',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Pagode'
  },
  {
    code: '0033',
    song: 'Vi amor no seu olhar',
    artist: 'Belo',
    youtubeId: 'EMG4HWiGkmk',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:15',
    genre: 'Pagode'
  },
  {
    code: '0034',
    song: 'Bad Guy',
    artist: 'Billie Eilish',
    youtubeId: 'GsFlbMS7UIc',
    OriginalSongId: null,
    language: 'en',
    duration: '03:14',
    genre: 'Pop'
  },
  {
    code: '0035',
    song: 'Cerol na mão',
    artist: 'Bonde Do Tigrão',
    youtubeId: 'tc2_9m_zkv0',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '02:50',
    genre: 'Funk'
  },
  {
    code: '0036',
    song: 'O baile todo',
    artist: 'Bonde Do Tigrão',
    youtubeId: 'Iluj1nn6I4s',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:00',
    genre: 'Funk'
  },
  {
    code: '0037',
    song: 'Agarrada a mim',
    artist: 'Bruno e Marrone',
    youtubeId: 'Rd8ECG7KLG4',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Sertanejo'
  },
  {
    code: '0038',
    song: 'Amiga, amante e namorada',
    artist: 'Bruno e Marrone',
    youtubeId: '7tvfqeeIcFQ',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'Sertanejo'
  },
  {
    code: '0039',
    song: 'Favo de mel',
    artist: 'Bruno e Marrone',
    youtubeId: 'nWMh6ahkhjc',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:15',
    genre: 'Sertanejo'
  },
  {
    code: '0040',
    song: 'Ligação Urbana',
    artist: 'Bruno e Marrone',
    youtubeId: '8CZzRnGghPw',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Sertanejo'
  },
  {
    code: '0041',
    song: 'Se Não Tivesse Ido',
    artist: 'Bruno e Marrone',
    youtubeId: 'dKOIB8tvSWs',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:50',
    genre: 'Sertanejo'
  },
  {
    code: '0042',
    song: 'Sonhando',
    artist: 'Bruno e Marrone',
    youtubeId: 'YKBAgOU5cbE',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Sertanejo'
  },
  {
    code: '0043',
    song: 'Vida Vazia',
    artist: 'Bruno e Marrone',
    youtubeId: 'M-QG4GMkL44',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:45',
    genre: 'Sertanejo'
  },
  {
    code: '0044',
    song: 'Eclipse Oculto',
    artist: 'Caetano Veloso',
    youtubeId: 'd4TCMcu8BZM',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'MPB'
  },
  {
    code: '0045',
    song: 'Reconvexo',
    artist: 'Caetano Veloso',
    youtubeId: 'jHI9kGZ35eo',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:10',
    genre: 'MPB'
  },
  {
    code: '0046',
    song: 'Sampa',
    artist: 'Caetano Veloso',
    youtubeId: 'EJ6UTUbhyys',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'MPB'
  },
  {
    code: '0047',
    song: 'Sozinho',
    artist: 'Caetano Veloso',
    youtubeId: '715xFOOYV6c',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'MPB',
  },
  {
    code: '0048',
    song: 'Você é Linda',
    artist: 'Caetano Veloso',
    youtubeId: 'Fr794p3aG-g',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '4:54',
    genre: 'MPB'
  },
  {
    code: '0049',
    song: 'Você Não Me Ensinou a Te Esquecer',
    artist: 'Caetano Veloso',
    youtubeId: 'v2AOA5rIQWI',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:10',
    genre: 'MPB'
  },
  {
    code: '0050',
    song: 'A Sua maneira',
    artist: 'Capital Inicial',
    youtubeId: 'XlELWHoLaZ0',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:10',
    genre: 'Rock Nacional'
  },
  {
    code: '0051',
    song: 'Como Deveria Estar',
    artist: 'Capital Inicial',
    youtubeId: 'HKMg46V_TVE',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:25',
    genre: 'Rock Nacional'
  },
  {
    code: '0052',
    song: 'Independência',
    artist: 'Capital Inicial',
    youtubeId: 'ud6-ZS5WpMY',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'Rock Nacional'
  },
  {
    code: '0053',
    song: 'O Mundo',
    artist: 'Capital Inicial',
    youtubeId: 'lDylWsMIyvA',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Rock Nacional'
  },
  {
    code: '0054',
    song: 'Primeiros Erros',
    artist: 'Capital Inicial',
    youtubeId: 'TDsQiQuxo_o',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:00',
    genre: 'Rock Nacional'
  },
  {
    code: '0055',
    song: 'O Mundo é um Moinho',
    artist: 'Cartola',
    youtubeId: '6vpxWW_78qI',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:00',
    genre: 'Samba'
  },
  {
    code: '0056',
    song: 'All Star',
    artist: 'Cássia Eller',
    youtubeId: 'mnVYAX1eBiQ',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:10',
    genre: 'Rock/MPB'
  },
  {
    code: '0057',
    song: 'Malandragem',
    artist: 'Cássia Eller',
    youtubeId: '3g9ULvFEA1s',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:10',
    genre: 'Rock/MPB'
  },
  {
    code: '0058',
    song: 'Nós',
    artist: 'Cássia Eller',
    youtubeId: 'oA_Dy7EJIdw',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:15',
    genre: 'Rock/MPB'
  },
  {
    code: '0059',
    song: 'Palavras ao Vento',
    artist: 'Cássia Eller',
    youtubeId: '62u0sYsQ0SU',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Rock/MPB'
  },
  {
    code: '0060',
    song: 'Por Enquanto',
    artist: 'Cássia Eller',
    youtubeId: 'LkLGWQ1N12M',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:00',
    genre: 'Rock/MPB'
  },
  {
    code: '0061',
    song: 'Segundo Sol',
    artist: 'Cássia Eller',
    youtubeId: 'ARjyBixTX68',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:15',
    genre: 'Rock/MPB',
  },
  {
    code: '0062',
    song: 'Codinome Beija-Flor',
    artist: 'Cazuza',
    youtubeId: 'K_t2JjT4Oc8',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:00',
    genre: 'Rock Nacional'
  },
  {
    code: '0063',
    song: 'Exagerado',
    artist: 'Cazuza',
    youtubeId: '0sXPSndsfWs',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'Rock Nacional',
  },
  {
    code: '0064',
    song: 'Faz Parte do Meu Show',
    artist: 'Cazuza',
    youtubeId: '3CrvwlarW2o',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:10',
    genre: 'Rock Nacional'
  },
  {
    code: '0065',
    song: 'Ideologia',
    artist: 'Cazuza',
    youtubeId: 'WURLRAKj338',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:05',
    genre: 'Rock Nacional'
  },
  {
    code: '0066',
    song: 'O Tempo Não Pára',
    artist: 'Cazuza',
    youtubeId: '8M95TgTJTXg',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:30',
    genre: 'Rock Nacional',
  },
  {
    code: '0067',
    song: 'Dias De Luta, Dias De Glória',
    artist: 'Charlie Brown Jr',
    youtubeId: 'bgf8sJjmV60',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '02:30',
    genre: 'Rock Nacional'
  },
  {
    code: '0068',
    song: 'Longe De Você',
    artist: 'Charlie Brown Jr',
    youtubeId: 'X0DuTdfp1ok',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Rock Nacional'
  },
  {
    code: '0069',
    song: 'Lutar Pelo Que É Meu',
    artist: 'Charlie Brown Jr',
    youtubeId: 'NbX3oxyRh94',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Rock Nacional'
  },
  {
    code: '0070',
    song: 'ME ENCONTRA',
    artist: 'Charlie Brown Jr',
    youtubeId: 'eyiSrXVTMOA',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Rock Nacional'
  },
  {
    code: '0071',
    song: 'Proibida Pra Mim',
    artist: 'Charlie Brown Jr',
    youtubeId: 'TLPZljMFP4M',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '02:45',
    genre: 'Rock Nacional'
  },
  {
    code: '0072',
    song: 'Senhor do Tempo',
    artist: 'Charlie Brown Jr',
    youtubeId: 'bySJ22BInqA',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Rock Nacional'
  },
  {
    code: '0073',
    song: 'Só Os Loucos Sabem',
    artist: 'Charlie Brown Jr',
    youtubeId: '920HGv3vVjM',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:00',
    genre: 'Rock Nacional'
  },
  {
    code: '0074',
    song: 'Só Por Uma Noite',
    artist: 'Charlie Brown Jr',
    youtubeId: 'q-4S2ORPv70',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Rock Nacional'
  },
  {
    code: '0075',
    song: 'Meu Caro Amigo',
    artist: 'Chico Buarque',
    youtubeId: 'b5NU4Z4mqxI',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:05',
    genre: 'Samba/MPB'
  },
  {
    code: '0076',
    song: 'O que Será',
    artist: 'Chico Buarque',
    youtubeId: 'xYbnBlaNC2c',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '02:40',
    genre: 'MPB'
  },
  {
    code: '0077',
    song: 'Saber Voar',
    artist: 'Chimarruts',
    youtubeId: 'SNrEFrBmPUs',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:15',
    genre: 'Reggae'
  },
  {
    code: '0078',
    song: 'Versos Simples',
    artist: 'Chimarruts',
    youtubeId: 'DnPlJAcXgv8',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Reggae'
  },
  {
    code: '0079',
    song: 'A Mais Bonita das Noites',
    artist: 'Chitãozinho e Xororó',
    youtubeId: '0sau1QJKQnc',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'Sertanejo'
  },
  {
    code: '0080',
    song: 'A Minha Vida',
    artist: 'Chitãozinho e Xororó',
    youtubeId: '9lxRvUYgp1k',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:15',
    genre: 'Sertanejo'
  },
  {
    code: '0081',
    song: 'Evidências',
    artist: 'Chitãozinho e Xororó',
    youtubeId: 'TGXkdU9S0OU',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '4:39',
    genre: 'Sertanejo',
  },
  {
    code: '0082',
    song: 'Frete',
    artist: 'Chitãozinho e Xororó',
    youtubeId: 'm8euaSUSAKI',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:15',
    genre: 'Sertanejo'
  },
  {
    code: '0083',
    song: 'Galinhada',
    artist: 'Chitãozinho e Xororó',
    youtubeId: 'wms3KZYD8YQ',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:00',
    genre: 'Sertanejo'
  },
  {
    code: '0084',
    song: 'Pensando em minha amada',
    artist: 'Chitãozinho e Xororó',
    youtubeId: 'hpgdKAsKmI0',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Sertanejo'
  },
  {
    code: '0085',
    song: 'Pra Emoção',
    artist: 'Chitãozinho e Xororó',
    youtubeId: '8jVN3lyybOA',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Sertanejo'
  },
  {
    code: '0086',
    song: 'Um, dois, três',
    artist: 'Chitãozinho e Xororó',
    youtubeId: '9rgqa8N0lJw',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Sertanejo'
  },
  {
    code: '0087',
    song: 'Balancinho',
    artist: 'Claudia Leitte',
    youtubeId: 'b88CB3IZ5hs',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:10',
    genre: 'Pop'
  },
  {
    code: '0088',
    song: 'De Passagem',
    artist: 'Claudia Leitte',
    youtubeId: '44cQkwRdomo',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Pop'
  },
  {
    code: '0089',
    song: 'Pensando em você',
    artist: 'Claudia Leitte',
    youtubeId: 'NoxKk8NZwDI',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:45',
    genre: 'Pop'
  },
  {
    code: '0090',
    song: 'Bolo Doido',
    artist: 'Claudia Leitte - Ivete Sangalo',
    youtubeId: 'dy3C_qIbym8',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Axé'
  },
  {
    code: '0091',
    song: 'Fico Assim Sem Você',
    artist: 'Claudinho e Buchecha',
    youtubeId: 'z9As78sHpFI',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'Funk',
  },
  {
    code: '0092',
    song: 'Nosso Sonho',
    artist: 'Claudinho e Buchecha',
    youtubeId: '44vcvQuMCss',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:00',
    genre: 'Funk'
  },
  {
    code: '0093',
    song: 'Quero Te Encontrar',
    artist: 'Claudinho e Buchecha',
    youtubeId: 'hg4rNn6eSmU',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:50',
    genre: 'Funk'
  },
  {
    code: '0094',
    song: 'Dias Atrás',
    artist: 'Cpm22',
    youtubeId: 'ZaNjw8TOGdg',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Rock Nacional'
  },
  {
    code: '0095',
    song: 'Um Minuto Para O Fim Do Mundo',
    artist: 'Cpm22',
    youtubeId: 'Pm8_RsueSr4',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Rock Nacional'
  },
  {
    code: '0096',
    song: 'O Dia Que Não Terminou',
    artist: 'Detonautas',
    youtubeId: 'YwxYd6-FVOU',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:10',
    genre: 'Rock Nacional'
  },
  {
    code: '0097',
    song: 'Olhos Certos',
    artist: 'Detonautas',
    youtubeId: 'bXS5yq74agU',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:50',
    genre: 'Rock Nacional'
  },
  {
    code: '0098',
    song: 'Energia Surreal',
    artist: 'Dilsinho',
    youtubeId: 'dZxJTlktv5o',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:00',
    genre: 'Pagode'
  },
  {
    code: '0099',
    song: 'Péssimo Negócio',
    artist: 'Dilsinho',
    youtubeId: '-TGQ_2KvHfM',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:10',
    genre: 'Pagode'
  },
  {
    code: '0100',
    song: 'Refém',
    artist: 'Dilsinho',
    youtubeId: 'Ou4F_be-BZg',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Pagode'
  },
  {
    code: '0101',
    song: 'Trovão',
    artist: 'Dilsinho',
    youtubeId: 'pCF-OlEeuNI',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:15',
    genre: 'Pagode'
  },
  {
    code: '0102',
    song: 'Pouco a pouco',
    artist: 'Dilsinho feat. Sorriso Maroto',
    youtubeId: '0syWKrmJHQ4',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:10',
    genre: 'Pagode'
  },
  {
    code: '0103',
    song: 'Espelho',
    artist: 'Diogo Nogueira',
    youtubeId: 'ZXgW8E6gRlo',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Samba'
  },
  {
    code: '0104',
    song: 'Nó na Madeira',
    artist: 'Diogo Nogueira',
    youtubeId: 'CSYv9t7wbp4',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Samba'
  },
  {
    code: '0105',
    song: 'Açaí',
    artist: 'Djavan',
    youtubeId: 'RUfEaUn4zU0',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:40',
    genre: 'MPB'
  },
  {
    code: '0106',
    song: 'Avião',
    artist: 'Djavan',
    youtubeId: 'ngxLWNFiTdc',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:50',
    genre: 'MPB'
  },
  {
    code: '0107',
    song: 'Eu te Devoro',
    artist: 'Djavan',
    youtubeId: '_IumX_rdlWQ',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:00',
    genre: 'MPB'
  },
  {
    code: '0108',
    song: 'Linha do Equator',
    artist: 'Djavan',
    youtubeId: 'iPwGLxj883k',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:30',
    genre: 'MPB'
  },
  {
    code: '0109',
    song: 'Meu Bem Querer',
    artist: 'Djavan',
    youtubeId: 'XEVzeE4bsDw',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'MPB'
  },
  {
    code: '0110',
    song: 'Nem Um Dia',
    artist: 'Djavan',
    youtubeId: '8R2RNqyEjb4',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:15',
    genre: 'MPB'
  },
  {
    code: '0111',
    song: 'Pétala',
    artist: 'Djavan',
    youtubeId: 'Kb0N2ts4_R4',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:45',
    genre: 'MPB'
  },
  {
    code: '0112',
    song: 'Samurai',
    artist: 'Djavan',
    youtubeId: 'T6yV5Ea5PzI',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:50',
    genre: 'MPB'
  },
  {
    code: '0113',
    song: 'Sina',
    artist: 'Djavan',
    youtubeId: 'L6jxeiKutCI',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '05:30',
    genre: 'MPB'
  },
  {
    code: '0114',
    song: 'Eu só Quero um Xodó',
    artist: 'Dominguinhos',
    youtubeId: 'sF1F6GS0ngs',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:00',
    genre: 'Forró'
  },
  {
    code: '0115',
    song: 'Colombiana',
    artist: 'Ed Motta',
    youtubeId: '2YqN_uddUAs',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'MPB'
  },
  {
    code: '0116',
    song: 'AmarElo',
    artist: 'Emicida, Majur e Pabllo Vittar',
    youtubeId: 'X7PUrEPUpes',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '05:20',
    genre: 'Rap/Pop'
  },
  {
    code: '0117',
    song: 'Logo Agora',
    artist: 'Emílio Santiago',
    youtubeId: 'iUq8ISv2Eg8',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:20',
    genre: 'MPB'
  },
  {
    code: '0118',
    song: 'Saigon',
    artist: 'Emílio Santiago',
    youtubeId: 'RI1o66SpFYc',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '05:00',
    genre: 'MPB'
  },
  {
    code: '0119',
    song: 'Verdade Chinesa',
    artist: 'Emílio Santiago',
    youtubeId: 'baUYYJAzq_w',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:50',
    genre: 'MPB'
  },
  {
    code: '0120',
    song: 'Borbulhas de Amor',
    artist: 'Fagner',
    youtubeId: '7GyrUOwzrq4',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:50',
    genre: 'MPB'
  },
  {
    code: '0121',
    song: 'Canteiros',
    artist: 'Fagner',
    youtubeId: 's_8o6g_ga5U',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:30',
    genre: 'MPB'
  },
  {
    code: '0122',
    song: 'A Amizade',
    artist: 'Fundo de Quintal',
    youtubeId: 'FiC_QK-YPRU',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'Samba'
  },
  {
    code: '0123',
    song: 'A Batucada dos Nossos Tantãs',
    artist: 'Fundo de Quintal',
    youtubeId: 'uEILSM_sQ5E',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Samba'
  },
  {
    code: '0124',
    song: 'Lucidez',
    artist: 'Fundo de Quintal',
    youtubeId: 'kP8J7F-gQA4',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:50',
    genre: 'Samba'
  },
  {
    code: '0125',
    song: 'Drão',
    artist: 'Gilberto Gil',
    youtubeId: 'i20_SlyFeg0',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:10',
    genre: 'MPB'
  },
  {
    code: '0126',
    song: 'Esperando na Janela',
    artist: 'Gilberto Gil',
    youtubeId: 'PMY2-3CQ8I8',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:20',
    genre: 'Forró/MPB'
  },
  {
    code: '0127',
    song: 'Tempo Rei',
    artist: 'Gilberto Gil',
    youtubeId: 'RsUt7TLSdCU',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:00',
    genre: 'MPB'
  },
  {
    code: '0128',
    song: 'Feel Good Inc.',
    artist: 'Gorillaz',
    youtubeId: 'uQW9ysQrMCE',
    OriginalSongId: null,
    language: 'en',
    duration: '3:42',
    genre: 'Alternative/Hip Hop'
  },
  {
    code: '0129',
    song: 'P de Pecado',
    artist: 'Grupo Menos é Mais',
    youtubeId: 'd_A5_bEHt5k',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:00',
    genre: 'Pagode'
  },
  {
    code: '0130',
    song: 'Pela Última Vez',
    artist: 'Grupo Menos é Mais',
    youtubeId: 'pRfQBKSLVZM',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:10',
    genre: 'Pagode'
  },
  {
    code: '0131',
    song: 'Baixa essa Guarda',
    artist: 'Grupo Revelação',
    youtubeId: 'Xw2JlO6lEEY',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:25',
    genre: 'Pagode'
  },
  {
    code: '0132',
    song: 'Deixa Alagar',
    artist: 'Grupo Revelação',
    youtubeId: 'J3yM5gD_yb8',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'Pagode'
  },
  {
    code: '0133',
    song: 'Talvez',
    artist: 'Grupo Revelação',
    youtubeId: 'K10GbjV2Ns8',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Pagode'
  },
  {
    code: '0134',
    song: 'Vai Lá Vai Lá',
    artist: 'Grupo Revelação',
    youtubeId: 'ek_Kk3uiG0U',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '3:32',
    genre: 'Pagode'
  },
  {
    code: '0135',
    song: 'Tarde Vazia',
    artist: 'Ira!',
    youtubeId: 'AbJwSJ7Q2pQ',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:20',
    genre: 'Rock Nacional'
  },
  {
    code: '0136',
    song: 'Eva',
    artist: 'Ivete Sangalo',
    youtubeId: 'ArQA_uAVPac',
    OriginalSongId: Null,
    language: 'pt-BR',
    duration: '4:04',
    genre: 'Axé',
  },
  {
    code: '0137',
    song: 'Não precisa Mudar',
    artist: 'Ivete Sangalo',
    youtubeId: '3I_ljnQZ4g0',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'Axé'
  },
  {
    code: '0138',
    song: 'Ginga',
    artist: 'Iza',
    youtubeId: '3XHKEztH8Rc',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:00',
    genre: 'Pop'
  },
  {
    code: '0139',
    song: 'Pesadão',
    artist: 'Iza e Marcelo Falcão',
    youtubeId: 'rTywHjY221U',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Pop'
  },
  {
    code: '0140',
    song: 'Abuso de Poder',
    artist: 'Jorge Aragão',
    youtubeId: '4vgefthGz_Q',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Samba'
  },
  {
    code: '0141',
    song: 'Coisa de Pele',
    artist: 'Jorge Aragão',
    youtubeId: 'yXmVQm6t-ms',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Samba'
  },
  {
    code: '0142',
    song: 'Dias Melhores',
    artist: 'Jota Quest',
    youtubeId: 'YfLXvDlV4dE',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:50',
    genre: 'Pop Rock'
  },
  {
    code: '0143',
    song: 'O Sol',
    artist: 'Jota Quest',
    youtubeId: 'UI5j53hsaT8',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'Pop Rock'
  },
  {
    code: '0144',
    song: 'Palavras de um Futuro Bom',
    artist: 'Jota Quest',
    youtubeId: 'rsTNf86nwm8',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Pop Rock'
  },
  {
    code: '0145',
    song: 'Um dia para Não Esquecer',
    artist: 'Jota Quest',
    youtubeId: 'Mc5PtKs4Imo',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:45',
    genre: 'Pop Rock'
  },
  {
    code: '0146',
    song: 'Pintura Íntima',
    artist: 'Kid Abelha',
    youtubeId: 'hmwkRCFjs3Y',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:50',
    genre: 'Pop Rock'
  },
  {
    code: '0147',
    song: 'Oi',
    artist: 'Lagum',
    youtubeId: 't6cJ-EhK5dA',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:00',
    genre: 'Pop'
  },
  {
    code: '0148',
    song: 'Morango do Nordeste',
    artist: 'Lairton e seus Teclados',
    youtubeId: 'fsABdCHtVB8',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:00',
    genre: 'Brega/Forró'
  },
  {
    code: '0149',
    song: 'Isso é Fundo de Quintal',
    artist: 'Leci Brandão',
    youtubeId: 'bzjQYMBYHDk',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Samba'
  },
  {
    code: '0150',
    song: 'Dezesseis',
    artist: 'Legião Urbana',
    youtubeId: 'kZEiEw-lVV8',
    OriginalSongId: Null,
    language: 'pt-BR',
    duration: '4:38',
    genre: 'Rock Nacional'
  },
  {
    code: '0151',
    song: 'Pais e Filhos',
    artist: 'Legião Urbana',
    youtubeId: 'G73LBvMd84Q',
    OriginalSongId: Null,
    language: 'pt-BR',
    duration: '5:08',
    genre: 'Rock Nacional',
  },
  {
    code: '0152',
    song: 'Será',
    artist: 'Legião Urbana',
    youtubeId: 'SbDnL_YdQyw',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '02:40',
    genre: 'Rock Nacional'
  },
  {
    code: '0153',
    song: 'Zona de Perigo',
    artist: 'Léo Santana',
    youtubeId: 'X6syAPNDkRg',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '02:50',
    genre: 'Axé'
  },
  {
    code: '0154',
    song: 'Asa Branca',
    artist: 'Luiz Gonzaga',
    youtubeId: 'HO8AZPOrJqQ',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Forró',
  },
  {
    code: '0155',
    song: 'Numa sala de Reboco',
    artist: 'Luiz Gonzaga',
    youtubeId: 'ARGeAFVE0O0',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:00',
    genre: 'Forró'
  },
  {
    code: '0156',
    song: 'Assim Caminha a Humanidade',
    artist: 'Lulu Santos',
    youtubeId: 'p5HX6BMj3uo',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Pop Rock'
  },
  {
    code: '0157',
    song: "Bois Don't Cry",
    artist: 'Mamonas Assassinas',
    youtubeId: 'YcrpUhv--4k',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:00',
    genre: 'Rock Cômico'
  },
  {
    code: '0158',
    song: 'Brasília Amarela',
    artist: 'Mamonas Assassinas',
    youtubeId: 'VYguXLoT7Hw',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:10',
    genre: 'Rock Cômico'
  },
  {
    code: '0159',
    song: 'Lá Vem o Alemão',
    artist: 'Mamonas Assassinas',
    youtubeId: 'mQYKcTpfF7I',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Rock Cômico'
  },
  {
    code: '0160',
    song: 'Mundo Animal',
    artist: 'Mamonas Assassinas',
    youtubeId: 'AW8QqmCHBac',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:50',
    genre: 'Rock Cômico'
  },
  {
    code: '0161',
    song: 'Vira - Vira',
    artist: 'Mamonas Assassinas',
    youtubeId: 'tgQWn7LslP8',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '02:40',
    genre: 'Rock Cômico'
  },
  {
    code: '0162',
    song: 'Fera Ferida',
    artist: 'Maria Bethânia',
    youtubeId: '19qFkYmP894',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:00',
    genre: 'MPB'
  },
  {
    code: '0163',
    song: 'Negue',
    artist: 'Maria Bethânia',
    youtubeId: 'dtarIPbU5K8',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'MPB'
  },
  {
    code: '0164',
    song: 'Tá perdoado',
    artist: 'Maria Rita',
    youtubeId: 'OX3_ck5LPHg',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'MPB'
  },
  {
    code: '0165',
    song: 'Eu sei de Cor',
    artist: 'Marília Mendonça',
    youtubeId: 'ZcFLjkw3Ly4',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:05',
    genre: 'Sertanejo'
  },
  {
    code: '0166',
    song: 'Ainda Bem',
    artist: 'Marisa Monte',
    youtubeId: 'uqnE_uB0gTo',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'MPB'
  },
  {
    code: '0167',
    song: 'Cabide',
    artist: "Mart'nália",
    youtubeId: '5jzKcGy_Hr8',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:00',
    genre: 'Samba'
  },
  {
    code: '0168',
    song: 'Minha Cura',
    artist: 'MC Cabelinho',
    youtubeId: 'Emr_DoK1IsU',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '02:36',
    genre: 'Rap/Funk'
  },
  {
    code: '0169',
    song: 'Garota Nota 100',
    artist: 'MC Marcinho',
    youtubeId: 'dKpVuuKcugs',
    OriginalSongId: Null,
    language: 'pt-BR',
    duration: '3:52',
    genre: 'Funk Melody'
  },
  {
    code: '0170',
    song: 'Glamurosa',
    artist: 'MC Marcinho',
    youtubeId: 'd6U1MbLMDVw',
    OriginalSongId: Null,
    language: 'pt-BR',
    duration: '3:41',
    genre: 'Funk Melody'
  },
  {
    code: '0171',
    song: 'Princesa',
    artist: 'MC Marcinho',
    youtubeId: 'ndVU9blYYF8',
    OriginalSongId: Null,
    language: 'pt-BR',
    duration: '4:05',
    genre: 'Funk Melody'
  },
  {
    code: '0172',
    song: 'Rap do Solitário',
    artist: 'MC Marcinho',
    youtubeId: 'qfgFJHj3vSI',
    OriginalSongId: Null,
    language: 'pt-BR',
    duration: '3:55',
    genre: 'Funk Melody'
  },
  {
    code: '0173',
    song: 'Tudo é Festa',
    artist: 'MC Marcinho',
    youtubeId: 'pd9LB3Kz1Ug',
    OriginalSongId: Null,
    language: 'pt-BR',
    duration: '3:34',
    genre: 'Funk Melody'
  },
  {
    code: '0174',
    song: 'N',
    artist: 'Nando Reis',
    youtubeId: 'jpR3bZBrcbA',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:15',
    genre: 'Rock/Pop'
  },
  {
    code: '0175',
    song: 'Por Onde Andei',
    artist: 'Nando Reis',
    youtubeId: '83s8KnJNfNg',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:00',
    genre: 'Rock/Pop'
  },
  {
    code: '0176',
    song: 'Naquela Mesa',
    artist: 'Nelson Gonçalves',
    youtubeId: '6D1VoN4KhuA',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:10',
    genre: 'MPB/Seresta'
  },
  {
    code: '0177',
    song: 'Na frente do Reto',
    artist: 'O Rappa',
    youtubeId: 'wxSqG1oYrhc',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:10',
    genre: 'Rock Nacional'
  },
  {
    code: '0178',
    song: 'Pescador de Ilusões',
    artist: 'O Rappa',
    youtubeId: 'YdCz_D7W2ec',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:00',
    genre: 'Rock Nacional'
  },
  {
    code: '0179',
    song: 'De zero a cem',
    artist: 'Os Garotin, Anchietx',
    youtubeId: 'qHI5OH7bVm8',
    OriginalSongId: Null,
    language: 'pt-BR',
    duration: '2:48',
    genre: 'Soul/MPB'
  },
  {
    code: '0180',
    song: 'Várias Queixas',
    artist: 'Os Gilsons',
    youtubeId: '9LKIlW3DhpY',
    OriginalSongId: Null,
    language: 'pt-BR',
    duration: '2:47',
    genre: 'MPB'
  },
  {
    code: '0181',
    song: 'Marrom Bombom',
    artist: 'Os Morenos',
    youtubeId: 'o87fyvVLCM0',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:00',
    genre: 'Pagode'
  },
  {
    code: '0182',
    song: 'Mina de Fé',
    artist: 'Os Morenos',
    youtubeId: 'JPql7KGW4dA',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:50',
    genre: 'Pagode'
  },
  {
    code: '0183',
    song: 'Lanterna dos Afogados',
    artist: 'Paralamas do Sucesso',
    youtubeId: 'L9mk91p4FGY',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:30',
    genre: 'Rock Nacional'
  },
  {
    code: '0184',
    song: 'Equalize',
    artist: 'Pitty',
    youtubeId: 'ZaJ5p5JkN_8',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:45',
    genre: 'Rock Nacional'
  },
  {
    code: '0185',
    song: 'Cheia de Manias',
    artist: 'Raça Negra',
    youtubeId: 'yeCEuGAoiGk',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Pagode',
  },
  {
    code: '0186',
    song: 'É Tarde Demais',
    artist: 'Raça Negra',
    youtubeId: 'GBRLY5DnL3M',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:50',
    genre: 'Pagode'
  },
  {
    code: '0187',
    song: 'Garçom',
    artist: 'Reginaldo Rossi',
    youtubeId: 'dhDBR7AGVhU',
    OriginalSongId: Null,
    language: 'pt-BR',
    duration: '4:14',
    genre: 'Brega'
  },
  {
    code: '0188',
    song: 'Ela é Demais',
    artist: 'Rick e Renner',
    youtubeId: '9A1Ab6JHJEo',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Sertanejo'
  },
  {
    code: '0189',
    song: 'De Janeiro a Janeiro',
    artist: 'Roberta Campos e Nando Reis',
    youtubeId: 'IIEUAksxE5s',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:10',
    genre: 'MPB'
  },
  {
    code: '0190',
    song: 'Para sempre vou te Amar',
    artist: 'Robson Monteiro',
    youtubeId: 'xq5byVy4VyU',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:00',
    genre: 'Gospel'
  },
  {
    code: '0191',
    song: 'Olhos Coloridos',
    artist: 'Sandra de Sá',
    youtubeId: 'AqHOwBsQEuo',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:50',
    genre: 'Soul/Funk'
  },
  {
    code: '0192',
    song: 'Burguesinha',
    artist: 'Seu Jorge',
    youtubeId: 'EfTzWbIN0_M',
    OriginalSongId: Null,
    language: 'pt-BR',
    duration: '4:09',
    genre: 'Samba Rock'
  },
  {
    code: '0193',
    song: 'Sandra Rosa Madalena',
    artist: 'Sidney Magal',
    youtubeId: 'sk8yiqSR3uI',
    OriginalSongId: Null,
    language: 'pt-BR',
    duration: '2:39',
    genre: 'Brega/Pop'
  },
  {
    code: '0194',
    song: 'Dois Rios',
    artist: 'Skank',
    youtubeId: 'l9MwWbduGSI',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:30',
    genre: 'Pop Rock'
  },
  {
    code: '0195',
    song: 'Sutilmente',
    artist: 'Skank',
    youtubeId: 'gvaoaJgFsY0',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:00',
    genre: 'Pop Rock'
  },
  {
    code: '0196',
    song: 'Depois Do Prazer',
    artist: 'Só Pra Contrariar',
    youtubeId: 'CMhixcunzmQ',
    OriginalSongId: Null,
    language: 'pt-BR',
    duration: '04:15',
    genre: 'Pagode'
  },
  {
    code: '0197',
    song: 'Essa Tal Liberdade',
    artist: 'Só Pra Contrariar',
    youtubeId: 'PnVlFAzNix4',
    OriginalSongId: Null,
    language: 'pt-BR',
    duration: '04:20',
    genre: 'Pagode'
  },
  {
    code: '0198',
    song: 'Que Se Chama Amor',
    artist: 'Só Pra Contrariar',
    youtubeId: '4YYgrtGmikE',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:00',
    genre: 'Pagode'
  },
  {
    code: '0199',
    song: 'Sai Da Minha Aba',
    artist: 'Só Pra Contrariar',
    youtubeId: '7kmKCWKk4Vc',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'Pagode'
  },
  {
    code: '0200',
    song: 'Me Perdoa',
    artist: 'Só Pra Contrariar',
    youtubeId: 'jmFm6nibNbs',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:50',
    genre: 'Pagode'
  },
  {
    code: '0201',
    song: 'Vai Voltar para Mim',
    artist: 'Só Pra Contrariar',
    youtubeId: 'e0sFTbO0ooM',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Pagode'
  },
  {
    code: '0202',
    song: 'Brigas por Nada',
    artist: 'Sorriso Maroto',
    youtubeId: 'oOOz9IgU_sk',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:10',
    genre: 'Pagode'
  },
  {
    code: '0203',
    song: 'Me Olha nos Olhos',
    artist: 'Sorriso Maroto',
    youtubeId: 'adyoTXmY-Ds',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:25',
    genre: 'Pagode'
  },
  {
    code: '0204',
    song: 'Por Você',
    artist: 'Sorriso Maroto',
    youtubeId: 'HM3k_ZeMWBs',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:15',
    genre: 'Pagode'
  },
  {
    code: '0205',
    song: 'Ainda Bem',
    artist: 'Thiaguinho',
    youtubeId: '2FMFjU4cVfA',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'Pagode'
  },
  {
    code: '0206',
    song: 'Deixa Tudo Como Tá',
    artist: 'Thiaguinho',
    youtubeId: 'YdGRGw3w6Hs',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:50',
    genre: 'Pagode'
  },
  {
    code: '0207',
    song: 'Essa Tal Liberdade/Me Leva Junto Com Você',
    artist: 'Thiaguinho',
    youtubeId: 'KH9JugOG10s',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:00',
    genre: 'Pagode'
  },
  {
    code: '0208',
    song: 'Valeu/Livre pra Voar',
    artist: 'Thiaguinho',
    youtubeId: 'GrOcKiDPItE',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:10',
    genre: 'Pagode'
  },
  {
    code: '0209',
    song: 'Azul da Cor do Mar',
    artist: 'Tim Maia',
    youtubeId: 'MGAn1Tby0fs',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:50',
    genre: 'Soul',
  },
  {
    code: '0210',
    song: 'Gostava Tanto de Você',
    artist: 'Tim Maia',
    youtubeId: '7putpGCDV4o',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Soul'
  },
  {
    code: '0211',
    song: 'Não Quero Dinheiro',
    artist: 'Tim Maia',
    youtubeId: '5eJwf_k68r8',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '02:50',
    genre: 'Soul'
  },
  {
    code: '0212',
    song: 'Telefone Mudo',
    artist: 'Trio Parada Dura',
    youtubeId: 'nJR1pGpG7n0',
    OriginalSongId: Null,
    language: 'pt-BR',
    duration: '3:05',
    genre: 'Sertanejo'
  },
  {
    code: '0213',
    song: 'Ainda Bem',
    artist: 'Vanessa da Mata',
    youtubeId: 'YpLBBa2TIGA',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'MPB'
  },
  {
    code: '0214',
    song: 'O Sol',
    artist: 'Victor Kley',
    youtubeId: 'HJOAonnm7LE',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Pop'
  },
  {
    code: '0215',
    song: 'Onde Anda Você',
    artist: 'Vinicius de Moraes e Toquinho',
    youtubeId: '0weJTQHDv3o',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Bossa Nova/MPB'
  },
  {
    code: '0216',
    song: 'A Prova de Balas',
    artist: 'VMZ',
    youtubeId: 'HgfDG7FMUhA',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:00',
    genre: 'Sad Station/Rap'
  },
  {
    code: '0217',
    song: 'Fogo e Paixão',
    artist: 'Wando',
    youtubeId: 'jlvxQJfdYLI',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'Brega'
  },
  {
    code: '0218',
    song: 'O Samba é Meu Dom',
    artist: 'Wilson das Neves',
    youtubeId: 'CubVwMogvV0',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:00',
    genre: 'Samba'
  },
  {
    code: '0219',
    song: 'Lenha',
    artist: 'Zeca Baleiro',
    youtubeId: 'gYEhgIpOI5k',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:40',
    genre: 'MPB'
  },
  {
    code: '0220',
    song: 'Telegrama',
    artist: 'Zeca Baleiro',
    youtubeId: 'HxjuJFFszPU',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:10',
    genre: 'MPB'
  },
  {
    code: '0221',
    song: 'Coração em Desalinho',
    artist: 'Zeca Pagodinho',
    youtubeId: 'BprLN6d2oBg',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'Samba'
  },
  {
    code: '0222',
    song: 'Deixa a Vida Me Levar',
    artist: 'Zeca Pagodinho',
    youtubeId: '4UcMQcVHnS4',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:00',
    genre: 'Samba',
  },
  {
    code: '0223',
    song: 'Catedral',
    artist: 'Zélia Duncan',
    youtubeId: 's266ebC_xlQ',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:20',
    genre: 'MPB/Pop'
  },
  {
    code: '0224',
    song: 'Admirável Gado Novo',
    artist: 'Zé Ramalho e Fagner',
    youtubeId: '0FRmpckRdjA',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:50',
    genre: 'MPB'
  },
  {
    code: '0225',
    song: 'Avohai',
    artist: 'Zé Ramalho',
    youtubeId: 'FR-9N4FhC_Y',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '04:40',
    genre: 'MPB'
  },
  {
    code: '0226',
    song: 'Chão de Giz',
    artist: 'Zé Ramalho',
    youtubeId: 'kyLIabrj3Zg',
    OriginalSongId: Null,
    language: 'pt-BR',
    duration: '4:45',
    genre: 'MPB'
  },
  {
    code: '0227',
    song: 'Mistérios da Meia Noite',
    artist: 'Zé Ramalho',
    youtubeId: 'cKHpfeyGx3c',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'MPB'
  },
  {
    code: '0228',
    song: 'Preciso Desabafar',
    artist: 'Exaltasamba',
    youtubeId: '5Pu6c14XBt0',
    OriginalSongId: null,
    language: 'pt-BR',
    duration: '03:30',
    genre: 'Pagode'
  }
];

// Funções auxiliares
export function getSongByCode(code: string): KaraokeSong | undefined {
  return SONG_CATALOG.find(song => song.code === code);
}

const LANGUAGE_KEYWORDS: Record<KaraokeSong['language'], string[]> = {
  'pt-BR': ['pt', 'ptbr', 'pt-br', 'br', 'portugues', 'portuguesa', 'portuguese', 'brasileiro', 'brasileira'],
  en: ['en', 'eng', 'ingles', 'inglesa', 'english'],
  es: ['es', 'esp', 'espanhol', 'espanhois', 'espanol', 'espanola', 'español', 'española', 'spanish'],
};

const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/[\u0300-\u036f]/g, '');

export function searchSongs(query: string): KaraokeSong[] {
  const normalizedQuery = normalize(query);

  return SONG_CATALOG.filter((song) => {
    const titleMatch = normalize(song.song).includes(normalizedQuery);
    const artistMatch = normalize(song.artist).includes(normalizedQuery);
    const genreMatch = normalize(song.genre).includes(normalizedQuery);
    const codeMatch = song.code.includes(query.trim());

    const languageKeywords = LANGUAGE_KEYWORDS[song.language];
    const languageMatch = languageKeywords.some((keyword) =>
      normalizedQuery === keyword ||
      normalizedQuery.includes(keyword) ||
      keyword.includes(normalizedQuery)
    );

    return titleMatch || artistMatch || codeMatch || genreMatch || languageMatch;
  });
}

export function getSongsByLanguage(language: KaraokeSong['language']): KaraokeSong[] {
  return SONG_CATALOG.filter(song => song.language === language);
}
