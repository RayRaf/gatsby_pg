# Изменения в существующих файлах для миграции на PostgreSQL

## 1. package.json

Добавьте зависимости PostgreSQL в секцию `dependencies`:

```json
{
  "dependencies": {
    // ... существующие зависимости ...
    "pg": "^8.11.3"
  },
  "devDependencies": {
    // ... существующие dev зависимости ...
    "@types/pg": "^8.10.9"
  }
}
```

## 2. app/page.tsx

### Изменение импортов

**Было:**
```typescript
import { createClient } from "@/lib/supabase/client"
```

**Стало:**
```typescript
// Удалите импорт createClient
```

### Изменение handleSave (обновление существующей регистрации)

**Было:**
```typescript
const supabase = createClient()

try {
  if (isExistingUser) {
    const { error } = await supabase
      .from("registrations")
      .update({
        drinks: selectedDrinks,
        individual_wishes: wishes.trim(),
      })
      .eq("cookie_id", cookieId)

    if (error) throw error
    console.log("Регистрация обновлена")
  }
```

**Стало:**
```typescript
try {
  if (isExistingUser) {
    const response = await fetch(`/api/registrations/${cookieId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drinks: selectedDrinks,
        individual_wishes: wishes.trim(),
      }),
    })

    if (!response.ok) throw new Error('Failed to update registration')
    console.log("Регистрация обновлена")
  }
```

### Изменение handleSave (создание новой регистрации)

**Было:**
```typescript
  } else {
    const { error } = await supabase.from("registrations").insert({
      name: name.trim(),
      drinks: selectedDrinks,
      individual_wishes: wishes.trim(),
      cookie_id: cookieId,
    })

    if (error) throw error
    console.log("Новая регистрация создана")
  }
```

**Стало:**
```typescript
  } else {
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
    console.log("Новая регистрация создана")
  }
```

### Изменение handleDelete

**Было:**
```typescript
const handleDelete = async () => {
  if (!isExistingUser) return
  setIsLoading(true)

  const supabase = createClient()

  try {
    const { error } = await supabase.from("registrations").delete().eq("cookie_id", cookieId)

    if (error) throw error

    document.cookie = `gatsby-user-id=; path=/; max-age=0`

    console.log("Регистрация удалена")
    onClose()
  } catch (error) {
    console.error("Ошибка при удалении:", error)
  } finally {
    setIsLoading(false)
  }
}
```

**Стало:**
```typescript
const handleDelete = async () => {
  if (!isExistingUser) return
  setIsLoading(true)

  try {
    const response = await fetch(`/api/registrations/${cookieId}`, {
      method: 'DELETE',
    })

    if (!response.ok) throw new Error('Failed to delete registration')

    document.cookie = `gatsby-user-id=; path=/; max-age=0`

    console.log("Регистрация удалена")
    onClose()
  } catch (error) {
    console.error("Ошибка при удалении:", error)
  } finally {
    setIsLoading(false)
  }
}
```

### Изменение checkExistingRegistration

**Было:**
```typescript
const checkExistingRegistration = async (cookieValue: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.from("registrations").select("*").eq("cookie_id", cookieValue).single()

  if (data && !error) {
    setName(data.name)
    setWishes(data.individual_wishes || "")
    setIsExistingUser(true)

    const drinksObj = {
      champagne: data.drinks?.includes("Шампанское") || false,
      wine: data.drinks?.includes("Вино") || false,
      whiskey: data.drinks?.includes("Виски") || false,
      tequila: data.drinks?.includes("Текила") || false,
    }
    setDrinks(drinksObj)
  }
}
```

**Стало:**
```typescript
const checkExistingRegistration = async (cookieValue: string) => {
  try {
    const response = await fetch(`/api/registrations/${cookieValue}`)
    
    if (response.ok) {
      const data = await response.json()
      setName(data.name)
      setWishes(data.individual_wishes || "")
      setIsExistingUser(true)

      const drinksObj = {
        champagne: data.drinks?.includes("Шампанское") || false,
        wine: data.drinks?.includes("Вино") || false,
        whiskey: data.drinks?.includes("Виски") || false,
        tequila: data.drinks?.includes("Текила") || false,
      }
      setDrinks(drinksObj)
    }
  } catch (error) {
    console.error("Ошибка при проверке регистрации:", error)
  }
}
```

## 3. app/results/page.tsx

### Изменение импортов

**Было:**
```typescript
import { createClient } from "@/lib/supabase/client"
```

**Стало:**
```typescript
// Удалите импорт createClient
```

### Изменение fetchParticipants

**Было:**
```typescript
const fetchParticipants = async () => {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("registrations").select("*").order("created_at", { ascending: true })

    if (error) throw error

    setParticipants(data || [])
  } catch (error) {
    console.error("Ошибка при загрузке участников:", error)
  } finally {
    setIsLoading(false)
  }
}
```

**Стало:**
```typescript
const fetchParticipants = async () => {
  try {
    const response = await fetch('/api/registrations')
    
    if (!response.ok) throw new Error('Failed to fetch registrations')
    
    const data = await response.json()
    setParticipants(data || [])
  } catch (error) {
    console.error("Ошибка при загрузке участников:", error)
  } finally {
    setIsLoading(false)
  }
}
```

## 4. .gitignore

Добавьте Docker-специфичные файлы:

```
# ... существующий контент ...

# Docker
.env
docker-compose.override.yml

# PostgreSQL data
postgres-data/
```

## Итоговый чеклист

- [ ] Обновить `package.json` с зависимостями `pg` и `@types/pg`
- [ ] Запустить `npm install --legacy-peer-deps`
- [ ] Обновить `app/page.tsx` (все 4 функции)
- [ ] Обновить `app/results/page.tsx` (1 функция)
- [ ] Добавить строки в `.gitignore`
- [ ] Создать `.env` файл: `cp .env.example .env`
- [ ] Запустить Docker: `docker-compose up -d`
- [ ] Протестировать приложение

## Команды для применения изменений

```bash
# 1. Установить зависимости
npm install --legacy-peer-deps pg @types/pg

# 2. Создать .env
cp .env.example .env

# 3. Запустить Docker
docker-compose up -d

# 4. Проверить логи
docker-compose logs -f
```

## Тестирование

После внесения изменений проверьте:

1. ✅ Создание новой регистрации
2. ✅ Обновление существующей регистрации
3. ✅ Удаление регистрации
4. ✅ Просмотр всех регистраций на странице /results
5. ✅ Проверка данных в БД: `docker-compose exec postgres psql -U gatsby_user -d gatsby_db -c "SELECT * FROM registrations;"`
