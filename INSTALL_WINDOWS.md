# Guia de Instalação - CantaAI no Windows 🎤

Este guia fornece instruções detalhadas para instalar e executar o CantaAI em um PC Windows.

## Pré-requisitos

### 1. Instalar o Node.js

1. Acesse [nodejs.org](https://nodejs.org/)
2. Baixe a versão **LTS** (Long Term Support) - recomendado Node.js 18 ou superior
3. Execute o instalador baixado
4. Durante a instalação, marque a opção **"Automatically install the necessary tools"** (isso instalará chocolatey e ferramentas de build)
5. Após a instalação, abra o **Prompt de Comando** ou **PowerShell** e verifique:
   ```cmd
   node --version
   npm --version
   ```

### 2. Ferramentas de Build (necessário para SQLite)

O projeto usa `better-sqlite3`, que precisa ser compilado nativamente no Windows. Você tem duas opções:

#### Opção A: Instalação Automática (Recomendada)
Se você marcou a opção de instalar ferramentas automaticamente durante a instalação do Node.js, as ferramentas já foram instaladas.

#### Opção B: Instalação Manual
Se não instalou as ferramentas junto com o Node.js, execute o PowerShell **como Administrador** e rode:

```powershell
npm install --global windows-build-tools
```

Ou instale o Visual Studio Build Tools:
1. Baixe o [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)
2. Durante a instalação, selecione **"Desktop development with C++"**

### 3. Obter Chave da API do Anthropic Claude

1. Acesse [console.anthropic.com](https://console.anthropic.com/)
2. Crie uma conta ou faça login
3. Navegue até **API Keys**
4. Crie uma nova chave de API e copie-a (você precisará dela depois)

## Instalação do Projeto

### 1. Clonar ou Baixar o Repositório

Se você tem o Git instalado:
```cmd
git clone <url-do-repositorio>
cd karaoke
```

Ou baixe o ZIP do repositório e extraia em uma pasta de sua escolha.

### 2. Instalar Dependências

Abra o **Prompt de Comando** ou **PowerShell** na pasta do projeto e execute:

```cmd
npm install
```

Este comando pode demorar alguns minutos, pois irá:
- Instalar todas as dependências do frontend
- Instalar todas as dependências do backend
- Compilar o módulo `better-sqlite3` para seu sistema

**Nota:** Se encontrar erros durante a compilação do `better-sqlite3`, certifique-se de que as ferramentas de build estão instaladas (veja "Pré-requisitos" acima).

### 3. Configurar Variáveis de Ambiente

1. Navegue até a pasta `backend`:
   ```cmd
   cd backend
   ```

2. Copie o arquivo de exemplo:
   ```cmd
   copy .env.example .env
   ```

3. Abra o arquivo `.env` com um editor de texto (Notepad, VS Code, etc.) e configure:
   ```env
   ANTHROPIC_API_KEY=sua-chave-api-aqui
   PORT=3001
   NODE_ENV=development
   ```

4. Substitua `sua-chave-api-aqui` pela chave de API que você obteve no console da Anthropic

5. Volte para a pasta raiz do projeto:
   ```cmd
   cd ..
   ```

## Executando o Aplicativo

### Modo Desenvolvimento (Recomendado para Teste)

Execute o seguinte comando na pasta raiz do projeto:

```cmd
npm run dev
```

Este comando irá:
- Iniciar o backend na porta 3001
- Iniciar o frontend na porta 5173
- Abrir automaticamente o navegador

Acesse: **http://localhost:5173**

### Comandos Separados

Se preferir rodar frontend e backend separadamente:

**Terminal 1 - Backend:**
```cmd
npm run dev:backend
```

**Terminal 2 - Frontend:**
```cmd
npm run dev:frontend
```

## Verificação da Instalação

### 1. Verificar o Backend

Abra o navegador e acesse: **http://localhost:3001/api/health**

Você deve ver uma resposta JSON como:
```json
{"status":"ok"}
```

### 2. Verificar o Banco de Dados

Na pasta `backend`, você deve ver o arquivo `karaoke.db` sendo criado automaticamente na primeira execução.

### 3. Verificar o Frontend

Acesse **http://localhost:5173** e você deve ver a interface do CantaAI.

## Solução de Problemas Comuns

### Erro: "better-sqlite3" não compilou

**Problema:** Erro durante `npm install` relacionado ao `better-sqlite3`

**Solução:**
1. Instale as ferramentas de build (veja "Pré-requisitos")
2. Remova as dependências e reinstale:
   ```cmd
   rmdir /s /q node_modules
   npm install
   ```

### Erro: "ANTHROPIC_API_KEY não definida"

**Problema:** Backend não inicia ou API retorna erro 401

**Solução:**
1. Verifique se o arquivo `backend/.env` existe
2. Certifique-se de que a chave de API está corretamente configurada
3. Reinicie o servidor backend

### Porta já em uso

**Problema:** Erro "Port 3001 already in use" ou "Port 5173 already in use"

**Solução:**
1. Encerre o processo que está usando a porta
2. Ou edite o arquivo `.env` para usar outra porta

Para encontrar o processo usando a porta no Windows:
```cmd
netstat -ano | findstr :3001
taskkill /PID <numero-do-pid> /F
```

### Firewall/Antivírus bloqueando

**Problema:** O aplicativo não abre ou conexões são bloqueadas

**Solução:**
1. Adicione exceções no Windows Firewall para Node.js
2. Permita as portas 3001 e 5173
3. Temporariamente desabilite o antivírus para testar

### Problemas com Microfone

**Problema:** Gravação de áudio não funciona

**Solução:**
1. Verifique as permissões do navegador para acessar o microfone
2. Use **HTTPS** ou **localhost** (HTTP em localhost é permitido)
3. Teste o microfone em: chrome://settings/content/microphone

## Build para Produção

Para criar uma versão otimizada para produção:

```cmd
npm run build
```

Depois, para executar:

```cmd
npm start
```

O aplicativo estará disponível em: **http://localhost:3001**

## Estrutura de Pastas

```
karaoke/
├── frontend/              # Aplicação React
│   ├── src/              # Código fonte
│   ├── public/           # Arquivos estáticos
│   └── dist/             # Build de produção (após npm run build)
├── backend/              # Servidor Node.js
│   ├── src/              # Código fonte
│   ├── dist/             # Build de produção (após npm run build)
│   ├── .env              # Configurações (você cria este arquivo)
│   └── karaoke.db        # Banco de dados SQLite (criado automaticamente)
└── package.json          # Configuração do projeto
```

## Requisitos do Sistema

- **Windows 10** ou superior
- **Node.js 18+**
- **4GB RAM** mínimo (8GB recomendado)
- **Navegador moderno:** Chrome, Edge, ou Firefox (última versão)
- **Microfone** funcional
- **Conexão com internet** (para acessar vídeos do YouTube e API da Anthropic)

## Suporte

Se encontrar problemas:

1. Verifique os logs no terminal onde o backend está rodando
2. Abra o Console do desenvolvedor no navegador (F12)
3. Consulte o README.md principal para mais informações técnicas
4. Crie uma issue no repositório do projeto

## Próximos Passos

Após a instalação bem-sucedida:

1. ✅ Explore o catálogo de músicas
2. ✅ Teste a gravação de áudio
3. ✅ Cante uma música e receba feedback da IA
4. ✅ Acompanhe seu histórico de performances

Divirta-se cantando com o CantaAI! 🎤🎵
