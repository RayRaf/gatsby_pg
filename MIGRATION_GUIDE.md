# Миграция на PostgreSQL в Docker

## 📋 Обзор изменений

Проект успешно адаптирован для работы с PostgreSQL в Docker контейнере вместо Supabase.

### Что было изменено:

1. ✅ **Docker конфигурация**
   - `docker-compose.yml` - оркестрация PostgreSQL + Next.js приложения
   - `Dockerfile` - контейнеризация Next.js приложения
   - `scripts/init-db.sql` - инициализация базы данных

2. ✅ **Новые файлы для работы с PostgreSQL**
   - `lib/db/postgres.ts` - менеджер подключения к PostgreSQL
   - `lib/db/registrations.ts` - модель для работы с таблицей registrations
   - `.env.example` - пример конфигурации

3. ⚠️ **Требуется обновить** (см. инструкции ниже):
   - `app/page.tsx` - заменить Supabase клиент на PostgreSQL API
   - `app/results/page.tsx` - заменить Supabase клиент на PostgreSQL API
   - `package.json` - добавить зависимость `pg`

## 🚀 Быстрый старт

### Шаг 1: Установка зависимости PostgreSQL

```bash
npm install pg
npm install --save-dev @types/pg
```

### Шаг 2: Создание .env файла

```bash
cp .env.example .env
```

### Шаг 3: Запуск Docker окружения

```bash
# Запуск всех сервисов (PostgreSQL + Next.js)
docker-compose up -d

# Или только PostgreSQL (если хотите запустить Next.js локально)
docker-compose up -d postgres
```

### Шаг 4: Проверка работы

- Приложение: http://localhost:3000
- PostgreSQL: localhost:5432
  - База: `gatsby_db`
  - Пользователь: `gatsby_user`
  - Пароль: `gatsby_password`

## 📝 Полезные команды

```bash
# Просмотр логов
docker-compose logs -f

# Остановка сервисов
docker-compose down

# Остановка и удаление данных
docker-compose down -v

# Перезапуск
docker-compose restart

# Подключение к PostgreSQL
docker-compose exec postgres psql -U gatsby_user -d gatsby_db

# Выполнение SQL команд
docker-compose exec postgres psql -U gatsby_user -d gatsby_db -c "SELECT * FROM registrations;"
```

## 🔄 Что нужно сделать для полной миграции

### 1. Обновить package.json

Добавьте зависимости PostgreSQL:

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

### 2. Создать API Routes для работы с БД

Так как работа с БД должна происходить на сервере, нужно создать API endpoints:

**Создать файл: `app/api/registrations/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { registrations } from '@/lib/db/registrations'

// GET all registrations
export async function GET() {
  try {
    const data = await registrations.getAll()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}

// POST new registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, drinks, individual_wishes, cookie_id } = body

    if (!name || !cookie_id) {
      return NextResponse.json(
        { error: 'Name and cookie_id are required' },
        { status: 400 }
      )
    }

    const registration = await registrations.create({
      name,
      drinks: drinks || [],
      individual_wishes,
      cookie_id,
    })

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    console.error('Error creating registration:', error)
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    )
  }
}
```

**Создать файл: `app/api/registrations/[cookieId]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { registrations } from '@/lib/db/registrations'

// GET registration by cookie_id
export async function GET(
  request: NextRequest,
  { params }: { params: { cookieId: string } }
) {
  try {
    const registration = await registrations.getByCookieId(params.cookieId)
    
    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Error fetching registration:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registration' },
      { status: 500 }
    )
  }
}

// PUT update registration
export async function PUT(
  request: NextRequest,
  { params }: { params: { cookieId: string } }
) {
  try {
    const body = await request.json()
    const { drinks, individual_wishes } = body

    const registration = await registrations.update(params.cookieId, {
      drinks,
      individual_wishes,
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Error updating registration:', error)
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    )
  }
}

// DELETE registration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { cookieId: string } }
) {
  try {
    const success = await registrations.delete(params.cookieId)

    if (!success) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting registration:', error)
    return NextResponse.json(
      { error: 'Failed to delete registration' },
      { status: 500 }
    )
  }
}
```

### 3. Обновить клиентский код

В `app/page.tsx` и `app/results/page.tsx` замените вызовы Supabase на fetch запросы к API:

**Пример для page.tsx:**

```typescript
// Вместо:
// const supabase = createClient()
// const { error } = await supabase.from("registrations").insert({...})

// Используйте:
const response = await fetch('/api/registrations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: name.trim(),
    drinks: selectedDrinks,
    individual_wishes: wishes.trim(),
    cookie_id: cookieId,
  }),
})

if (!response.ok) throw new Error('Failed to create registration')
```

## 🔍 Проверка миграции

### Тест подключения к БД

```bash
# Войти в контейнер PostgreSQL
docker-compose exec postgres psql -U gatsby_user -d gatsby_db

# Проверить таблицы
\dt

# Проверить данные
SELECT * FROM registrations;

# Выход
\q
```

### Структура таблицы

```sql
                          Table "public.registrations"
     Column         |           Type           | Collation | Nullable | Default
--------------------+--------------------------+-----------+----------+---------
 id                 | uuid                     |           | not null | gen_random_uuid()
 name               | text                     |           | not null |
 drinks             | text[]                   |           |          | '{}'::text[]
 individual_wishes  | text                     |           |          |
 cookie_id          | text                     |           | not null |
 created_at         | timestamp with time zone |           |          | now()
 updated_at         | timestamp with time zone |           |          | now()
```

## 📊 Сравнение: Supabase vs Docker PostgreSQL

| Аспект | Supabase | Docker PostgreSQL |
|--------|----------|-------------------|
| **Настройка** | Облачная, готова к использованию | Требует Docker и конфигурации |
| **Стоимость** | Бесплатный план ограничен | Полностью бесплатно |
| **RLS (Row Level Security)** | Встроенная поддержка | Требует реализации на уровне приложения |
| **Аутентификация** | Встроенная | Нужно реализовать самостоятельно |
| **Realtime** | Поддерживается | Требует дополнительной настройки |
| **Контроль** | Ограниченный | Полный контроль |
| **Локальная разработка** | Требует интернет | Работает offline |

## ⚠️ Важные замечания

1. **Безопасность**: В текущей реализации нет аутентификации. RLS policies были удалены, так как это специфично для Supabase. Для production нужно добавить:
   - Аутентификацию пользователей
   - Валидацию на уровне API
   - Rate limiting

2. **Cookie-based идентификация**: Текущий подход с cookie_id остается, но учтите, что это не защищенное решение для production.

3. **Production deployment**: Для production использования:
   - Измените пароли в docker-compose.yml
   - Используйте переменные окружения
   - Настройте SSL/TLS
   - Добавьте резервное копирование БД

## 🎯 Вывод

**Адаптация полностью реальна и осуществима!** 

Сложность: **Средняя** (требуется изменить ~200 строк кода)

Преимущества:
- ✅ Полный контроль над БД
- ✅ Бесплатное решение
- ✅ Работает offline
- ✅ Легко масштабируется

Следующие шаги:
1. Установить `pg` пакет
2. Создать API routes
3. Обновить клиентский код
4. Протестировать
