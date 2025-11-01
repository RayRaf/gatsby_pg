# Решение проблемы с пустым списком регистраций

## Проблема
После восстановления базы данных из бэкапа, команда `SELECT COUNT(*)` показывает 22 записи, но приложение не отображает список регистраций.

## Причина
Проблема была в том, что SQL-запросы в приложении не указывали схему `public.` явно, что могло приводить к тому, что PostgreSQL искал таблицу не в той схеме.

## Внесённые исправления

### 1. Обновлён файл `lib/db/registrations.ts`
Все SQL-запросы теперь явно указывают схему `public.`:
- `SELECT * FROM public.registrations`
- `INSERT INTO public.registrations`
- `UPDATE public.registrations`
- `DELETE FROM public.registrations`

### 2. Обновлён файл `lib/db/postgres.ts`
Добавлена настройка `search_path` в параметры подключения:
```typescript
pool = new Pool({
  connectionString: databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  options: '-c search_path=public',
})
```

### 3. Обновлён файл `scripts/init-db.sql`
Все объекты базы данных теперь явно создаются в схеме `public`.

## Инструкция по применению исправлений

### Шаг 1: Пересоберите Docker-образ приложения
```bash
# На сервере в директории с проектом
docker-compose -f docker-compose.prod.yml down app
docker-compose -f docker-compose.prod.yml build app
docker-compose -f docker-compose.prod.yml up -d app
```

### Шаг 2: Проверьте логи приложения
```bash
docker logs gatsby-app-prod --tail=50 -f
```

Вы должны увидеть сообщения о подключении к базе данных.

### Шаг 3: Проверьте доступность данных через API
```bash
# Проверка API напрямую
docker exec -it gatsby-app-prod curl http://localhost:3000/api/registrations
```

### Шаг 4: Проверьте веб-интерфейс
Откройте страницу результатов в браузере: `http://your-domain.com/results`

## Скрипт для проверки подключения к БД

Создан скрипт `scripts/check-db-connection.js` для диагностики:

```bash
# На сервере
docker exec -it gatsby-app-prod node scripts/check-db-connection.js
```

Этот скрипт покажет:
- Статус подключения к БД
- Текущий search_path
- Список таблиц в схеме public
- Количество записей в таблице registrations
- Примеры записей

## Альтернативный метод восстановления (если проблема сохраняется)

Если после применения исправлений проблема не решена, попробуйте:

```bash
# 1. Остановите приложение
docker-compose -f docker-compose.prod.yml stop app

# 2. Удалите и пересоздайте базу
docker exec -i gatsby-postgres-prod psql -U gatsby_user -d postgres -c "DROP DATABASE IF EXISTS gatsby_db;"
docker exec -i gatsby-postgres-prod psql -U gatsby_user -d postgres -c "CREATE DATABASE gatsby_db;"

# 3. Восстановите данные
cat /root/backup_2025-11-01_09-25-33.sql | docker exec -i gatsby-postgres-prod psql -U gatsby_user -d gatsby_db

# 4. Проверьте данные
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "SELECT COUNT(*) FROM public.registrations;"
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "SELECT name FROM public.registrations LIMIT 5;"

# 5. Перезапустите приложение
docker-compose -f docker-compose.prod.yml start app
```

## Дополнительная диагностика

### Проверка схем в базе данных
```bash
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "\dn"
```

### Проверка таблиц в схеме public
```bash
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "\dt public.*"
```

### Проверка прав доступа к таблице
```bash
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "\dp public.registrations"
```

### Проверка search_path для пользователя
```bash
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "SHOW search_path;"
```

## Если ничего не помогло

Проверьте переменные окружения в контейнере:
```bash
docker exec -it gatsby-app-prod env | grep DATABASE
```

Убедитесь, что `DATABASE_URL` указывает на правильную базу данных.
