# QWEN.md - Clinic Backend Project Context

## Project Overview
**Name:** Klinika Backend (Clinic CRM/ERP System)  
**Framework:** NestJS v11  
**ORM:** Prisma v7.5  
**Database:** PostgreSQL 15  
**Cache:** Redis 7  
**Location:** `D:\no-money\clinic\backend`

## Quick Commands
```bash
npm run start:dev      # Development server
npm run build          # Build production
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate:dev # Run migrations
npm run seed               # Seed database
npm run lint               # ESLint check
npm run test               # Run tests
```

## Environment Setup
```bash
# Copy and configure
cp .env.example .env

# Start Docker (PostgreSQL + Redis)
docker-compose up -d

# Run migrations
npx prisma migrate dev

# Seed data
npm run seed
```

## Default Credentials
- **Admin Login:** `admin`
- **Admin Password:** `Admin@123`

## API Endpoints
- **Base URL:** `http://localhost:3000/api`
- **Swagger Docs:** `http://localhost:3000/docs`

## Auth Endpoints
- `POST /auth/login` - Login (get tokens)
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (requires auth)
- `POST /auth/change-password` - Change password (requires auth)
- `GET /auth/me` - Get current user (requires auth)

## Project Structure
```
backend/
├── src/
│   ├── main.ts              # App entry point
│   ├── app.module.ts        # Root module
│   ├── prisma/              # Prisma service (Global module)
│   ├── common/              # Shared utilities
│   └── modules/             # Business modules
├── prisma/
│   ├── schema.prisma        # Database schema (20 models)
│   ├── migrations/          # DB migrations
│   └── seed.ts              # Seed data
├── clinic-doc/              # Project documentation
└── test/                    # E2E tests
```

## Current Modules (8 implemented)
1. `auth` - **NEW!** Authentication (login, logout, refresh, change password)
2. `users` - User management
3. `user-roles` - Role management
4. `regions` - Regions (Viloyatlar)
5. `districts` - Districts (Tumanlar)
6. `sources` - Client sources
7. `client-groups` - Client groups
8. `departments` - Departments

## Next Development Phases

### Phase 2: Core Entities (Priority: HIGH)
- `Client` - Client/Patient management
- `Room` - Room management
- `Service` - Service catalog
- `Referral` - Referral sources
- `Visit` - Visit/Appointment management (CORE)

### Phase 3: Visit Details (Priority: MEDIUM)
- `VisitService` - Services per visit
- `VisitRoom` - Rooms per visit
- `VisitReferral` - Referrals per visit
- `ServiceUser` - Doctor commission rates

### Phase 4: Finance (Priority: HIGH)
- `Payment` - Payment processing
- `ClientPaid` - Prepayments
- `OtherPaidGroup` - Expense categories
- `OtherPaid` - Other income/expenses

## Database Models (20 total)
See: `DATABASE.md` for complete schema

## Key Business Rules
1. **Soft Delete:** All entities use `deleted_at` field
2. **Audit Trail:** `registered_by`, `modified_by`, `created_at`, `updated_at`, `deleted_at`
3. **JWT Auth:** Access token (15m) + Refresh token (7d)
4. **Password Hash:** bcrypt with 10 rounds
5. **Global Prefix:** `/api`

## Important Files
- `prisma/schema.prisma` - Database schema
- `src/app.module.ts` - Module imports
- `src/main.ts` - App bootstrap
- `.env` - Environment variables
- `clinic-doc/texnik-hujjat.md` - Full technical spec
- `clinic-doc/prioritet.md` - Development priorities

## Development Guidelines
1. Always run `npx prisma generate` after schema changes
2. Use soft delete (never hard delete)
3. All DTOs must use `class-validator` decorators
4. Follow NestJS module pattern (Controller + Service + Module + DTOs)
5. Select only needed fields in Prisma queries (exclude password)

## Common Issues & Solutions
```bash
# Cannot connect to database
docker-compose ps
docker-compose up -d postgres

# Prisma client not generated
npx prisma generate

# Port 3000 busy
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Testing
```bash
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage report
```

## Code Style
- ESLint + Prettier configured
- TypeScript strict mode enabled
- Conventional Commits for git messages
