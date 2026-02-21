## 📋 О проекте

**Olimp** — современная платформа для управления заказами и доставкой. Проект построен на Next.js с использованием TypeScript и Prisma ORM. В системе реализована полноценная ролевая модель (операторы, диспетчеры, курьеры, клиенты) и функционал для работы с заказами, включая интеграцию с картами для отслеживания адреса доставки.

> **Ветка `develop`** содержит последнюю стабильную версию проекта в разработке. Здесь интегрируются все завершенные функциональные возможности из feature-веток.

## ✨ Функциональность

- **🔐 Авторизация и управление пользователями**
  - Регистрация, вход, обновление токенов
  - Ролевая модель (ADMIN, OPERATOR, DISPATCHER, COURIER, CUSTOMER)
  - Middleware для защиты маршрутов

- **📦 Управление заказами**
  - Создание, просмотр, обновление статуса заказов
  - Привязка заказов к клиентам и курьерам
  - Детальная информация о заказах (items, стоимость, адрес)

- **🗺️ Интеграция с картами**
  - Поиск адреса на карте
  - Отслеживание местоположения доставки (координаты)

- **📋 Каталог продукции**
  - Управление товарами (бетон с характеристиками: класс, марка, цена)

- **👤 Профили пользователей**
  - Личный кабинет для разных ролей
  - Просмотр и управление своими заказами

## 🚀 Технологический стек

| Компонент          | Технология                 |
| ------------------ | -------------------------- |
| **Фреймворк**      | Next.js 16.1.6 (Turbopack) |
| **Язык**           | TypeScript 5.0             |
| **База данных**    | PostgreSQL 15              |
| **ORM**            | Prisma 7.4.1               |
| **Аутентификация** | JWT(jose), Bcrypt          |
| **Стилизация**     | SCSS modules               |
| **Карты**          | Яндекс.Карты (React)       |
| **Валидация**      | Zod                        |

## 🗄️ Модели данных (Prisma)

- **User** — пользователи с ролями ( login, email, passwordHash, role, createdAt, updatedAt, refreshTokens, customerOrders, courierOrders)
- **RefreshToken** — управление сессиями ( token, userId, user, isValid, expiresAt )
- **Product** — товары (name, class, stamp, price)
- **Orders** — заказы (customerId, customer, items, totalCost, status, deliveryAddress, deliveryLat, deliveryLon, courierId, dispatcherId, courier, term, approvedAt, createdAt, updatedAt)

## 🛠️ Установка и запуск

### Предварительные требования

- Node.js 18+
- Npm 10.9.2+
- PostgreSQL 15+

### Пошаговая инструкция

# 1. Клонировать репозиторий

git clone https://github.com/Nubookd/olimp-post.git
cd olimg-post

# 2. Переключиться на ветку develop

git checkout develop

# 3. Установить зависимости

npm install --legacy-peer-deps

# 4. Настроить переменные окружения

создать файл .env и вставить тестовый данные
`prisma_olimp_PRISMA_DATABASE_URL="postgresql://olimp__user:olimp__user@localhost:5432/olimp?shema=public"
prisma_olimp_POSTGRES_URL="postgresql://olimp__user:olimp__user@localhost:5432/olimp?shema=public"
prisma_olimp_PRISMA_DATABASE_URL="postgresql://olimp__user:olimp__user@localhost:5432/olimp?shema=public"
ACCESS_SECRET= "NzEKIRYmKYNcVipe77oNOHV2EB0JBHOH"
REFRESH_SECRET="cLP7KJLBUBwYccB8F5fOaWInyvgSFuiY"
BCRYPT_SALT_ROUNDS = 12

YANDEX_API_KEY='a6dac2e1-c235-4d01-9bf1-a5d8d4677f4f'
`

# 5. Настроить базу данных

npx prisma generate
npx prisma db push
npm run prisma:seed # заполнение тестовыми данными

# 6. Запустить в режиме разработки

npm run dev

### Тестовые пользователи

| Login              | Password                   | Role           |
| ------------------ | -------------------------- | -------------- |
| **customer**       | **Customer1)**             | **CUSTOMER**   |
| **dispatcher**     |  **Dispatcher1)**          | **DISPATCHER** |
| **operator**       |  **Operator1)**            | **OPERATOR**   |
| **courier**        |  **Courier1)**             | **COURIER**    |
| **coutier1**       |  **Courier2)**             | **COURIER**    |
| **courier2**       |  **Courier1)**             | **COURIER**    |