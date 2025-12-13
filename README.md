# Karaoke AI 🎤

Aplicação de karaokê que utiliza IA generativa para avaliar a performance do cantor.

## Funcionalidades

- 🎬 **Player de Vídeo**: Integração com vídeos de karaokê do YouTube
- 🎙️ **Gravação de Áudio**: Captura a voz do usuário enquanto canta
- 🤖 **Avaliação por IA**: Utiliza Claude (IA generativa) para analisar a performance
- 📊 **Pontuação Detalhada**: Feedback sobre afinação, ritmo e expressão
- 🏆 **Histórico**: Acompanhe sua evolução ao longo do tempo

## Arquitetura

```
karaoke-ai/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # APIs e serviços
│   │   └── types/         # TypeScript types
│   └── ...
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/        # Rotas da API
│   │   ├── services/      # Lógica de negócio
│   │   └── utils/         # Utilitários
│   └── ...
└── package.json       # Workspaces config
```

## Tecnologias

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **IA**: Anthropic Claude API
- **Áudio**: Web Audio API, MediaRecorder API
- **Vídeo**: YouTube IFrame API

## Como Executar

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Chave de API do Anthropic Claude

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp backend/.env.example backend/.env
# Edite o arquivo .env com sua chave de API

# Executar em modo desenvolvimento
npm run dev
```

### Variáveis de Ambiente

```env
ANTHROPIC_API_KEY=sua-chave-aqui
PORT=3001
```

## Como Funciona a Avaliação

1. **Gravação**: O usuário canta junto com o vídeo de karaokê
2. **Transcrição**: O áudio é convertido em texto usando Web Speech API
3. **Análise por IA**: Claude analisa a performance considerando:
   - Precisão da letra (comparação com letra original)
   - Timing e ritmo
   - Expressão e emoção
   - Dicas de melhoria
4. **Feedback**: O usuário recebe pontuação detalhada e sugestões

## Licença

MIT
