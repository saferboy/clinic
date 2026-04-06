# 🌱 Prisma Seeds

Bu papkada klinikani boshqarish tizimi uchun seed (boshlang'ich ma'lumotlar) fayllari joylashgan.

## 📁 Fayl Strukturasi

```
prisma/
├── seed.ts                          # Asosiy seed fayl (barcha seedlarni ishga tushiradi)
├── seeds/
│   ├── db.ts                        # PrismaClient konfiguratsiyasi
│   ├── user-roles.seed.ts           # Rollar (SuperAdmin, Admin, Doctor, va boshqalar)
│   ├── users.seed.ts                # Foydalanuvchilar (har bir rol uchun)
│   ├── departments.seed.ts          # Departamentlar (Terapiya, Xirurgiya, va boshqalar)
│   ├── regions.seed.ts              # Viloyatlar (O'zbekiston bo'yicha)
│   ├── districts.seed.ts            # Tumanlar (Toshkent viloyati uchun)
│   ├── sources.seed.ts              # Manbalar (Instagram, Telegram, va boshqalar)
│   └── client-groups.seed.ts        # Mijoz guruhlari (Oddiy, VIP, Korporativ, va boshqalar)
```

## 🚀 Ishlatish

### Barcha seedlarni ishga tushirish
```bash
npm run seed:all
```

### Alohida seedlarni ishga tushirish

#### 1. Rollar (User Roles)
```bash
npm run seed:roles
```
- SuperAdmin
- Admin
- Doctor
- Nurse
- Receptionist
- Accountant

#### 2. Foydalanuvchilar (Users)
```bash
npm run seed:users
```
Login ma'lumotlari:
| Login | Parol | Rol |
|-------|-------|-----|
| `superadmin` | `12345` | SuperAdmin |
| `admin` | `12345` | Admin |
| `doctor` | `12345` | Doctor |
| `nurse` | `12345` | Nurse |
| `receptionist` | `12345` | Receptionist |
| `accountant` | `12345` | Accountant |

#### 3. Departamentlar
```bash
npm run seed:departments
```
Yaratiladi: Terapiya, Xirurgiya, Pediatr, Kardiologiya, Nevrologiya

#### 4. Viloyatlar (Regions)
```bash
npm run seed:regions
```
Yaratiladi: O'zbekistonning barcha 14 ta viloyati

#### 5. Tumanlar (Districts)
```bash
npm run seed:districts
```
Yaratiladi: Toshkent viloyatining 10 ta tumani

#### 6. Manbalar (Sources)
```bash
npm run seed:sources
```
Yaratiladi: Instagram, Telegram, Google, Tavsiya, Reklama, Telefon, Sayt, Boshqa

#### 7. Mijoz Guruhlari (Client Groups)
```bash
npm run seed:client-groups
```
Yaratiladi: Oddiy, VIP, Korporativ, Sug'urta, Imtiyozli

## 📋 Seed Tartibi

Agar alohida seedlarni ishlatmoqchi bo'lsangiz, quyidagi tartibda ishga tushiring:

```bash
# 1. Avval rollar
npm run seed:roles

# 2. Keyin foydalanuvchilar
npm run seed:users

# 3. Departamentlar
npm run seed:departments

# 4. Viloyatlar
npm run seed:regions

# 5. Tumanlar (viloyatlardan keyin)
npm run seed:districts

# 6. Manbalar
npm run seed:sources

# 7. Mijoz guruhlari
npm run seed:client-groups
```

## 🔧 Yangi Seed Qo'shish

Yangi seed fayl yaratish uchun:

1. `prisma/seeds/` papkasida yangi fayl yarating, masalan: `new-seed.seed.ts`

2. Fayl strukturasi:
```typescript
import { RecordStatus } from '@prisma/client';
import { prisma } from './db';

export async function seedNewData() {
  console.log('📝 Yangi ma'lumotlar yaratilmoqda...');
  
  // Sizning seed kodingiz
  
  console.log(`  ✅ Jami: ${count} ta yaratildi\n`);
}

// Agar bu fayl to'g'ridan-to'g'ri ishga tushirilsa
if (require.main === module) {
  const { prisma } = require('./db');
  seedNewData()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
```

3. `package.json` ga yangi script qo'shing:
```json
{
  "scripts": {
    "seed:new-data": "ts-node prisma/seeds/new-seed.seed.ts"
  }
}
```

4. Asosiy `seed.ts` faylga import qiling:
```typescript
import { seedNewData } from './seeds/new-seed.seed';

async function main() {
  // ...boshqa seedlar
  await seedNewData();
}
```

## ⚠️ Muhim Eslatmalar

1. **Database ulanishi**: Har bir seed fayl o'zida PrismaClient'ni yaratadi va `.env` faylni yuklaydi.

2. **Idempotency**: Barcha seedlar idempotent - ular bir necha marta ishga tushirilsa ham, ma'lumotlar dublikat qilinmaydi (`upsert` ishlatiladi).

3. **Bog'liqliklar**: Ba'zi seedlar boshqa seedlarga bog'liq:
   - `users` seed `roles` seed dan keyin ishlashi kerak
   - `districts` seed `regions` seed dan keyin ishlashi kerak

4. **Parol**: Barcha test userlar uchun umumiy parol: `12345`

## 🐛 Muammolar

Agar seed ishga tushmasa:

1. `.env` faylda `DATABASE_URL` to'g'ri ekanligini tekshiring
2. Docker containerlar ishlab turganligini tekshiring:
   ```bash
   docker ps
   ```
3. Database ulanishini tekshiring:
   ```bash
   npm run prisma:studio
   ```

## 📞 Yordam

Qo'shimcha savollar uchun dokumentatsiyani o'qing yoki developer bilan bog'laning.
