# 🚀 Шпаргалка: Команды для исправления проблемы

## Быстрое применение исправлений

### Автоматически (1 команда):
```bash
cd ~/gatsby_pg && bash deploy-fix.sh
```

### Вручную (5 команд):
```bash
cd ~/gatsby_pg
docker-compose -f docker-compose.prod.yml stop app
docker-compose -f docker-compose.prod.yml build app
docker-compose -f docker-compose.prod.yml up -d app
docker logs gatsby-app-prod --tail=50
```

---

## Проверка результата

```bash
# Проверка БД (должно быть 22)
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "SELECT COUNT(*) FROM public.registrations;"

# Проверка API (должно быть 22 объекта)
curl http://localhost:3000/api/registrations | jq '. | length'

# Диагностика (показывает всё)
docker exec -it gatsby-app-prod node scripts/check-db-connection.js
```

---

## Восстановление данных (если потеряны)

```bash
# Полное восстановление с нуля
docker exec -i gatsby-postgres-prod psql -U gatsby_user -d postgres -c "DROP DATABASE IF EXISTS gatsby_db;"
docker exec -i gatsby-postgres-prod psql -U gatsby_user -d postgres -c "CREATE DATABASE gatsby_db;"
cat ~/backup_2025-11-01_09-25-33.sql | docker exec -i gatsby-postgres-prod psql -U gatsby_user -d gatsby_db
docker-compose -f docker-compose.prod.yml restart app
```

---

## Диагностика проблем

```bash
# Логи приложения
docker logs gatsby-app-prod -f

# Логи БД
docker logs gatsby-postgres-prod -f

# Переменные окружения
docker exec -it gatsby-app-prod env | grep DATABASE

# Список таблиц
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "\dt public.*"

# Содержимое таблицы
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "SELECT id, name, drinks FROM public.registrations LIMIT 5;"

# Search path
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "SHOW search_path;"
```

---

## Полный перезапуск (если ничего не помогает)

```bash
# Остановить всё
docker-compose -f docker-compose.prod.yml down

# Запустить заново
docker-compose -f docker-compose.prod.yml up -d

# Проверить
sleep 15
docker ps
docker logs gatsby-app-prod --tail=30
```

---

## Создание бэкапа

```bash
# Текущее состояние
docker exec -i gatsby-postgres-prod pg_dump -U gatsby_user gatsby_db > ~/backup_$(date +%Y%m%d_%H%M%S).sql

# Проверить размер
ls -lh ~/backup_*.sql | tail -1
```

---

## Подключение к БД (интерактивно)

```bash
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db
```

Внутри psql:
```sql
-- Список таблиц
\dt public.*

-- Подсчёт записей
SELECT COUNT(*) FROM public.registrations;

-- Примеры данных
SELECT id, name, drinks FROM public.registrations LIMIT 5;

-- Search path
SHOW search_path;

-- Выход
\q
```

---

## Мониторинг

```bash
# Статус контейнеров
docker ps

# Использование ресурсов
docker stats gatsby-app-prod gatsby-postgres-prod --no-stream

# Место на диске
df -h
```

---

## Быстрые проверки (скопируйте всё сразу)

```bash
echo "=== Container Status ===" && \
docker ps --filter name=gatsby && \
echo -e "\n=== DB Count ===" && \
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -t -c "SELECT COUNT(*) FROM public.registrations;" && \
echo -e "\n=== API Test ===" && \
curl -s http://localhost:3000/api/registrations | head -c 200
```

---

## Что проверять если не работает

1. **Контейнеры запущены?**
   ```bash
   docker ps | grep gatsby
   ```
   Должны быть: `gatsby-app-prod` и `gatsby-postgres-prod`

2. **Нет ошибок в логах?**
   ```bash
   docker logs gatsby-app-prod --tail=20 2>&1 | grep -i error
   ```
   Не должно быть ошибок подключения к БД

3. **DATABASE_URL правильный?**
   ```bash
   docker exec -it gatsby-app-prod env | grep DATABASE_URL
   ```
   Должно быть: `postgresql://gatsby_user:...@postgres:5432/gatsby_db`

4. **Таблица существует?**
   ```bash
   docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "\dt public.registrations"
   ```
   Должна быть таблица `public.registrations`

5. **Данные есть?**
   ```bash
   docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "SELECT COUNT(*) FROM public.registrations;"
   ```
   Должно быть 22

---

## Экстренное восстановление работоспособности

```bash
# Скопируйте и выполните всё сразу:
cd ~/gatsby_pg && \
docker-compose -f docker-compose.prod.yml down && \
docker-compose -f docker-compose.prod.yml up -d postgres && \
sleep 10 && \
docker exec -i gatsby-postgres-prod psql -U gatsby_user -d postgres -c "DROP DATABASE IF EXISTS gatsby_db;" && \
docker exec -i gatsby-postgres-prod psql -U gatsby_user -d postgres -c "CREATE DATABASE gatsby_db;" && \
cat ~/backup_2025-11-01_09-25-33.sql | docker exec -i gatsby-postgres-prod psql -U gatsby_user -d gatsby_db && \
docker-compose -f docker-compose.prod.yml up -d app && \
sleep 15 && \
echo "=== Checking result ===" && \
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -t -c "SELECT COUNT(*) FROM public.registrations;"
```

---

## Полезные алиасы (добавьте в ~/.bashrc)

```bash
# Добавьте в ~/.bashrc для удобства:
alias gatsby-logs='docker logs gatsby-app-prod -f'
alias gatsby-db='docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db'
alias gatsby-check='docker exec -it gatsby-app-prod node scripts/check-db-connection.js'
alias gatsby-restart='cd ~/gatsby_pg && docker-compose -f docker-compose.prod.yml restart app'
alias gatsby-status='docker ps --filter name=gatsby'

# Применить изменения:
source ~/.bashrc
```

Использование:
```bash
gatsby-logs     # Логи приложения
gatsby-db       # Подключение к БД
gatsby-check    # Проверка подключения
gatsby-restart  # Перезапуск
gatsby-status   # Статус контейнеров
```

---

**Совет:** Добавьте эту страницу в закладки!

**Поддержка:** Если ничего не помогает, соберите диагностическую информацию:
```bash
bash deploy-fix.sh > diagnostic.log 2>&1
docker logs gatsby-app-prod --tail=100 >> diagnostic.log
docker logs gatsby-postgres-prod --tail=50 >> diagnostic.log
docker exec -it gatsby-app-prod node scripts/check-db-connection.js >> diagnostic.log
cat diagnostic.log
```
