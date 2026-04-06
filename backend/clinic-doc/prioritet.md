# 📊 Prisma Schema Modellar Prioriteti

Umumiy modellar soni: **20 ta**

Quyida modellar rivojlantirish prioriteti bosqichma-bosqich keltirilgan. Bu tartib **dependency (bog'liqlik)**, **biznes mantiq** va **Klinika.md** hujjatidagi phase'larga asoslangan.

---

## 📋 Modellar Ro'yxati (20 ta)

| # | Model | Tavsif |
|---|-------|--------|
| 1 | `UserRole` | Foydalanuvchi rollari |
| 2 | `User` | Tizim foydalanuvchilari |
| 3 | `LocRegion` | Viloyatlar |
| 4 | `LocDistrict` | Tumanlar |
| 5 | `Source` | Mijoz manbalari |
| 6 | `ClientGroup` | Mijoz guruhlari |
| 7 | `Department` | Bo'limlar |
| 8 | `Client` | Mijozlar bazasi |
| 9 | `Room` | Xonalar |
| 10 | `Service` | Xizmatlar |
| 11 | `Referral` | Tavsiya manbalari |
| 12 | `Visit` | Qabul jarayoni |
| 13 | `VisitService` | Qabuldagi xizmatlar |
| 14 | `VisitRoom` | Qabuldagi xonalar |
| 15 | `VisitReferral` | Qabul referallari |
| 16 | `ServiceUser` | Shifokor stavkalari |
| 17 | `Payment` | To'lovlar |
| 18 | `ClientPaid` | Mijoz oldindan to'lovlari |
| 19 | `OtherPaidGroup` | Boshqa to'lov guruhlari |
| 20 | `OtherPaid` | Boshqa kirim/chiqimlar |

---

## 🎯 Rivojlantirish Bosqichlari (4 Phase)

### **PHASE 1: FOUNDATION (Fundament)** 
**Muddat: 2 hafta** | **Modellar: 7 ta**

Bu bosqichda tizimning **poydevori** quriladi. Boshqa barcha modellar ushbu modellarga bog'liq.

| Priority | Model | Sabab | Dependencies |
|----------|-------|-------|--------------|
| 1 | `UserRole` | Rollarsiz User bo'lmaydi | ❌ Yo'q |
| 2 | `User` | Audit va biznes uchun asos | ✅ UserRole |
| 3 | `LocRegion` | Hududlar klassifikatori | ❌ Yo'q |
| 4 | `LocDistrict` | Tumanlar (Region ga bog'liq) | ✅ LocRegion |
| 5 | `Source` | Mijoz manbalari | ❌ Yo'q |
| 6 | `ClientGroup` | Mijoz kategoriyalari | ❌ Yo'q |
| 7 | `Department` | Bo'limlar (Service va Room uchun) | ❌ Yo'q |

**✅ Phase 1 Natijasi:** Foydalanuvchilar, rollar va klassifikatorlar tayyor

---

### **PHASE 2: CORE ENTITIES (Asosiy Entitylar)**
**Muddat: 2 hafta** | **Modellar: 5 ta**

Klinikaning **asosiy operatsion** modullari.

| Priority | Model | Sabab | Dependencies |
|----------|-------|-------|--------------|
| 8 | `Client` | Mijozlarsiz klinika ishlamaydi | ✅ User, LocRegion, LocDistrict, Source, ClientGroup |
| 9 | `Room` | Xonalar (qabul uchun) | ✅ Department, User |
| 10 | `Service` | Xizmatlar (narxlar) | ✅ Department, User |
| 11 | `Referral` | Tavsiya tizimi | ✅ User |
| 12 | `Visit` | Qabul jarayoni (CORE) | ✅ Client, User, Doctor |

**✅ Phase 2 Natijasi:** Mijoz, Xizmat, Xona va Qabul boshqaruvi ishlaydi

---

### **PHASE 3: VISIT DETAILS (Qabul Tafsilotlari)**
**Muddat: 1 hafta** | **Modellar: 4 ta**

Visit jarayonini **to'liq** amalga oshirish uchun.

| Priority | Model | Sabab | Dependencies |
|----------|-------|-------|--------------|
| 13 | `VisitService` | Qabulda ko'rsatilgan xizmatlar | ✅ Visit, Service, User |
| 14 | `VisitRoom` | Qabulda ishlatilgan xonalar | ✅ Visit, Room, User |
| 15 | `VisitReferral` | Qabul referal bog'lanishi | ✅ Visit, Referral, User |
| 16 | `ServiceUser` | Shifokor stavkalari (foiz/fiks) | ✅ Service, User |

**✅ Phase 3 Natijasi:** To'liq qabul jarayoni (xizmat + xona + stavka)

---

### **PHASE 4: FINANCE (Moliya)**
**Muddat: 2 hafta** | **Modellar: 4 ta**

Moliyaviy hisob-kitob va nazorat modullari.

| Priority | Model | Sabab | Dependencies |
|----------|-------|-------|--------------|
| 17 | `Payment` | Asosiy to'lovlar | ✅ Client, User, Visit |
| 18 | `ClientPaid` | Mijoz oldindan to'lovlari | ✅ Client, Visit, User |
| 19 | `OtherPaidGroup` | Chiqim kategoriyalari | ✅ User |
| 20 | `OtherPaid` | Boshqa kirim/chiqimlar | ✅ OtherPaidGroup, User |

**✅ Phase 4 Natijasi:** To'liq moliyaviy boshqaruv tizimi

---

## 📊 Dependency Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 1: FOUNDATION                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ UserRole │  │LocRegion │  │  Source  │  │ClientGrp │        │
│  └────┬─────┘  └────┬─────┘  └──────────┘  └────┬─────┘        │
│       │             │                            │              │
│  ┌────▼─────┐  ┌────▼─────┐  ┌──────────┐       │              │
│  │   User   │  │LocDistrict│ │Department│       │              │
│  └──────────┘  └──────────┘  └────┬─────┘       │              │
└───────────────────────────────────┼─────────────┼──────────────┘
                                    │             │
┌───────────────────────────────────▼─────────────▼──────────────┐
│                    PHASE 2: CORE ENTITIES                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Client  │  │   Room   │  │ Service  │  │ Referral │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │             │             │              │
│       └─────────────┴──────┬──────┴─────────────┘              │
│                            ▼                                   │
│                      ┌──────────┐                              │
│                      │  Visit   │                              │
│                      └──────────┘                              │
└────────────────────────────┬───────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                  PHASE 3: VISIT DETAILS                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │VisitService  │  │  VisitRoom   │  │VisitReferral │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐                                             │
│  │ ServiceUser  │                                             │
│  └──────────────┘                                             │
└────────────────────────────┬───────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                    PHASE 4: FINANCE                            │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Payment  │  │  ClientPaid  │  │OtherPaidGroup│             │
│  └──────────┘  └──────────────┘  └──────┬───────┘             │
│                                          │                     │
│                                  ┌───────▼───────┐             │
│                                  │   OtherPaid   │             │
│                                  └───────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Migration Strategy

### Har Bir Phase Uchun Migration Buyruqlari:

```bash
# PHASE 1
npx prisma migrate dev --name phase1_foundation

# PHASE 2
npx prisma migrate dev --name phase2_core_entities

# PHASE 3
npx prisma migrate dev --name phase3_visit_details

# PHASE 4
npx prisma migrate dev --name phase4_finance
```

---

## ⚠️ Muhim Eslatmalar

### 1. **Critical Path (Eng Muhim Zanjir)**
```
UserRole → User → Client → Visit → Payment
```
Bu zanjir buzilsa, tizim ishlamaydi. Birinchi navbatda shu modullarni test qiling.

### 2. **Seed Data (Boshlang'ich Ma'lumotlar)**
Har bir phase dan keyin seed data qo'shish kerak:

| Phase | Seed Ma'lumotlar |
|-------|------------------|
| 1 | Admin user, rollar, viloyatlar, bo'limlar |
| 2 | Test mijozlar, xizmatlar, xonalar |
| 3 | Test visitlar, xizmat bog'lanishlari |
| 4 | Test to'lovlar, balansi |

### 3. **API Development Order**
Backend API lar ham shu tartibda yozilishi kerak:

```
Phase 1: Auth + User Management API
Phase 2: Client + Service + Visit API
Phase 3: Visit Details API
Phase 4: Payment + Finance API
```

### 4. **Testing Priority**
| Priority | Module | Test Coverage |
|----------|--------|---------------|
| 🔴 High | User, Client, Visit, Payment | 90%+ |
| 🟡 Medium | Service, Room, VisitService | 70%+ |
| 🟢 Low | Classifiers (Region, Source, etc.) | 50%+ |

---

## 📅 Timeline Summary

| Phase | Modellar | Muddat | Jami |
|-------|----------|--------|------|
| **Phase 1** | 7 ta | 2 hafta | Foundation |
| **Phase 2** | 5 ta | 2 hafta | Core |
| **Phase 3** | 4 ta | 1 hafta | Visit Details |
| **Phase 4** | 4 ta | 2 hafta | Finance |
| **TOTAL** | **20 ta** | **7 hafta** | **~1.5 oy** |

---
