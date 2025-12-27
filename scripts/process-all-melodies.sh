#!/bin/bash
# Script para processar todas as músicas com URL original
# Requer: melody-service rodando em http://localhost:8000

MELODY_SERVICE_URL="${MELODY_SERVICE_URL:-http://localhost:8000}"

echo "🎵 Processador de Melodias - CantAI"
echo "===================================="
echo ""

# Verifica se o serviço está rodando
echo "Verificando se o melody-service está rodando..."
if ! curl -s "$MELODY_SERVICE_URL/health" > /dev/null 2>&1; then
    echo "❌ Erro: melody-service não está rodando em $MELODY_SERVICE_URL"
    echo ""
    echo "Para iniciar o serviço:"
    echo "  cd melody-service"
    echo "  pip install -r requirements.txt"
    echo "  python main.py"
    exit 1
fi
echo "✅ melody-service está rodando!"
echo ""

# Lista de músicas com URL original (code|title|originalId)
SONGS=(
    "0001|Trem Das Onze - Adoniran Barbosa|p5OI0YlcSXs"
    "0002|Devolva-me - Adriana Calcanhotto|k3l_A6J2Mk4"
    "0003|Mentiras - Adriana Calcanhotto|BtKY0HJa2jY"
    "0004|Cryin' - Aerosmith|qfNmyxV2Ncw"
    "0005|Dream On - Aerosmith|89dGC8de0CA"
    "0006|Anunciação - Alceu Valença|j42byy7G_Ow"
    "0007|Coração bobo - Alceu Valença|dEDubYTK5IM"
    "0009|La Belle de Jour - Alceu Valença|UxvTdW9CLfI"
    "0010|A Loba - Alcione|7zAm_TFOZqQ"
    "0011|Não deixe o samba morrer - Alcione|6d6fIM54Vkk"
    "0012|Você me vira a cabeça - Alcione|Zh-YpF3I7w8"
    "0013|Vem me amar - Alexandre Pires|sfofElIpqJA"
    "0015|Rehab - Amy Winehouse|HoqSO0hAjZw"
    "0019|Quem de Nós Dois - Ana Carolina|UgkcQ78tqDo"
    "0048|Você é Linda - Caetano Veloso|122xDmxYr8A"
    "0081|Evidências - Chitãozinho e Xororó|etHo9ZOGgdY"
    "0128|Feel Good Inc. - Gorillaz|HyHNuVaZJ-k"
    "0134|Vai Lá Vai Lá - Grupo Revelação|MLrezTSZWMA"
    "0136|Eva - Ivete Sangalo|l86drhSgUEU"
    "0150|Dezesseis - Legião Urbana|Or0FflpaOQs"
    "0151|Pais e Filhos - Legião Urbana|0-MSRDgWseE"
    "0169|Garota Nota 100 - MC Marcinho|x3b1awtKQ7Q"
    "0170|Glamurosa - MC Marcinho|E_-aqRkADNE"
    "0171|Princesa - MC Marcinho|KaJwzeEWGCM"
    "0172|Rap do Solitário - MC Marcinho|0t0Y5pWm4wE"
    "0173|Tudo é Festa - MC Marcinho|0iA5JGmLoLo"
    "0179|De zero a cem - Os Garotin|uuQK2Q16XuQ"
    "0180|Várias Queixas - Os Gilsons|bBHPq3UQFsw"
    "0187|Garçom - Reginaldo Rossi|mdBnm0pUiYk"
    "0192|Burguesinha - Seu Jorge|bWSn9jL1g7I"
    "0193|Sandra Rosa Madalena - Sidney Magal|xL6ZHzTvm3g"
    "0196|Depois Do Prazer - Só Pra Contrariar|xi80KRIqW7Y"
    "0197|Essa Tal Liberdade - Só Pra Contrariar|gfXHwBpk-vs"
    "0212|Telefone Mudo - Trio Parada Dura|pq2JKVI6F5s"
    "0226|Chão de Giz - Zé Ramalho|nL_QNpNOssI"
)

TOTAL=${#SONGS[@]}
PROCESSED=0
FAILED=0
SKIPPED=0

echo "Total de músicas a processar: $TOTAL"
echo ""

for song_info in "${SONGS[@]}"; do
    IFS='|' read -r code title video_id <<< "$song_info"
    youtube_url="https://www.youtube.com/watch?v=$video_id"

    echo "[$((PROCESSED + FAILED + SKIPPED + 1))/$TOTAL] Processando: $title"
    echo "   Código: $code"
    echo "   URL: $youtube_url"

    # Faz a requisição para processar
    response=$(curl -s -X POST "$MELODY_SERVICE_URL/extract" \
        -H "Content-Type: application/json" \
        -d "{\"youtube_url\": \"$youtube_url\", \"song_code\": \"$code\", \"song_title\": \"$title\"}" \
        --max-time 600)

    if echo "$response" | grep -q '"notes"'; then
        echo "   ✅ Sucesso!"
        ((PROCESSED++))
    elif echo "$response" | grep -q 'already exists'; then
        echo "   ⏭️  Já processada, pulando..."
        ((SKIPPED++))
    else
        echo "   ❌ Falhou: $response"
        ((FAILED++))
    fi

    echo ""

    # Pequena pausa entre requisições
    sleep 2
done

echo "===================================="
echo "📊 Resumo:"
echo "   ✅ Processadas: $PROCESSED"
echo "   ⏭️  Puladas: $SKIPPED"
echo "   ❌ Falharam: $FAILED"
echo "===================================="
