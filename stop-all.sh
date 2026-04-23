#!/bin/bash

echo "🛑 CantaAI - Parando todos os serviços..."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Função para matar processo na porta
kill_port() {
    local port=$1
    local name=$2
    
    PID=$(lsof -ti :$port)
    if [ ! -z "$PID" ]; then
        echo -e "${GREEN}Parando $name (porta $port, PID: $PID)...${NC}"
        kill $PID 2>/dev/null
        sleep 1
        
        if lsof -ti :$port >/dev/null 2>&1; then
            echo -e "${RED}Forçando encerramento...${NC}"
            kill -9 $PID 2>/dev/null
        fi
    else
        echo "  $name não está rodando (porta $port)"
    fi
}

kill_port 3000 "Frontend"
kill_port 3001 "Backend"
kill_port 8000 "Melody Service"

# Limpar arquivos PID se existirem
rm -f logs/*.pid 2>/dev/null

echo ""
echo -e "${GREEN}✅ Todos os serviços foram parados!${NC}"
