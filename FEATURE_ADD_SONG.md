# Feature: Adicionar Nova Música ao Catálogo

## 📋 Resumo

Esta feature adiciona um sistema completo para inserção de novas músicas ao portfólio do karaokê, seguindo a identidade visual da plataforma e suportando os temas claro e escuro.

## ✨ Funcionalidades Implementadas

### 1. **Componente AddSongModal** (`frontend/src/components/AddSongModal.tsx`)
- ✅ Modal responsivo com formulário completo de inserção
- ✅ Validação em tempo real de todos os campos
- ✅ Auto-geração do título completo (Artista - Música)
- ✅ Campos implementados:
  - ID do YouTube (com validação de 11 caracteres)
  - Nome do artista
  - Nome da música
  - Idioma (Português 🇧🇷, English 🇺🇸, Español 🇪🇸)
  - Gênero musical
  - Duração (formato MM:SS)
- ✅ Exibição do próximo código disponível
- ✅ Mensagens de erro contextuais
- ✅ Suporte completo aos temas claro e escuro

### 2. **Backend API** (`backend/src/routes/videos.ts` e `backend/src/data/songCatalog.ts`)
- ✅ Endpoint `GET /api/videos/next-code` - Retorna o próximo código disponível
- ✅ Endpoint `POST /api/videos/add` - Adiciona nova música ao catálogo
- ✅ Validações completas:
  - Formato do YouTube ID
  - Formato de duração (MM:SS)
  - Idioma válido (pt-BR, en, es)
  - Verificação de duplicatas
- ✅ Funções auxiliares:
  - `getNextCode()` - Calcula próximo código sequencial
  - `addSongToCatalog()` - Adiciona música ao array e persiste no arquivo
- ✅ Persistência automática no arquivo `songCatalog.ts`

### 3. **Integração com Header** (`frontend/src/components/Header.tsx`)
- ✅ Botão "Adicionar Música" com ícone Plus
- ✅ Responsivo (texto oculto em mobile)
- ✅ Estilo gradiente verde (verde bandeira)
- ✅ Animação hover com brightness

### 4. **Integração com App Principal** (`frontend/src/App.tsx`)
- ✅ Estados para controle do modal
- ✅ Callback para abrir modal
- ✅ Função de confirmação com chamada à API
- ✅ Atualização automática do próximo código
- ✅ Recarga da página após sucesso para atualizar catálogo
- ✅ Tratamento de erros

### 5. **Serviços de API** (`frontend/src/services/api.ts`)
- ✅ `getNextSongCode()` - Busca próximo código disponível
- ✅ `addNewSong(songData)` - Envia nova música para o backend
- ✅ Interface `NewSongData` com tipagem completa

## 🎨 Identidade Visual

### Cores Utilizadas (seguindo a plataforma)

**Tema Escuro (Darkside):**
- Background do modal: Gradiente azul/verde (`from-[rgba(0,39,118,0.85)] to-[rgba(0,155,58,0.85)]`)
- Texto principal: Branco (#ffffff)
- Texto secundário: Blue-50 com opacidade
- Inputs: Fundo branco/10 com borda branca/20
- Botão principal: Gradiente verde bandeira (#009b3a)

**Tema Claro (Light):**
- Background do modal: Gradiente branco (`from-white to-slate-50`)
- Texto principal: Slate-900
- Texto secundário: Slate-600
- Inputs: Fundo branco com borda slate-200
- Botão principal: Mesmo gradiente verde bandeira

### Elementos de Design

- ✅ Bordas arredondadas (rounded-2xl, rounded-lg)
- ✅ Sombras suaves (shadow-2xl, shadow-lg)
- ✅ Transições suaves (duration-300, duration-200)
- ✅ Ícones do Lucide React
- ✅ Badge com código da música em destaque
- ✅ Validação visual com mensagens de erro em vermelho

## 📁 Arquivos Modificados/Criados

### Criados:
1. `/frontend/src/components/AddSongModal.tsx` (novo componente)
2. `/FEATURE_ADD_SONG.md` (este documento)

### Modificados:
1. `/frontend/src/components/Header.tsx` - Adicionado botão e callback
2. `/frontend/src/App.tsx` - Integração do modal e lógica
3. `/frontend/src/services/api.ts` - Novas funções de API
4. `/backend/src/routes/videos.ts` - Novos endpoints
5. `/backend/src/data/songCatalog.ts` - Funções de adicionar música

## 🚀 Como Usar

### Para o Usuário:

1. Clique no botão **"Adicionar Música"** no header (ícone +)
2. Preencha o formulário com os dados da nova música:
   - Cole o ID do YouTube (11 caracteres)
   - Digite o nome do artista
   - Digite o nome da música
   - Selecione o idioma
   - Digite o gênero
   - Digite a duração no formato MM:SS (ex: 04:30)
3. Clique em **"Adicionar Música"**
4. A página será recarregada automaticamente com a nova música no catálogo

### Próximo Código Automático:
O sistema busca automaticamente o próximo código disponível. Se o catálogo tem até 0230, o próximo será 0231.

## 🔐 Validações Implementadas

### Frontend:
- ✅ YouTube ID deve ter exatamente 11 caracteres alfanuméricos
- ✅ Artista, música e gênero são obrigatórios
- ✅ Duração deve estar no formato MM:SS
- ✅ Feedback visual em tempo real

### Backend:
- ✅ Validação de formato do YouTube ID (`/^[a-zA-Z0-9_-]{11}$/`)
- ✅ Validação de formato de duração (`/^\d{1,2}:\d{2}$/`)
- ✅ Validação de idioma (pt-BR, en, es)
- ✅ Verificação de duplicatas (mesmo YouTube ID)
- ✅ Todos os campos obrigatórios

## 📊 Código Gerado Automaticamente

O próximo código é calculado dinamicamente:
```typescript
export function getNextCode(): string {
  const maxCode = SONG_CATALOG.reduce((max, song) => {
    const codeNum = parseInt(song.code, 10);
    return codeNum > max ? codeNum : max;
  }, 0);
  return (maxCode + 1).toString().padStart(4, '0');
}
```

Exemplo: Se o último código é 0230, o próximo será 0231.

## 💾 Persistência de Dados

As novas músicas são automaticamente:
1. ✅ Adicionadas ao array `SONG_CATALOG` em memória
2. ✅ Persistidas no arquivo `songCatalog.ts`
3. ✅ Formatadas com a mesma estrutura das músicas existentes
4. ✅ Disponíveis imediatamente após recarga

## 🎯 Status da Feature

✅ **CONCLUÍDA E FUNCIONAL**

Todas as funcionalidades foram implementadas seguindo:
- ✅ Identidade visual da plataforma
- ✅ Suporte aos temas claro e escuro
- ✅ Validações completas
- ✅ Arquitetura existente
- ✅ Padrões de código do projeto

## 🔄 Próximos Passos (Opcional)

Melhorias futuras que podem ser implementadas:
- [ ] Adicionar preview do vídeo do YouTube antes de salvar
- [ ] Permitir edição de músicas existentes
- [ ] Adicionar suporte para upload de thumbnail customizada
- [ ] Implementar paginação no catálogo
- [ ] Adicionar campo `OriginalSongId` para processamento de melodia
- [ ] Notificação toast em vez de recarga de página

## 📝 Notas Técnicas

- O código segue os padrões TypeScript do projeto
- Os componentes usam hooks do React (useState, useEffect)
- A persistência é feita escrevendo diretamente no arquivo TypeScript
- Em produção, considere usar um banco de dados para maior escalabilidade
