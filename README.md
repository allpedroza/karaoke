# CantaAI, o seu Karaoke alimentado com IA 🎤

O CantaAI é uma aplicação de karaokê que utiliza IA generativa para avaliar a performance e a animação do cantor. Chega de avaliações aleatórias no seu Karaokê.

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

> **💻 Usuários Windows:** Consulte o guia detalhado de instalação em [INSTALL_WINDOWS.md](./INSTALL_WINDOWS.md)

### Pré-requisitos

- Node.js 18+
- npm (o projeto usa workspaces)
- Chave de API do Anthropic Claude
- Ambiente com suporte a SQLite (o backend usa `better-sqlite3`)

### Instalação e ambiente

```bash
# Instalar dependências (frontend + backend)
npm install

# Configurar variáveis do backend
cp backend/.env.example backend/.env
# Edite backend/.env e defina ANTHROPIC_API_KEY
```

Variáveis importantes do backend:

```env
ANTHROPIC_API_KEY=sua-chave-aqui
PORT=3001
NODE_ENV=development
```

### Banco de dados (SQLite)

O backend agora persiste o histórico de sessões em um banco SQLite local usando `better-sqlite3`. Se o catálogo (`/api/videos/catalog`) não responde, normalmente é porque o binário nativo do `better-sqlite3` falhou na instalação por falta das dependências de compilação do SQLite.

1. **Instale o SQLite + toolchain de build** (necessários para compilar `better-sqlite3`):
   - Ubuntu/Debian: `sudo apt-get update && sudo apt-get install -y sqlite3 libsqlite3-dev build-essential python3`
   - macOS (Homebrew): `brew install sqlite`
   - Windows (WSL): siga os passos do Ubuntu acima.
2. **Reinstale as dependências do projeto** após instalar o SQLite para forçar a compilação do módulo: `rm -rf node_modules && npm install`.
3. **Suba o backend** (`npm run dev:backend`) e verifique no log se não há erro de `better-sqlite3`.

Sobre o arquivo do banco:

- Ele é criado automaticamente em `backend/karaoke.db` na primeira execução, não sendo necessário rodar migrações manuais.
- Garanta permissão de escrita na pasta `backend/` para que a aplicação consiga criar e atualizar o arquivo do banco.
- Para inspecionar ou limpar os dados localmente, use o cliente do SQLite (`sqlite3 backend/karaoke.db`) ou simplesmente remova o arquivo para reiniciar o histórico.
- Em produção, monte um volume persistente apontando para `backend/karaoke.db` para não perder o histórico de pontuações entre deploys.

### Desenvolvimento

```bash
# Sobe frontend e backend em paralelo (porta 5173 e 3001 por padrão)
npm run dev
```

Comandos individuais:

```bash
# Apenas frontend
npm run dev:frontend

# Apenas backend
npm run dev:backend
```

### Build e produção

```bash
# Gera artefatos de build do frontend e transpila o backend para dist/
npm run build

# Após o build, inicia o servidor Express usando o código compilado
npm run start
```

## Endpoints principais do backend

- `GET /api/health`: verificação de status do servidor.
- `POST /api/evaluate`: recebe `songCode`, `transcription` (opcional) e dados de pitch para gerar a avaliação pela IA.
- `GET /api/videos`: catálogo de músicas e vídeos disponíveis para o frontend.

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
