#!/bin/bash

# ==============================================
# Script para gerar Melody Maps
# Processa músicas que têm OriginalSongId configurado
# ==============================================

set -e

MELODY_SERVICE_URL="http://localhost:8000"
BACKEND_URL="http://localhost:3001"

echo "🎵 CantaAI - Gerador de Melody Maps"
echo "======================================"
echo ""

# Função para verificar se um serviço está rodando
check_service() {
    local url=$1
    local name=$2
    if curl -s --connect-timeout 5 "${url}/health" > /dev/null 2>&1; then
        echo "✅ ${name} está rodando"
        return 0
    else
        echo "❌ ${name} NÃO está rodando em ${url}"
        return 1
    fi
}

# Verifica serviços
echo "📡 Verificando serviços..."
echo ""

MELODY_OK=false
BACKEND_OK=false

if check_service "$MELODY_SERVICE_URL" "Melody Service (Python)"; then
    MELODY_OK=true
fi

# Backend health check é diferente
if curl -s --connect-timeout 5 "${BACKEND_URL}/api/melody/service-status" > /dev/null 2>&1; then
    echo "✅ Backend (Node.js) está rodando"
    BACKEND_OK=true
else
    echo "❌ Backend NÃO está rodando em ${BACKEND_URL}"
fi

echo ""

if [ "$MELODY_OK" = false ] || [ "$BACKEND_OK" = false ]; then
    echo "⚠️  Alguns serviços não estão rodando."
    echo ""
    echo "Para iniciar os serviços, execute:"
    echo ""
    echo "  Terminal 1 (Melody Service):"
    echo "    cd ~/karaoke/melody-service"
    echo "    source venv/bin/activate"
    echo "    python main.py"
    echo ""
    echo "  Terminal 2 (Backend):"
    echo "    cd ~/karaoke/backend"
    echo "    npm run dev"
    echo ""
    exit 1
fi

# Busca estatísticas
echo "📊 Estatísticas de Melody Maps:"
echo ""

STATS=$(curl -s "${BACKEND_URL}/api/melody/stats")
TOTAL=$(echo "$STATS" | grep -o '"total":[0-9]*' | cut -d':' -f2)
WITH_ORIGINAL=$(echo "$STATS" | grep -o '"withOriginal":[0-9]*' | cut -d':' -f2)
PROCESSED=$(echo "$STATS" | grep -o '"processed":[0-9]*' | cut -d':' -f2)
PENDING=$(echo "$STATS" | grep -o '"pending":[0-9]*' | cut -d':' -f2)
PROCESSING=$(echo "$STATS" | grep -o '"processing":[0-9]*' | cut -d':' -f2)

echo "  Total de músicas:        $TOTAL"
echo "  Com OriginalSongId:      $WITH_ORIGINAL"
echo "  Já processadas:          $PROCESSED"
echo "  Pendentes:               $PENDING"
echo "  Processando agora:       $PROCESSING"
echo ""

# Lista músicas disponíveis para processamento
echo "🎶 Músicas disponíveis para processamento:"
echo ""

curl -s "${BACKEND_URL}/api/melody/available" | python3 -c "
import json, sys
data = json.load(sys.stdin)
pending = [s for s in data if not s['hasMelodyMap'] and not s['isProcessing']]
processed = [s for s in data if s['hasMelodyMap']]

if pending:
    print('PENDENTES:')
    for i, song in enumerate(pending, 1):
        print(f\"  {i}. [{song['code']}] {song['song']} - {song['artist']}\")
    print()

if processed:
    print('JÁ PROCESSADAS:')
    for i, song in enumerate(processed, 1):
        print(f\"  ✓ [{song['code']}] {song['song']} - {song['artist']}\")
    print()
"

if [ "$PENDING" = "0" ]; then
    echo "✅ Todas as músicas com OriginalSongId já foram processadas!"
    exit 0
fi

echo ""
echo "======================================"
echo ""
read -p "🚀 Deseja processar todas as músicas pendentes? (s/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo "⏳ Iniciando processamento em batch..."
    echo "   Isso pode levar vários minutos por música."
    echo ""

    # Inicia batch processing
    RESULT=$(curl -s -X POST "${BACKEND_URL}/api/melody/batch" \
        -H "Content-Type: application/json" \
        -d '{"maxConcurrent": 1, "delayMs": 3000}')

    echo "📨 Resposta do servidor:"
    echo "$RESULT" | python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin), indent=2))"

    echo ""
    echo "💡 O processamento está rodando em background."
    echo "   Acompanhe o progresso nos logs do backend."
    echo ""
    echo "   Para ver o status:"
    echo "   curl ${BACKEND_URL}/api/melody/stats"
else
    echo ""
    echo "❌ Processamento cancelado."
    echo ""
    echo "💡 Para processar uma música específica:"
    echo "   curl -X POST ${BACKEND_URL}/api/melody/CODIGO/process"
fi
