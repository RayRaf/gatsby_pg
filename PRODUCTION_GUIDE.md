# 🚀 Production Deployment Guide

## Режимы запуска

### 🛠️ Development (текущий режим)

```bash
# Запуск dev окружения
docker-compose up -d

# Пересборка
docker-compose up -d --build

# Остановка
docker-compose down
```

**Особенности:**
- Hot reload (автоматическая перезагрузка при изменениях)
- Source maps включены
- Больше логирования
- Порт: 3000

---

### 🎯 Production

```bash
# 1. Создайте production конфиг
cp .env.production.example .env.production

# 2. ОБЯЗАТЕЛЬНО измените пароль в .env.production
nano .env.production

# 3. Запустите production сборку
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Остановка production
docker-compose -f docker-compose.prod.yml down
```

**Особенности:**
- Оптимизированная сборка
- Минифицированный код
- Нет hot reload
- Меньше логов
- Порт: настраивается через .env.production

---

## ⚙️ Настройка Production

### 1. Безопасность

**Обязательно измените в `.env.production`:**

```bash
POSTGRES_PASSWORD=ваш_сложный_пароль_здесь
DATABASE_URL=postgresql://gatsby_user:ваш_сложный_пароль_здесь@postgres:5432/gatsby_db
```

### 2. Порты

По умолчанию:
- PostgreSQL: 5432
- App: 3000

Изменить можно в `.env.production`:

```bash
POSTGRES_PORT=5433
APP_PORT=8080
```

### 3. Проверка работоспособности

```bash
# Статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Логи приложения
docker-compose -f docker-compose.prod.yml logs app

# Логи PostgreSQL
docker-compose -f docker-compose.prod.yml logs postgres

# Подключение к БД
docker-compose -f docker-compose.prod.yml exec postgres psql -U gatsby_user -d gatsby_db
```

---

## 🔄 Обновление Production

```bash
# 1. Остановить текущие контейнеры
docker-compose -f docker-compose.prod.yml down

# 2. Сделать бэкап БД (важно!)
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U gatsby_user gatsby_db > backup.sql

# 3. Обновить код (git pull или скопировать файлы)

# 4. Пересобрать и запустить
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# 5. Проверить логи
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 💾 Бэкап и восстановление

### Создание бэкапа

```bash
# Автоматический бэкап
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U gatsby_user gatsby_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Или с сжатием
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U gatsby_user gatsby_db | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Восстановление из бэкапа

```bash
# Остановить приложение
docker-compose -f docker-compose.prod.yml stop app

# Восстановить данные
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U gatsby_user gatsby_db

# Или из gzip
gunzip -c backup.sql.gz | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U gatsby_user gatsby_db

# Запустить приложение
docker-compose -f docker-compose.prod.yml start app
```

---

## 🔍 Мониторинг

### Проверка здоровья

```bash
# Проверить что PostgreSQL отвечает
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U gatsby_user

# Проверить приложение
curl http://localhost:3000/api/registrations

# Статистика контейнеров
docker stats gatsby-app-prod gatsby-postgres-prod
```

### Логи

```bash
# Следить за логами в реальном времени
docker-compose -f docker-compose.prod.yml logs -f

# Последние 50 строк
docker-compose -f docker-compose.prod.yml logs --tail=50

# Логи только приложения
docker-compose -f docker-compose.prod.yml logs -f app
```

---

## 🛡️ Рекомендации для Production

### 1. Безопасность

- ✅ Используйте сложные пароли (минимум 20 символов)
- ✅ Не коммитьте `.env.production` в git
- ✅ Ограничьте доступ к порту PostgreSQL (не публикуйте наружу)
- ✅ Используйте SSL/TLS для подключений
- ✅ Регулярно обновляйте зависимости

### 2. Производительность

```bash
# Посмотреть использование ресурсов
docker stats

# Если нужно больше памяти для Node.js, добавьте в docker-compose.prod.yml:
app:
  environment:
    - NODE_OPTIONS=--max-old-space-size=4096
```

### 3. Резервное копирование

Настройте автоматический бэкап через cron:

```bash
# Добавьте в crontab (crontab -e)
0 2 * * * cd /path/to/project && docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U gatsby_user gatsby_db | gzip > /backups/gatsby_$(date +\%Y\%m\%d).sql.gz
```

### 4. Мониторинг дискового пространства

```bash
# Проверить размер томов
docker system df -v

# Очистить неиспользуемые образы
docker system prune -a
```

---

## 🚨 Troubleshooting

### Контейнер не запускается

```bash
# Проверить логи
docker-compose -f docker-compose.prod.yml logs

# Проверить конфигурацию
docker-compose -f docker-compose.prod.yml config
```

### База данных недоступна

```bash
# Проверить статус
docker-compose -f docker-compose.prod.yml ps postgres

# Перезапустить PostgreSQL
docker-compose -f docker-compose.prod.yml restart postgres
```

### Приложение не отвечает

```bash
# Проверить логи приложения
docker-compose -f docker-compose.prod.yml logs app

# Перезапустить приложение
docker-compose -f docker-compose.prod.yml restart app
```

---

## 📊 Сравнение режимов

| Параметр | Development | Production |
|----------|-------------|------------|
| **Сборка** | Без оптимизации | Минификация + оптимизация |
| **Hot Reload** | ✅ Да | ❌ Нет |
| **Source Maps** | ✅ Да | ❌ Нет |
| **Размер образа** | ~500MB | ~200MB |
| **Время запуска** | ~3 сек | ~1 сек |
| **Логирование** | Подробное | Минимальное |
| **Volumes** | Монтируется код | Только node_modules |

---

## 🎯 Быстрые команды

```bash
# Development
docker-compose up -d                    # Запуск
docker-compose down                     # Остановка
docker-compose logs -f                  # Логи
docker-compose restart                  # Перезапуск

# Production
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build   # Запуск
docker-compose -f docker-compose.prod.yml down                                       # Остановка
docker-compose -f docker-compose.prod.yml logs -f                                    # Логи
docker-compose -f docker-compose.prod.yml restart                                    # Перезапуск
```

---

## ✅ Checklist перед production деплоем

- [ ] Изменены пароли в `.env.production`
- [ ] Настроен файрволл (закрыт порт PostgreSQL извне)
- [ ] Создан первый бэкап
- [ ] Настроен автоматический бэкап
- [ ] Проверено дисковое пространство
- [ ] Настроен мониторинг
- [ ] Протестированы все функции
- [ ] Проверены логи на ошибки
- [ ] Настроен reverse proxy (nginx/traefik) при необходимости
- [ ] Настроен SSL сертификат при необходимости
