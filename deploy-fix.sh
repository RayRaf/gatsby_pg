#!/bin/bash

# Скрипт для применения исправлений проблемы с пустым списком регистраций
# Использование: bash deploy-fix.sh

set -e

echo "🚀 Применение исправлений для gatsby_pg..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Проверка, что мы в нужной директории
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}❌ Ошибка: docker-compose.prod.yml не найден${NC}"
    echo "Убедитесь, что вы находитесь в корневой директории проекта gatsby_pg"
    exit 1
fi

echo -e "${YELLOW}📋 Шаг 1: Остановка приложения...${NC}"
docker-compose -f docker-compose.prod.yml stop app

echo -e "${YELLOW}📦 Шаг 2: Пересборка Docker-образа...${NC}"
docker-compose -f docker-compose.prod.yml build app

echo -e "${YELLOW}🔄 Шаг 3: Запуск приложения...${NC}"
docker-compose -f docker-compose.prod.yml up -d app

echo -e "${YELLOW}⏳ Ожидание запуска приложения (15 секунд)...${NC}"
sleep 15

echo -e "${YELLOW}🔍 Шаг 4: Проверка логов...${NC}"
docker logs gatsby-app-prod --tail=30

echo ""
echo -e "${YELLOW}📊 Шаг 5: Проверка данных в базе...${NC}"
DB_COUNT=$(docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -t -c "SELECT COUNT(*) FROM public.registrations;")
echo -e "Записей в базе: ${GREEN}${DB_COUNT}${NC}"

echo ""
echo -e "${YELLOW}🌐 Шаг 6: Проверка API...${NC}"
API_RESPONSE=$(docker exec -it gatsby-app-prod curl -s http://localhost:3000/api/registrations || echo "[]")
API_COUNT=$(echo "$API_RESPONSE" | grep -o "\"id\"" | wc -l || echo "0")
echo -e "Записей через API: ${GREEN}${API_COUNT}${NC}"

echo ""
if [ "$DB_COUNT" -eq "$API_COUNT" ] && [ "$DB_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ УСПЕХ! Приложение работает корректно.${NC}"
    echo -e "${GREEN}   База данных и API возвращают одинаковое количество записей.${NC}"
else
    echo -e "${RED}⚠️  ВНИМАНИЕ! Обнаружены расхождения:${NC}"
    echo -e "${RED}   - В базе: $DB_COUNT записей${NC}"
    echo -e "${RED}   - Через API: $API_COUNT записей${NC}"
    echo ""
    echo -e "${YELLOW}Рекомендации:${NC}"
    echo "1. Проверьте логи: docker logs gatsby-app-prod -f"
    echo "2. Проверьте переменные окружения: docker exec -it gatsby-app-prod env | grep DATABASE"
    echo "3. Запустите скрипт диагностики: docker exec -it gatsby-app-prod node scripts/check-db-connection.js"
fi

echo ""
echo -e "${YELLOW}📝 Полезные команды:${NC}"
echo "  - Логи приложения:  docker logs gatsby-app-prod -f"
echo "  - Логи БД:          docker logs gatsby-postgres-prod -f"
echo "  - Проверка БД:      docker exec -it gatsby-app-prod node scripts/check-db-connection.js"
echo "  - Проверка API:     curl http://localhost:3000/api/registrations"
echo ""
