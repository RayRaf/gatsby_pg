# 🚀 Docker PostgreSQL Setup - Quick Start

## Быстрый старт (одна команда)

```bash
chmod +x start-docker.sh && ./start-docker.sh
```

## Или пошагово:

### 1. Установите зависимости
```bash
npm install --legacy-peer-deps pg @types/pg
```

### 2. Создайте .env файл
```bash
cp .env.example .env
```

### 3. Запустите Docker
```bash
docker-compose up -d
```

### 4. Проверьте статус
```bash
docker-compose ps
```

## 🌐 Доступ

- **Приложение**: http://localhost:3000
- **PostgreSQL**: localhost:5432
  - База: `gatsby_db`
  - Пользователь: `gatsby_user`
  - Пароль: `gatsby_password`

## 📝 Полезные команды

```bash
# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Подключение к БД
docker-compose exec postgres psql -U gatsby_user -d gatsby_db

# Проверка таблиц
docker-compose exec postgres psql -U gatsby_user -d gatsby_db -c "\dt"

# Просмотр данных
docker-compose exec postgres psql -U gatsby_user -d gatsby_db -c "SELECT * FROM registrations;"
```

## ⚠️ Важно: Обновите клиентский код

После запуска Docker нужно обновить код в `app/page.tsx` и `app/results/page.tsx`:

**Замените Supabase вызовы на API fetch:**

```typescript
// ❌ Старый код (Supabase)
const supabase = createClient()
const { data, error } = await supabase.from("registrations").select("*")

// ✅ Новый код (PostgreSQL API)
const response = await fetch('/api/registrations')
const data = await response.json()
```

Подробные инструкции в файле `MIGRATION_GUIDE.md`

## 🐛 Проблемы?

Смотрите логи:
```bash
docker-compose logs postgres
docker-compose logs app
```

Перезапустите всё:
```bash
docker-compose down -v && docker-compose up -d
```

## 📚 Документация

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Полное руководство по миграции
- [docker-compose.yml](./docker-compose.yml) - Конфигурация Docker
- [scripts/init-db.sql](./scripts/init-db.sql) - SQL для инициализации БД
