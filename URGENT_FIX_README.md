# СРОЧНОЕ ИСПРАВЛЕНИЕ: Пустой список регистраций

## Проблема
После восстановления БД из бэкапа в продакшене список регистраций пустой, хотя в базе 22 записи.

## Причина
SQL-запросы не указывали схему `public.` явно, что приводило к проблемам с поиском таблицы.

## Быстрое решение

### На сервере (Linux):
```bash
cd ~/gatsby_pg

# Применить исправления
bash deploy-fix.sh
```

### На Windows (локально):
```powershell
cd c:\source\gatsby_pg

# Применить исправления
.\deploy-fix.ps1
```

### Вручную (если скрипты не работают):
```bash
# 1. Остановить и пересобрать
docker-compose -f docker-compose.prod.yml stop app
docker-compose -f docker-compose.prod.yml build app
docker-compose -f docker-compose.prod.yml up -d app

# 2. Проверить
docker logs gatsby-app-prod --tail=50
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "SELECT COUNT(*) FROM public.registrations;"
```

## Что было исправлено

### ✅ `lib/db/registrations.ts`
Все запросы теперь используют `public.registrations`:
```typescript
'SELECT * FROM public.registrations ORDER BY created_at ASC'
'INSERT INTO public.registrations ...'
'UPDATE public.registrations ...'
'DELETE FROM public.registrations ...'
```

### ✅ `lib/db/postgres.ts`
Добавлена настройка `search_path`:
```typescript
pool = new Pool({
  connectionString: databaseUrl,
  options: '-c search_path=public',
})
```

### ✅ `scripts/init-db.sql`
Все объекты создаются явно в схеме `public`.

## Проверка результата

### 1. Проверка через API
```bash
curl http://your-domain.com/api/registrations
# Должен вернуть массив с 22 записями
```

### 2. Проверка через веб-интерфейс
Откройте: `http://your-domain.com/results`

### 3. Диагностический скрипт
```bash
docker exec -it gatsby-app-prod node scripts/check-db-connection.js
```

## Если проблема сохраняется

### 1. Проверьте логи
```bash
docker logs gatsby-app-prod -f
docker logs gatsby-postgres-prod -f
```

### 2. Проверьте переменные окружения
```bash
docker exec -it gatsby-app-prod env | grep DATABASE
# Должно показать: DATABASE_URL=postgresql://gatsby_user:gatsby_password@postgres:5432/gatsby_db
```

### 3. Проверьте подключение к БД
```bash
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db
\dt public.*
SELECT COUNT(*) FROM public.registrations;
\q
```

### 4. Полное пересоздание (крайний случай)
```bash
# Сохраните данные
docker exec -i gatsby-postgres-prod pg_dump -U gatsby_user gatsby_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Пересоздайте всё
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d postgres

# Дождитесь готовности БД
sleep 10

# Восстановите данные
cat backup_2025-11-01_09-25-33.sql | docker exec -i gatsby-postgres-prod psql -U gatsby_user -d gatsby_db

# Запустите приложение
docker-compose -f docker-compose.prod.yml up -d app
```

## Контакты для поддержки
Если проблема не решена, соберите следующую информацию:
1. Вывод: `docker logs gatsby-app-prod --tail=100`
2. Вывод: `docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "\dt public.*"`
3. Вывод: `docker exec -it gatsby-app-prod env | grep DATABASE`

---
**Дата создания:** 2025-11-01  
**Версия:** 1.0
