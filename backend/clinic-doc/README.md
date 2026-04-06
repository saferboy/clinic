# Klinika-Backend Loyihasi

Bu hujjat loyiha bilan ishlash uchun zarur bo'lgan barcha ma'lumotlarni o'z ichiga oladi.

## Mundarija

- [Loyiha haqida](#loyiha-haqida)
- [Talablar](#talablar)
- [Loyiha strukturasi](#loyiha-strukturasi)
- [Muhit sozlamalari](#muhit-sozlamalari)
- [Docker bilan ishlash](#docker-bilan-ishlash)
- [Loyihani ishga tushirish](#loyihani-ishga-tushirish)
- [Ma'lumotlar bazasi](#malumotlar-bazasi)
- [Git bilan ishlash](#git-bilan-ishlash)
- [Kod standartlari](#kod-standartlari)
- [Test qilish](#test-qilish)
- [Deploy qilish](#deploy-qilish)
- [Foydalanilgan texnologiyalar](#foydalanilgan-texnologiyalar)
- [Savollar va Muammolar](#savollar-va-muammolar)

## Loyiha haqida

Klinika-Backend — bu xususiy klinikalar uchun mo'ljallangan to'liq boshqaruv tizimi (CRM/ERP). Tizim orqali mijozlar bazasini yuritish, qabul jarayonini boshqarish, xizmatlar va to'lovlarni hisoblash, shuningdek moliyaviy hisobotlarni shakllantirishga imkon yaratiladi.

Tizim quyidagi asosiy bo'limlardan iborat:

- **CRM** — mijozlar bazasi, bemor tarixi, referal tizimi
- **ERP** — xizmatlar, xonalar, shifokorlar va bo'limlar boshqaruvi
- **Moliya** — to'lovlar, oldindan to'lovlar, kirim-chiqim hisobi, qarzdorlik nazorati
- **Hisobotlar** — kunlik va oylik moliyaviy hisobotlar, shifokor ko'rsatkichlari

## Talablar

Loyiha bilan ishlash uchun quyidagi dasturiy ta'minotlar o'rnatilgan bo'lishi kerak:

- Node.js (v20 yoki yuqori)
- Docker va Docker Compose
- Git
- PostgreSQL (lokal ishlatmoqchi bo'lsangiz)
- Redis (lokal ishlatmoqchi bo'lsangiz)

## Loyiha strukturasi

```
klinika-backend/
├── src/
│   ├── main.ts                  # Ilova kirish nuqtasi
│   ├── app.module.ts            # Root modul
│   ├── common/                  # Umumiy komponentlar
│   │   ├── decorators/          # Custom decoratorlar
│   │   ├── filters/             # Exception filterlar
│   │   ├── guards/              # Auth va RBAC guardlar
│   │   ├── interceptors/        # Request/response interceptorlar
│   │   └── pipes/               # Validatsiya pipelar
│   ├── config/                  # Konfiguratsiya fayllari
│   ├── modules/                 # Biznes modullar
│   │   ├── auth/                # Autentifikatsiya
│   │   ├── user/                # Foydalanuvchilar
│   │   ├── client/              # Mijozlar (CRM)
│   │   ├── visit/               # Qabul jarayoni
│   │   ├── service/             # Xizmatlar
│   │   ├── payment/             # To'lovlar
│   │   ├── department/          # Bo'limlar
│   │   ├── room/                # Xonalar
│   │   ├── report/              # Hisobotlar
│   │   └── notification/        # Bildirishnomalar
│   ├── prisma/                  # Prisma service va modul
│   └── utils/                   # Yordamchi funksiyalar
├── prisma/
│   ├── schema.prisma            # Ma'lumotlar bazasi sxemasi
│   ├── migrations/              # Migratsiya fayllari
│   └── seed.ts                  # Boshlang'ich ma'lumotlar
├── test/                        # E2E testlar
├── docker-compose.yml           # Ishlab chiqarish muhiti uchun Docker
├── docker-compose.dev.yml       # Rivojlantirish muhiti uchun Docker
├── .env.example                 # Muhit o'zgaruvchilari namunasi
└── nest-cli.json
```

## Muhit sozlamalari

Muhit sozlamalari `.env` faylida konfiguratsiya qilinadi. Avval namuna fayldan nusxa oling:

```bash
cp .env.example .env
```

Keyin `.env` faylini o'zingizning sozlamalaringizga muvofiq tahrirlang:

```
# Ilova sozlamalari
APP_PORT=3000
APP_ENV=development
APP_PREFIX=api/v1

# PostgreSQL ulash ma'lumotlari
DATABASE_URL=postgresql://klinika_user:klinika_pass@localhost:5432/klinika_db

# JWT sozlamalari
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_REFRESH_EXPIRES_IN=7d

# Redis sozlamalari
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Bcrypt sozlamalari
BCRYPT_SALT_ROUNDS=12

# CORS sozlamalari
CORS_ORIGINS=http://localhost:3001,http://localhost:5173

# Swagger (production'da false qiling)
SWAGGER_ENABLED=true
```

> **Muhim:** `JWT_SECRET` va `JWT_REFRESH_SECRET` kamida 32 ta belgidan iborat bo'lishi shart. Tasodifiy kalit yaratish uchun: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Docker bilan ishlash

### Rivojlantirish muhitini ishga tushirish

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Ishlab chiqarish muhitini ishga tushirish

```bash
docker-compose up -d
```

### Docker konteynerlar

- **postgres** — PostgreSQL ma'lumotlar bazasi (port: 5432)
- **redis** — Redis kesh serveri (port: 6379)
- **pgadmin** — PostgreSQL boshqaruv paneli (port: 5050)

### Foydali Docker buyruqlari

```bash
# Konteynerlar holatini ko'rish
docker-compose ps

# Loglarni ko'rish
docker-compose logs -f postgres

# PostgreSQL konteyneri ichiga kirish
docker exec -it klinika-postgres psql -U klinika_user -d klinika_db

# Konteynerlarni to'xtatish
docker-compose down

# Konteynerlar va ma'lumotlarni to'liq o'chirish
docker-compose down -v
```

## Loyihani ishga tushirish

### Docker bilan (tavsiya etiladi)

```bash
# 1. Dependencylarni o'rnatish
npm install

# 2. Ma'lumotlar bazasini ishga tushirish
docker-compose -f docker-compose.dev.yml up -d

# 3. Migratsiyalarni bajarish
npx prisma migrate dev

# 4. Boshlang'ich ma'lumotlarni yuklash
npm run seed

# 5. Ilovani ishga tushirish
npm run start:dev
```

### Lokal muhitda (PostgreSQL va Redis o'rnatilgan bo'lsa)

```bash
# 1. Dependencylarni o'rnatish
npm install

# 2. .env faylini sozlash
cp .env.example .env

# 3. Migratsiyalarni bajarish
npx prisma migrate dev

# 4. Boshlang'ich ma'lumotlarni yuklash
npm run seed

# 5. Ilovani ishga tushirish
npm run start:dev
```

### Ishga tushgandan so'ng mavjud manzillar

| Xizmat       | Manzil                            |
|--------------|-----------------------------------|
| API          | http://localhost:3000/api/v1      |
| Swagger UI   | http://localhost:3000/api/docs    |
| pgAdmin      | http://localhost:5050             |
| Prisma Studio | http://localhost:5555 (`npx prisma studio`) |

## Ma'lumotlar bazasi

### Migratsiyalarni bajarish

```bash
# Yangi migratsiya yaratish (schema.prisma o'zgartirilgandan keyin)
npx prisma migrate dev --name migration_nomi

# Migratsiya holatini tekshirish
npx prisma migrate status

# Production'da migratsiyalarni qo'llash
npx prisma migrate deploy
```

### Boshlang'ich ma'lumotlarni yuklash

```bash
npm run seed
```

Seed quyidagi ma'lumotlarni yaratadi:

```bash
npm run seed:roles      # Rollar (Admin, Doctor, Receptionist, Accountant, Nurse)
npm run seed:users      # Standart foydalanuvchilar
npm run seed:regions    # Viloyatlar va tumanlar
npm run seed:classifiers # Manbalar, guruhlar, bo'limlar
npm run seed:services   # Test xizmatlar va xonalar
```

### Standart foydalanuvchilar (seed'dan keyin)

| Login            | Parol          | Rol           |
|------------------|----------------|---------------|
| `admin`          | `Admin@12345`  | Admin         |
| `doctor1`        | `Doctor@12345` | Doctor        |
| `receptionist1`  | `Recept@12345` | Receptionist  |
| `accountant1`    | `Account@12345`| Accountant    |

> **Muhim:** Production'da bu parollarni darhol o'zgartiring!

### Ma'lumotlar bazasini qayta boshlash (faqat development'da)

```bash
# Barcha ma'lumotlar o'chiriladi!
npx prisma migrate reset

# Reset + seed
npx prisma migrate reset && npm run seed
```

### Prisma Studio (vizual interfeys)

```bash
npx prisma studio
# http://localhost:5555 manzilida ochiladi
```

## Git bilan ishlash

Loyihada Conventional Commits standartidan foydalaniladi:

```bash
git add .
git commit -m "feat(client): mijoz qidiruv funksiyasi qo'shildi"
git push
```

### Commit xabar formati

```
feat(module): yangi funksiya qo'shildi
fix(module): xato tuzatildi
refactor(module): kod qayta ishlandi
chore: yordamchi o'zgarishlar
docs: hujjat yangilandi
test(module): test qo'shildi
```

### Branch strategiyasi

- `main` — asosiy branch, production'ga deploy qilinadi
- `develop` — rivojlantirish uchun asosiy branch
- `feature/*` — yangi funksiyalar uchun branchlar
- `fix/*` — xatolar tuzatish uchun branchlar

Yangi feature boshlash tartibi:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/feature-nomi

# Ishlar tugatilgandan keyin
git push origin feature/feature-nomi
# Pull Request oching: feature/* → develop
```

## Kod standartlari

- ESLint orqali kod sifatini nazorat qilish
- Prettier orqali kod formatini standartlashtirish
- Husky va lint-staged orqali commit qilishda avtomatik tekshiruv

```bash
# Lint tekshirish
npm run lint

# Avtomatik to'g'rilash
npm run lint:fix

# Formatlash
npm run format
```

### Muhim qoidalar

- Ma'lumotlarni o'chirishda doim **soft delete** ishlatiladi (`deleted_at` maydoni)
- Barcha so'rovlarda `where: { deleted_at: null }` tekshiruvi majburiy
- `registered_by` va `modified_by` maydonlari JWT token'dan avtomatik to'ldiriladi
- Barcha DTO'larda `class-validator` dekoratorlari majburiy

## Test qilish

### Backend testlari

```bash
# Barcha unit testlarni bajarish
npm run test

# Testlarni kuzatish rejimida bajarish
npm run test:watch

# Test qamrovini tekshirish
npm run test:cov

# E2E testlarni bajarish
npm run test:e2e
```

### Test qamrovi maqsadlari

| Modul                              | Minimal qamrov |
|------------------------------------|----------------|
| User, Client, Visit, Payment       | 90%+           |
| Service, Room, VisitService        | 70%+           |
| Klassifikatorlar (Region, Source)  | 50%+           |

## Deploy qilish

### Production serverga deploy qilish

```bash
# 1. Loyihani build qilish
npm run build

# 2. Migratsiyalarni qo'llash
npx prisma migrate deploy

# 3. PM2 orqali ishga tushirish
pm2 start dist/main.js --name klinika-api
pm2 save
pm2 startup
```

### Production muhiti uchun muhim sozlamalar

```
APP_ENV=production
SWAGGER_ENABLED=false
LOG_LEVEL=warn
```

### CI/CD

Avtomatik deploy GitHub Actions yoki GitLab CI/CD orqali amalga oshiriladi. Har bir `main` branchga push qilinganda ishga tushadi.

## Foydalanilgan texnologiyalar

### Backend

- **NestJS** — asosiy framework
- **Prisma** — ORM va ma'lumotlar bazasi migratsiyalari
- **PostgreSQL** — asosiy ma'lumotlar bazasi
- **Redis** — kesh va queue boshqaruvi
- **BullMQ** — background job processing
- **JWT + Passport** — autentifikatsiya
- **class-validator** — DTO validatsiyasi
- **Swagger** — API hujjatlash

### DevOps

- **Docker / Docker Compose** — konteynerizatsiya
- **PM2** — production process manager
- **ESLint / Prettier** — kod sifati nazorati
- **Husky / Commitlint** — git hook'lar va commit standartlari

## Savollar va Muammolar

### Tez-tez uchraydigan muammolar

**`Cannot connect to database` xatosi:**
```bash
docker-compose ps   # Postgres konteyner ishlayaptimi?
docker-compose up -d postgres
```

**`prisma migrate dev` ishlamayapti:**
```bash
npx prisma generate
# Yoki DATABASE_URL ni .env faylida tekshiring
```

**`npm install` xato beradi:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Port 3000 band:**
```bash
lsof -i :3000
kill -9 <PID>
```

Loyiha bilan bog'liq boshqa savollar bo'lsa, iltimos GitHub'da issue ochib murojaat qiling.