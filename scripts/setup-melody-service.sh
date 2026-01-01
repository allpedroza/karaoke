#!/bin/bash
# Script para configurar o melody-service

echo "🎵 Setup do Melody Service - CantAI"
echo "===================================="
echo ""

cd "$(dirname "$0")/../melody-service" || exit 1

# Verifica se Python 3 está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 não está instalado!"
    echo "   Instale Python 3.9+ e tente novamente."
    exit 1
fi

echo "Python encontrado: $(python3 --version)"
echo ""

# Cria ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo "Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativa ambiente virtual
echo "Ativando ambiente virtual..."
source venv/bin/activate

# Instala dependências
echo "Instalando dependências (isso pode demorar)..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "===================================="
echo "✅ Setup concluído!"
echo ""
echo "Para iniciar o serviço:"
echo "  cd melody-service"
echo "  source venv/bin/activate"
echo "  python main.py"
echo ""
echo "Para processar todas as músicas:"
echo "  ./scripts/process-all-melodies.sh"
echo "===================================="
