#!/bin/bash

echo "🎤 CantaAI - Iniciando todos os serviços..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se as portas já estão em uso
check_port() {
    lsof -i :$1 >/dev/null 2>&1
    return $?
}

echo -e "${BLUE}Verificando portas...${NC}"
if check_port 8000; then
    echo -e "${YELLOW}⚠️  Porta 8000 já está em uso. Execute ./stop-all.sh primeiro.${NC}"
fi
if check_port 3001; then
    echo -e "${YELLOW}⚠️  Porta 3001 já está em uso. Execute ./stop-all.sh primeiro.${NC}"
fi
if check_port 3000; then
    echo -e "${YELLOW}⚠️  Porta 3000 já está em uso. Execute ./stop-all.sh primeiro.${NC}"
fi

echo ""
echo -e "${BLUE}1️⃣  Iniciando Melody Service (porta 8000)...${NC}"
cd melody-service

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}   Criando ambiente virtual Python...${NC}"
    python3 -m venv venv
fi

source venv/bin/activate

if [ ! -f "venv/.deps_installed" ]; then
    echo -e "${YELLOW}   Instalando dependências...${NC}"
    pip install -r requirements.txt
    touch venv/.deps_installed
fi

echo -e "${GREEN}   ✓ Melody service iniciando em background...${NC}"
nohup python main.py > ../logs/melody-service.log 2>&1 &
MELODY_PID=$!
echo $MELODY_PID > ../logs/melody-service.pid

cd ..

sleep 2

echo ""
echo -e "${BLUE}2️⃣  Iniciando Backend (porta 3001)...${NC}"
cd backend

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}   Instalando dependências do backend...${NC}"
    npm install
fi

echo -e "${GREEN}   ✓ Backend iniciando em background...${NC}"
mkdir -p ../logs
nohup npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid

cd ..

sleep 2

echo ""
echo -e "${BLUE}3️⃣  Iniciando Frontend (porta 3000)...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}   Instalando dependências do frontend...${NC}"
    npm install
fi

echo -e "${GREEN}   ✓ Frontend iniciando em background...${NC}"
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid

cd ..

echo ""
echo -e "${GREEN}✅ Todos os serviços foram iniciados!${NC}"
echo ""
echo "📊 Status:"
echo "   🐍 Melody Service: http://localhost:8000 (PID: $MELODY_PID)"
echo "   🔧 Backend:        http://localhost:3001 (PID: $BACKEND_PID)"
echo "   🎨 Frontend:       http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "📝 Logs disponíveis em:"
echo "   logs/melody-service.log"
echo "   logs/backend.log"
echo "   logs/frontend.log"
echo ""
echo "🛑 Para parar todos os serviços: ./stop-all.sh"
echo ""
echo -e "${BLUE}Aguarde 10-15 segundos para todos os serviços iniciarem completamente...${NC}"

sleep 5

echo ""
echo "🔍 Verificando status dos serviços..."
check_port 8000 && echo -e "   ${GREEN}✓${NC} Melody Service: Rodando" || echo -e "   ${RED}✗${NC} Melody Service: Falhou (veja logs/melody-service.log)"
check_port 3001 && echo -e "   ${GREEN}✓${NC} Backend: Rodando" || echo -e "   ${RED}✗${NC} Backend: Falhou (veja logs/backend.log)"
check_port 3000 && echo -e "   ${GREEN}✓${NC} Frontend: Rodando" || echo -e "   ${RED}✗${NC} Frontend: Falhou (veja logs/frontend.log)"

echo ""
echo -e "${GREEN}🚀 Abra http://localhost:3000 no seu navegador!${NC}"
