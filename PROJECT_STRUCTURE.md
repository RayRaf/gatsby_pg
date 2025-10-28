# 📁 Структура проекта после миграции

## Новые файлы (созданы для Docker PostgreSQL)

```
v0-gatsby-style-website/
│
├── 🐳 DOCKER КОНФИГУРАЦИЯ
│   ├── docker-compose.yml          # Оркестрация PostgreSQL + App
│   ├── Dockerfile                  # Контейнер для Next.js
│   ├── .dockerignore              # Исключения для Docker
│   └── start-docker.sh            # Скрипт быстрого запуска ✨
│
├── 🗄️ БАЗА ДАННЫХ
│   ├── lib/
│   │   └── db/
│   │       ├── postgres.ts         # Connection pool и query helpers ✨
│   │       └── registrations.ts    # Модель для работы с БД ✨
│   └── scripts/
│       ├── init-db.sql             # SQL инициализация для Docker ✨
│       └── 001_create_registrations_table.sql  # Старый Supabase скрипт
│
├── 🛣️ API ROUTES
│   └── app/
│       └── api/
│           └── registrations/
│               ├── route.ts                    # GET /api/registrations (все)
│               │                               # POST /api/registrations (создать) ✨
│               └── [cookieId]/
│                   └── route.ts                # GET /api/registrations/:id (один)
│                                               # PUT /api/registrations/:id (обновить)
│                                               # DELETE /api/registrations/:id (удалить) ✨
│
├── 📚 ДОКУМЕНТАЦИЯ
│   ├── MIGRATION_SUMMARY.md       # Сводка анализа миграции ✨
│   ├── MIGRATION_GUIDE.md         # Полное руководство (450+ строк) ✨
│   ├── DOCKER_QUICKSTART.md       # Быстрый старт ✨
│   ├── CODE_CHANGES.md            # Детальные изменения в коде ✨
│   └── .env.example               # Пример конфигурации ✨
│
└── 📦 СУЩЕСТВУЮЩИЕ ФАЙЛЫ (требуют обновления)
    ├── package.json               # ⚠️ Добавить: pg, @types/pg
    ├── app/
    │   ├── page.tsx               # ⚠️ Заменить Supabase на fetch API
    │   └── results/
    │       └── page.tsx           # ⚠️ Заменить Supabase на fetch API
    └── .gitignore                 # ⚠️ Добавить Docker файлы

✨ = Новый файл
⚠️ = Требует изменений
```

---

## Детальное дерево файлов

```
v0-gatsby-style-website/
│
├── .dockerignore                   ✨ NEW
├── .env.example                    ✨ NEW
├── .gitignore                      (обновить)
├── CODE_CHANGES.md                 ✨ NEW
├── DOCKER_QUICKSTART.md            ✨ NEW
├── Dockerfile                      ✨ NEW
├── MIGRATION_GUIDE.md              ✨ NEW
├── MIGRATION_SUMMARY.md            ✨ NEW
├── PROJECT_STRUCTURE.md            ✨ NEW (этот файл)
├── README.md                       (существующий)
├── components.json
├── docker-compose.yml              ✨ NEW
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json                    ⚠️ UPDATE
├── pnpm-lock.yaml
├── postcss.config.mjs
├── start-docker.sh                 ✨ NEW (executable)
├── tsconfig.json
│
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                    ⚠️ UPDATE (~80 строк изменений)
│   ├── api/                        ✨ NEW DIRECTORY
│   │   └── registrations/
│   │       ├── route.ts            ✨ NEW (~45 строк)
│   │       └── [cookieId]/
│   │           └── route.ts        ✨ NEW (~85 строк)
│   └── results/
│       └── page.tsx                ⚠️ UPDATE (~20 строк изменений)
│
├── components/
│   ├── theme-provider.tsx
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── input.tsx
│       └── textarea.tsx
│
├── lib/
│   ├── utils.ts
│   ├── db/                         ✨ NEW DIRECTORY
│   │   ├── postgres.ts             ✨ NEW (~40 строк)
│   │   └── registrations.ts        ✨ NEW (~65 строк)
│   └── supabase/                   (можно удалить после миграции)
│       ├── client.ts
│       └── server.ts
│
├── public/
│
├── scripts/
│   ├── 001_create_registrations_table.sql  (старый Supabase)
│   └── init-db.sql                 ✨ NEW (для Docker)
│
└── styles/
    └── globals.css
```

---

## Статистика файлов

