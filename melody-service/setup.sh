#!/bin/bash

# Script de setup para o Melody Extraction Service

set -e

echo "🎵 Configurando Melody Extraction Service..."

# Verifica Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 não encontrado. Instale o Python 3.10+ primeiro."
    exit 1
fi

# Verifica FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg não encontrado. Instalando..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install ffmpeg
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y ffmpeg
    else
        echo "❌ Instale o FFmpeg manualmente: https://ffmpeg.org/download.html"
        exit 1
    fi
fi

# Cria ambiente virtual
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativa ambiente virtual
source venv/bin/activate

# Instala dependências
echo "📦 Instalando dependências..."
pip install --upgrade pip
pip install -r requirements.txt

# Cria diretório de cache
mkdir -p cache

echo ""
echo "✅ Setup completo!"
echo ""
echo "Para iniciar o servidor:"
echo "  source venv/bin/activate"
echo "  python main.py"
echo ""
echo "Ou use Docker:"
echo "  docker build -t melody-service ."
echo "  docker run -p 8000:8000 melody-service"
