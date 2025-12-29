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

AVAILABLE_RESPONSE=$(curl -s "${BACKEND_URL}/api/melody/available")

if [ -z "$AVAILABLE_RESPONSE" ]; then
    echo "❌ Erro: API não retornou dados"
    echo "   Verifique se o backend está rodando corretamente"
    exit 1
fi

echo "$AVAILABLE_RESPONSE" | python3 -c "
import json, sys

try:
    raw = sys.stdin.read()
    if not raw.strip():
        print('❌ Resposta vazia da API')
        sys.exit(1)

    data = json.loads(raw)

    if isinstance(data, str):
        print(f'❌ API retornou string: {data[:100]}')
        sys.exit(1)

    if not isinstance(data, list):
        print(f'❌ Formato inesperado: {type(data).__name__}')
        print(f'   Conteúdo: {str(data)[:200]}')
        sys.exit(1)

    if len(data) == 0:
        print('Nenhuma música com OriginalSongId encontrada.')
        sys.exit(0)

    pending = [s for s in data if isinstance(s, dict) and not s.get('hasMelodyMap', False) and not s.get('isProcessing', False)]
    processed = [s for s in data if isinstance(s, dict) and s.get('hasMelodyMap', False)]

    if pending:
        print('PENDENTES:')
        for i, song in enumerate(pending, 1):
            print(f\"  {i}. [{song.get('code', '?')}] {song.get('song', '?')} - {song.get('artist', '?')}\")
        print()

    if processed:
        print('JÁ PROCESSADAS:')
        for i, song in enumerate(processed, 1):
            print(f\"  ✓ [{song.get('code', '?')}] {song.get('song', '?')} - {song.get('artist', '?')}\")
        print()

    if not pending and not processed:
        print('Nenhuma música encontrada para processar.')
except json.JSONDecodeError as e:
    print(f'❌ Erro ao parsear JSON: {e}')
    print(f'   Resposta recebida: {raw[:200]}')
    sys.exit(1)
except Exception as e:
    print(f'❌ Erro: {e}')
    sys.exit(1)
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
