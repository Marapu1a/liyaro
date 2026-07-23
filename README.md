# Liyaro

Базовый монорепозиторий сайта студии разработки Liyaro. Frontend собирается статически с Astro, backend предоставляет REST API на Fastify, а PostgreSQL и Prisma подготовлены для будущих серверных функций.

## Структура

```text
liyaro/
├── apps/
│   ├── frontend/        # Astro, публичные страницы, layout, стили и assets
│   └── backend/         # Fastify REST API, конфигурация, плагины и Prisma
├── docker-compose.yml   # PostgreSQL для локальной разработки
├── package.json         # npm workspaces и общие команды
├── .env.example         # шаблон переменных окружения
├── eslint.config.js
└── prettier.config.js
```

Frontend заранее содержит каталоги для услуг, кейсов, статей, SEO-страниц, компонентов, клиентских скриптов и локальных assets. Backend разделён на конфигурацию, плагины, модули и общий код; `app.ts` собирает приложение, а `server.ts` отвечает только за запуск и корректное завершение.

## Требования

- Node.js 22.12 или новее
- npm 10 или новее
- Docker с Docker Compose для локального PostgreSQL

## Установка

```bash
npm install
```

Скопируйте шаблон окружения и при необходимости измените значения:

```powershell
Copy-Item .env.example .env
```

Для macOS/Linux:

```bash
cp .env.example .env
```

Локально backend использует `DATABASE_URL` с адресом `localhost`. Если backend позже будет запущен внутри Docker Compose, контейнер должен получать значение из `DATABASE_URL_DOCKER`, где PostgreSQL доступен по имени сервиса `db`. Не заменяйте локальный URL на `db`, если backend работает на хост-машине.

## PostgreSQL

Запуск базы данных:

```bash
docker compose up -d db
```

Остановка:

```bash
docker compose down
```

Данные сохраняются в именованном volume `postgres_data`.

## Разработка

Одновременный запуск frontend и backend:

```bash
npm run dev
```

Раздельный запуск:

```bash
npm run dev:frontend
npm run dev:backend
```

Адреса по умолчанию:

- frontend: http://localhost:4321
- backend: http://localhost:3000
- health endpoint: http://localhost:3000/api/health
- отправка обращения: `POST http://localhost:3000/api/inquiries`

Backend подключается к PostgreSQL при старте, поэтому перед его запуском база должна быть доступна.

## Проверки и сборка

```bash
npm run typecheck
npm run lint
npm run format
npm run build
```

Production-сборка frontend появляется в `apps/frontend/dist`, backend — в `apps/backend/dist`. Запустить собранный backend можно командой:

```bash
npm start --workspace @liyaro/backend
```

## Prisma

Сгенерировать Prisma Client:

```bash
npm run prisma:generate
```

Создать и применить первую миграцию после добавления бизнес-моделей:

```bash
npm run prisma:migrate -- init
```

Открыть Prisma Studio:

```bash
npm run prisma:studio
```

Prisma-схема содержит минимальную модель `Inquiry` для сообщений с главной страницы. История
ключевых продуктовых и архитектурных решений ведётся в `docs/development-log.md`.
