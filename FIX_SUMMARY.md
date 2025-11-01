# Сводка изменений: Исправление проблемы пустого списка регистраций

**Дата:** 2025-11-01  
**Проблема:** После восстановления БД из бэкапа список регистраций пуст в веб-интерфейсе  
**Статус:** ✅ Исправлено

---

## 📋 Описание проблемы

### Симптомы
- В базе данных 22 записи: `SELECT COUNT(*) FROM registrations` → 22
- API endpoint `/api/registrations` возвращает пустой массив `[]`
- Страница `/results` показывает "Пока никто не зарегистрировался"

### Причина
PostgreSQL не мог найти таблицу `registrations`, потому что:
1. SQL-запросы не указывали схему `public.` явно
2. `search_path` не был настроен в параметрах подключения
3. По умолчанию PostgreSQL может искать таблицы в другой схеме

---

## 🔧 Внесённые исправления

### 1. ✅ Файл: `lib/db/registrations.ts`
**Изменено:** Все SQL-запросы теперь явно указывают схему `public.`

**До:**
```typescript
'SELECT * FROM registrations ORDER BY created_at ASC'
'INSERT INTO registrations ...'
'UPDATE registrations ...'
'DELETE FROM registrations ...'
```

**После:**
```typescript
'SELECT * FROM public.registrations ORDER BY created_at ASC'
'INSERT INTO public.registrations ...'
'UPDATE public.registrations ...'
'DELETE FROM public.registrations ...'
```

**Затронутые методы:**
- `getAll()` - получение всех регистраций
- `getByCookieId()` - получение по cookie_id
- `create()` - создание новой регистрации
- `update()` - обновление регистрации
- `delete()` - удаление регистрации

---

### 2. ✅ Файл: `lib/db/postgres.ts`
**Изменено:** Добавлена настройка `search_path` в Pool

**До:**
```typescript
pool = new Pool({
  connectionString: databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
```

**После:**
```typescript
pool = new Pool({
  connectionString: databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Ensure we're using the public schema
  options: '-c search_path=public',
})
```

**Эффект:** Все подключения к БД будут автоматически использовать схему `public`

---

### 3. ✅ Файл: `scripts/init-db.sql`
**Изменено:** Все объекты создаются явно в схеме `public`

**До:**
```sql
CREATE TABLE IF NOT EXISTS registrations (...)
CREATE INDEX IF NOT EXISTS idx_registrations_cookie_id ON registrations(...)
CREATE FUNCTION update_updated_at_column() ...
CREATE TRIGGER update_registrations_updated_at ...
```

**После:**
```sql
CREATE TABLE IF NOT EXISTS public.registrations (...)
CREATE INDEX IF NOT EXISTS idx_registrations_cookie_id ON public.registrations(...)
CREATE FUNCTION public.update_updated_at_column() ...
CREATE TRIGGER update_registrations_updated_at ON public.registrations ...
```

**Эффект:** Гарантирует, что при инициализации БД все объекты создаются в правильной схеме

---

## 📦 Новые файлы

### 1. ✅ `scripts/check-db-connection.js`
**Назначение:** Диагностический скрипт для проверки подключения к БД

**Функции:**
- Проверка подключения к БД
- Отображение текущего `search_path`
- Список всех таблиц в схеме `public`
- Подсчёт записей в `registrations`
- Вывод примеров данных

**Использование:**
```bash
docker exec -it gatsby-app-prod node scripts/check-db-connection.js
```

---

### 2. ✅ `deploy-fix.sh` (Bash)
**Назначение:** Автоматическое применение исправлений на Linux-сервере

**Действия:**
1. Остановка контейнера приложения
2. Пересборка Docker-образа
3. Запуск контейнера
4. Проверка данных в БД
5. Проверка API
6. Вывод результатов

**Использование:**
```bash
bash deploy-fix.sh
```

---

### 3. ✅ `deploy-fix.ps1` (PowerShell)
**Назначение:** Автоматическое применение исправлений на Windows

Аналогичен `deploy-fix.sh`, но для Windows PowerShell.

**Использование:**
```powershell
.\deploy-fix.ps1
```

---

### 4. ✅ `TROUBLESHOOTING_EMPTY_LIST.md`
**Назначение:** Подробная документация по проблеме и её решению

**Содержит:**
- Описание проблемы
- Причины возникновения
- Подробные инструкции по исправлению
- Команды для диагностики
- Альтернативные методы решения

---

### 5. ✅ `URGENT_FIX_README.md`
**Назначение:** Краткая инструкция для быстрого решения

**Содержит:**
- Быстрые команды для применения исправлений
- Проверка результата
- Действия при сохранении проблемы

---

## 🚀 Инструкция по развёртыванию

### Вариант А: Автоматически (рекомендуется)

#### На Linux-сервере:
```bash
cd ~/gatsby_pg
bash deploy-fix.sh
```

