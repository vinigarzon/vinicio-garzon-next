#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Vinicio Garzón Portfolio - Setup${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado. Descárgalo en https://nodejs.org/${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js instalado: $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm no está instalado.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm instalado: $(npm --version)${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}📦 Instalando dependencias...${NC}"
npm install

echo ""
echo -e "${GREEN}✓ Instalación completada${NC}"
echo ""

# Create .env.local
if [ ! -f .env.local ]; then
    echo -e "${BLUE}📝 Creando .env.local...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✓ .env.local creado${NC}"
fi

echo ""
echo -e "${BLUE}🎉 Setup completado!${NC}"
echo ""
echo -e "Para correr el proyecto localmente:"
echo -e "${GREEN}npm run dev${NC}"
echo ""
echo -e "Luego abre: ${BLUE}http://localhost:3000${NC}"
