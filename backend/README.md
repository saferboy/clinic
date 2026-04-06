# Clinic Backend API

Klinikani boshqarish tizimi - NestJS + Prisma + PostgreSQL

## 📋 Teknologiyalar

- **Runtime:** Node.js
- **Framework:** NestJS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Cache:** Redis
- **Auth:** JWT (Access + Refresh tokens)
- **Validation:** class-validator, class-transformer
- **Documentation:** Swagger/OpenAPI

## 🚀 Quick Start

### 1. Dependencies

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
# .env faylini o'zgartiring
```

### 3. Database setup

```bash
# Prisma client generate
npm run prisma:generate

# Migrations
npm run prisma:migrate:dev

# Seed data
npm run seed:all
```

### 4. Run

```bash
npm run start:dev
```

## 📖 API Documentation

Swagger UI: http://localhost:3000/docs

- **Base URL:** `/api`
- **Auth:** Bearer JWT token

## 🗄️ Database Commands

```bash
# Prisma Studio (DB visual boshqaruv)
npm run prisma:studio

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev
```

## 🌱 Seed Commands

| Command | Description |
|---------|-------------|
| `npm run seed:all` | Barcha seed'larni ishga tushiradi |
| `npm run seed:deps` | Roles + Users + Departments |
| `npm run seed:geo` | Regions + Districts |
| `npm run seed:location` | Location (Regions + Districts) from JSON |
| `npm run seed:clients` | Sources + Client Groups |
| `npm run seed:roles` | Faqat User Roles |
| `npm run seed:users` | Faqat Users |
| `npm run seed:departments` | Faqat Departments |
| `npm run seed:regions` | Faqat Regions |
| `npm run seed:districts` | Faqat Districts |
| `npm run seed:sources` | Faqat Sources |
| `npm run seed:client-groups` | Faqat Client Groups |

## 🔧 Development Commands

```bash
# Development mode (watch)
npm run start:dev

# Debug mode
npm run start:debug

# Production mode
npm run start:prod

# Lint
npm run lint

# Format
npm run format
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── common/           # Guards, Filters, Pipes, Decorators
│   ├── modules/          # Feature modules
│   │   ├── auth/
│   │   ├── users/
│   │   ├── departments/
│   │   ├── regions/
│   │   ├── districts/
│   │   ├── sources/
│   │   └── client-groups/
│   ├── prisma/           # Prisma service
│   └── main.ts           # Application entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   ├── seeds/            # Seed files
│   └── seed.ts           # Main seed file
├── .env                  # Environment variables
├── .env.example          # Environment template
└── package.json
```

## 🔐 Authentication

### Token muddati

- **Access Token:** 1 soat
- **Refresh Token:** 7 kun

### Login

```bash
POST /api/auth/login
{
  "login": "admin",
  "password": "admin123"
}
```

### Refresh Token

```bash
POST /api/auth/refresh
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## 📝 Default Users

Seed dan keyin:

| Login | Password | Role |
|-------|----------|------|
| admin | admin123 | SUPERADMIN |

## 🐛 Error Codes

### Departments

- `DEPT_001` - Department nomi band
- `DEPT_003` - Department topilmadi

## 📦 Docker

```bash
# PostgreSQL va Redis ishga tushirish
docker-compose up -d

# To'xtatish
docker-compose down
```

## 🔗 Foydali linklar

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Swagger Docs](https://swagger.io/docs)

## 📄 License

MIT
