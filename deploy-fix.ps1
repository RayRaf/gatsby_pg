# Скрипт для применения исправлений проблемы с пустым списком регистраций
# Использование: .\deploy-fix.ps1

Write-Host "🚀 Применение исправлений для gatsby_pg..." -ForegroundColor Cyan

# Проверка, что мы в нужной директории
if (-not (Test-Path "docker-compose.prod.yml")) {
    Write-Host "❌ Ошибка: docker-compose.prod.yml не найден" -ForegroundColor Red
    Write-Host "Убедитесь, что вы находитесь в корневой директории проекта gatsby_pg"
    exit 1
}

Write-Host "`n📋 Шаг 1: Остановка приложения..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml stop app

Write-Host "`n📦 Шаг 2: Пересборка Docker-образа..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml build app

Write-Host "`n🔄 Шаг 3: Запуск приложения..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d app

Write-Host "`n⏳ Ожидание запуска приложения (15 секунд)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "`n🔍 Шаг 4: Проверка логов..." -ForegroundColor Yellow
docker logs gatsby-app-prod --tail=30

Write-Host "`n📊 Шаг 5: Проверка данных в базе..." -ForegroundColor Yellow
$dbCount = docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -t -c "SELECT COUNT(*) FROM public.registrations;" | ForEach-Object { $_.Trim() }
Write-Host "Записей в базе: $dbCount" -ForegroundColor Green

Write-Host "`n🌐 Шаг 6: Проверка API..." -ForegroundColor Yellow
try {
    $apiResponse = docker exec -it gatsby-app-prod curl -s http://localhost:3000/api/registrations
    $apiCount = ([regex]::Matches($apiResponse, '"id"')).Count
    Write-Host "Записей через API: $apiCount" -ForegroundColor Green
    
    if ($dbCount -eq $apiCount -and $dbCount -gt 0) {
        Write-Host "`n✅ УСПЕХ! Приложение работает корректно." -ForegroundColor Green
        Write-Host "   База данных и API возвращают одинаковое количество записей." -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  ВНИМАНИЕ! Обнаружены расхождения:" -ForegroundColor Red
        Write-Host "   - В базе: $dbCount записей" -ForegroundColor Red
        Write-Host "   - Через API: $apiCount записей" -ForegroundColor Red
        Write-Host "`nРекомендации:" -ForegroundColor Yellow
        Write-Host "1. Проверьте логи: docker logs gatsby-app-prod -f"
        Write-Host "2. Проверьте переменные окружения: docker exec -it gatsby-app-prod env | grep DATABASE"
        Write-Host "3. Запустите скрипт диагностики: docker exec -it gatsby-app-prod node scripts/check-db-connection.js"
    }
} catch {
    Write-Host "❌ Ошибка при проверке API: $_" -ForegroundColor Red
}

Write-Host "`n📝 Полезные команды:" -ForegroundColor Yellow
Write-Host "  - Логи приложения:  docker logs gatsby-app-prod -f"
Write-Host "  - Логи БД:          docker logs gatsby-postgres-prod -f"
Write-Host "  - Проверка БД:      docker exec -it gatsby-app-prod node scripts/check-db-connection.js"
Write-Host "  - Проверка API:     curl http://localhost:3000/api/registrations"
Write-Host ""