### Созданные файлы: 13
```
Конфигурация Docker:     4 файла  (docker-compose.yml, Dockerfile, .dockerignore, start-docker.sh)
Database Layer:          3 файла  (postgres.ts, registrations.ts, init-db.sql)
API Routes:              2 файла  (route.ts × 2)
Документация:            4 файла  (MIGRATION_*, DOCKER_QUICKSTART, CODE_CHANGES, PROJECT_STRUCTURE)
```

### Файлы для обновления: 3
```
Code Changes:            2 файла  (app/page.tsx, app/results/page.tsx)
Configuration:           1 файл   (package.json)
```

### Строки кода

| Категория | Файлов | Строк кода |
|-----------|--------|------------|
| Docker Config | 2 | ~120 |
| Database Layer | 2 | ~105 |
| API Routes | 2 | ~130 |
| SQL Scripts | 1 | ~40 |
| Documentation | 5 | ~800 |
| Code Updates | 2 | ~100 |
| **ИТОГО** | **14** | **~1295** |

---

## Зависимости

### Добавить в package.json:
```json
{
  "dependencies": {
    "pg": "^8.11.3"
  },
  "devDependencies": {
    "@types/pg": "^8.10.9"
  }
}
```

### Можно удалить после миграции (опционально):
```json
{
  "dependencies": {
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest"
  }
}
```

---

## Docker Volumes

```yaml
volumes:
  postgres_data:           # Персистентное хранилище PostgreSQL
```

**Путь в контейнере:** `/var/lib/postgresql/data`  
**Управление:**
```bash
# Просмотр
docker volume ls

# Удаление (с потерей данных!)
docker-compose down -v
```

---

## Порты

```
3000  → Next.js Application (Web Interface)
5432  → PostgreSQL Database (Direct Access)
```

---

## Environment Variables

```bash
# .env
DATABASE_URL=postgresql://gatsby_user:gatsby_password@localhost:5432/gatsby_db
NODE_ENV=development
```

---

## Рекомендуемый порядок создания файлов

Если воссоздавать проект с нуля:

1. **Docker конфигурация**
   ```bash
   touch docker-compose.yml Dockerfile .dockerignore
   ```

2. **Database layer**
   ```bash
   mkdir -p lib/db
   touch lib/db/postgres.ts lib/db/registrations.ts
   touch scripts/init-db.sql
   ```

3. **API Routes**
   ```bash
   mkdir -p app/api/registrations/[cookieId]
   touch app/api/registrations/route.ts
   touch app/api/registrations/[cookieId]/route.ts
   ```

4. **Environment & Scripts**
   ```bash
   touch .env.example start-docker.sh
   chmod +x start-docker.sh
   ```

5. **Документация**
   ```bash
   touch MIGRATION_GUIDE.md DOCKER_QUICKSTART.md CODE_CHANGES.md
   ```

---

## Быстрые команды для навигации

```bash
# Просмотр всех новых файлов
find . -name "*.md" -o -name "docker-*" -o -name "Dockerfile" -o -name "start-docker.sh"

# Просмотр API routes
ls -la app/api/registrations/

# Просмотр database layer
ls -la lib/db/

# Просмотр документации
ls -la *.md
```

---

## Чек-лист файлов

### ✅ Docker Setup
- [x] docker-compose.yml
- [x] Dockerfile  
- [x] .dockerignore
- [x] start-docker.sh (executable)

### ✅ Database
- [x] lib/db/postgres.ts
- [x] lib/db/registrations.ts
- [x] scripts/init-db.sql

### ✅ API Routes
- [x] app/api/registrations/route.ts
- [x] app/api/registrations/[cookieId]/route.ts

### ✅ Documentation
- [x] MIGRATION_SUMMARY.md
- [x] MIGRATION_GUIDE.md
- [x] DOCKER_QUICKSTART.md
- [x] CODE_CHANGES.md
- [x] PROJECT_STRUCTURE.md
- [x] .env.example

### ⏳ Pending Updates
- [ ] package.json (add pg dependencies)
- [ ] app/page.tsx (replace Supabase with fetch)
- [ ] app/results/page.tsx (replace Supabase with fetch)
- [ ] .gitignore (add Docker files)

---

## Финальный размер проекта

```
Исходный проект:      ~50 файлов
После миграции:       ~63 файлов (+13)
Новый код:            ~1300 строк
Изменений в коде:     ~100 строк
```

---

**🎉 Проект готов к миграции на Docker PostgreSQL!**