#### На Windows локально:
```powershell
cd c:\source\gatsby_pg
.\deploy-fix.ps1
```

### Вариант Б: Вручную

```bash
# 1. Переход в директорию проекта
cd ~/gatsby_pg

# 2. Остановка приложения
docker-compose -f docker-compose.prod.yml stop app

# 3. Пересборка образа (применяет изменения в коде)
docker-compose -f docker-compose.prod.yml build app

# 4. Запуск приложения
docker-compose -f docker-compose.prod.yml up -d app

# 5. Ожидание запуска (15-20 секунд)
sleep 15

# 6. Проверка логов
docker logs gatsby-app-prod --tail=50

# 7. Проверка данных
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "SELECT COUNT(*) FROM public.registrations;"
```

---

## ✅ Проверка работоспособности

### 1. Проверка через API
```bash
curl http://your-domain.com/api/registrations
```
**Ожидаемый результат:** Массив JSON с 22 записями

### 2. Проверка через веб-интерфейс
Откройте в браузере: `http://your-domain.com/results`  
**Ожидаемый результат:** Список из 22 участников

### 3. Проверка через диагностический скрипт
```bash
docker exec -it gatsby-app-prod node scripts/check-db-connection.js
```
**Ожидаемый результат:**
```
✅ Connected successfully!
📂 Current search_path: public
📊 Tables in public schema:
  - registrations
👥 Total registrations: 22
📝 Sample registrations:
  - Раиль: Виски, Текила
  - Ксения: Шампанское, Вино, Виски
  ...
```

---

## 🔍 Диагностика при проблемах

### Если список всё ещё пуст:

#### 1. Проверьте логи приложения
```bash
docker logs gatsby-app-prod -f
```
Ищите ошибки подключения к БД или SQL-запросов.

#### 2. Проверьте переменные окружения
```bash
docker exec -it gatsby-app-prod env | grep DATABASE
```
Должно быть: `DATABASE_URL=postgresql://gatsby_user:gatsby_password@postgres:5432/gatsby_db`

#### 3. Проверьте схемы в БД
```bash
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "\dn"
```
Должна быть схема `public`.

#### 4. Проверьте таблицы
```bash
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "\dt public.*"
```
Должна быть таблица `public.registrations`.

#### 5. Проверьте данные в таблице
```bash
docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "SELECT id, name FROM public.registrations LIMIT 5;"
```

---

## 📊 Технические детали

### Изменённые строки кода:
- **lib/db/registrations.ts:** 5 SQL-запросов (строки 17, 24, 37, 55, 67)
- **lib/db/postgres.ts:** Добавлена опция `search_path` (строка 23)
- **scripts/init-db.sql:** 5 объектов БД (таблица, индексы, функция, триггер)

### Совместимость:
- ✅ Обратная совместимость: Да
- ✅ Требует миграции данных: Нет
- ✅ Требует пересборки образа: Да
- ✅ Требует перезапуска контейнеров: Да

### Затронутые компоненты:
- [x] Backend API (Next.js API Routes)
- [x] Database layer (PostgreSQL connection)
- [x] Database queries (SQL)
- [ ] Frontend (без изменений)
- [ ] Docker Compose (без изменений)
- [ ] Environment variables (без изменений)

---

## 📞 Поддержка

Если после применения всех исправлений проблема сохраняется, соберите следующую информацию:

```bash
# Сохраните в файл и отправьте для анализа
{
  echo "=== Docker Containers ==="
  docker ps -a
  
  echo -e "\n=== App Logs ==="
  docker logs gatsby-app-prod --tail=100
  
  echo -e "\n=== DB Logs ==="
  docker logs gatsby-postgres-prod --tail=50
  
  echo -e "\n=== Environment ==="
  docker exec -it gatsby-app-prod env | grep DATABASE
  
  echo -e "\n=== DB Tables ==="
  docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "\dt public.*"
  
  echo -e "\n=== DB Data Count ==="
  docker exec -it gatsby-postgres-prod psql -U gatsby_user -d gatsby_db -c "SELECT COUNT(*) FROM public.registrations;"
  
  echo -e "\n=== DB Connection Test ==="
  docker exec -it gatsby-app-prod node scripts/check-db-connection.js
} > diagnostic-output.txt
```

---

## 📝 Changelog

**Version 1.0 - 2025-11-01**
- ✅ Исправлены SQL-запросы с явным указанием схемы `public`
- ✅ Добавлена настройка `search_path` в Pool
- ✅ Обновлён `init-db.sql` для работы со схемой `public`
- ✅ Добавлен диагностический скрипт `check-db-connection.js`
- ✅ Добавлены скрипты развёртывания для Bash и PowerShell
- ✅ Создана документация по устранению проблемы

---

**Автор исправлений:** GitHub Copilot  
**Дата создания:** 2025-11-01  
**Статус:** Готово к развёртыванию
