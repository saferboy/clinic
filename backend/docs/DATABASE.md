# DATABASE.md - Clinic Database Schema

## Overview
**Provider:** PostgreSQL 15  
**ORM:** Prisma v7.5  
**Total Models:** 20  
**Total Enums:** 8

---

## Enums (8)

| Enum | Values | Used By |
|------|--------|---------|
| `ClientGender` | MALE, FEMALE, OTHER | Client.gender |
| `PaymentType` | INCOME, OUTCOME | Payment.payment_type, OtherPaid.type |
| `RoomStatus` | AVAILABLE, OCCUPIED, MAINTENANCE, CLOSED | Room.status |
| `ServiceUserType` | FIXED, PERCENT | ServiceUser.type |
| `VisitStatus` | SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW, DONE | Visit.status |
| `VisitRoomStatus` | ASSIGNED, IN_USE, COMPLETED | VisitRoom.status |
| `RecordStatus` | ACTIVE, INACTIVE, ARCHIVED | All main entities |

---

## Models (20)

### 1. UserRole
User roles and permissions.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| name | String(50) | Unique role name |
| description | Text? | Role description |
| permissions | Json? | Permission object |
| status | RecordStatus | Default: ACTIVE |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |

**Relations:**
- `users` → User[] (fk_user_role)

**Indexes:** status, name

---

### 2. User
System users (admin, doctors, staff).

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| role_id | Int? | Foreign key → UserRole |
| full_name | String(100) | Full name |
| login | String(50) | Unique login |
| password | String(255) | Bcrypt hash |
| phone | String(20)? | Phone number |
| email | String(100)? | Unique email |
| description | Text? | Description |
| status | RecordStatus | Default: ACTIVE |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |

**Relations:**
- `role` → UserRole? (fk_user_role)
- `doctor_visits` → Visit[] (fk_visit_doctor)
- `user_payments` → Payment[] (fk_payment_user)
- `service_users` → ServiceUser[] (fk_service_user_user)
- **Audit Modified:** 18 entities (modified_*)
- **Audit Registered:** 18 entities (registered_*)

**Indexes:** role_id, login, status, created_at, deleted_at  
**Unique:** login, email

---

### 3. LocRegion
Regions (Viloyatlar).

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| name | String(100) | Unique name |
| status | RecordStatus | Default: ACTIVE |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |
| registered_by | Int? | → User |
| modified_by | Int? | → User |

**Relations:**
- `clients` → Client[] (fk_client_region)
- `districts` → LocDistrict[] (fk_loc_district_region)

**Indexes:** status, name, deleted_at

---

### 4. LocDistrict
Districts (Tumanlar) within regions.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| name | String(100) | District name |
| region_id | Int? | → LocRegion |
| status | RecordStatus | Default: ACTIVE |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |
| registered_by | Int? | → User |
| modified_by | Int? | → User |

**Relations:**
- `region` → LocRegion? (fk_loc_district_region)
- `clients` → Client[] (fk_client_district)

**Indexes:** region_id, status, name, deleted_at, [region_id, status]  
**Unique:** [name, region_id]

---

### 5. Source
Client acquisition sources.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| name | String(100) | Unique name |
| description | Text? | Description |
| status | RecordStatus | Default: ACTIVE |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |
| registered_by | Int? | → User |
| modified_by | Int? | → User |

**Relations:**
- `clients` → Client[] (fk_client_source)

**Indexes:** status, name, deleted_at  
**Unique:** name

---

### 6. ClientGroup
Client categories/groups.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| name | String(100) | Unique name |
| description | Text? | Description |
| status | RecordStatus | Default: ACTIVE |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |
| registered_by | Int? | → User |
| modified_by | Int? | → User |

**Relations:**
- `clients` → Client[] (fk_client_group)

**Indexes:** status, name, deleted_at  
**Unique:** name

---

### 7. Department
Hospital departments.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| name | String(100) | Unique name |
| description | Text? | Description |
| status | RecordStatus | Default: ACTIVE |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |
| registered_by | Int? | → User |
| modified_by | Int? | → User |

**Relations:**
- `rooms` → Room[] (fk_room_department)
- `services` → Service[] (fk_service_department)

**Indexes:** status, name, deleted_at  
**Unique:** name

---

### 8. Client
Patients/Clients (CRM core).

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| full_name | String(100) | Full name |
| phone | String(20) | Phone number |
| group_id | Int? | → ClientGroup |
| gender | ClientGender | MALE/FEMALE/OTHER |
| date_of_birth | DateTime? | Birth date |
| region_id | Int? | → LocRegion |
| district_id | Int? | → LocDistrict |
| address | String(255)? | Address |
| balance | Decimal(15,2) | Default: 0 |
| description | Text? | Notes |
| source_id | Int? | → Source |
| status | RecordStatus | Default: ACTIVE |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |
| registered_by | Int? | → User |
| modified_by | Int? | → User |

**Relations:**
- `group` → ClientGroup? (fk_client_group)
- `district` → LocDistrict? (fk_client_district)
- `region` → LocRegion? (fk_client_region)
- `source` → Source? (fk_client_source)
- `register_user` → User? (fk_client_registered_by)
- `modify_user` → User? (fk_client_modified_by)
- `payments` → Payment[] (fk_payment_client)
- `visits` → Visit[] (fk_visit_client)
- `client_paid` → ClientPaid[] (fk_client_paid_client)

**Indexes:** group_id, region_id, district_id, source_id, status, phone, created_at, deleted_at, [status, deleted_at], [phone, status]

---

### 9. Room
Hospital rooms.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| department_id | Int? | → Department |
| name | String(100) | Room name |
| room_number | String(20)? | Room number |
| status | RoomStatus | Default: AVAILABLE |
| description | Text? | Description |
| record_status | RecordStatus | Default: ACTIVE |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |
| registered_by | Int? | → User |
| modified_by | Int? | → User |

**Relations:**
- `department` → Department? (fk_room_department)
- `register_user` → User? (fk_room_registered_by)
- `modify_user` → User? (fk_room_modified_by)
- `visit_rooms` → VisitRoom[] (fk_visit_room_room)

**Indexes:** department_id, status, record_status, deleted_at, [department_id, status]

---

### 10. Service
Medical services catalog.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| department_id | Int? | → Department |
| name | String(100) | Service name |
| price | Decimal(15,2) | Default: 0 |
| duration_min | Int? | Default: 30 |
| description | Text? | Description |
| status | RecordStatus | Default: ACTIVE |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |
| registered_by | Int? | → User |
| modified_by | Int? | → User |

**Relations:**
- `department` → Department? (fk_service_department)
- `register_user` → User? (fk_service_registered_by)
- `modify_user` → User? (fk_service_modified_by)
- `service_users` → ServiceUser[] (fk_service_user_service)
- `visit_services` → VisitService[] (fk_visit_service_service)

**Indexes:** department_id, status, deleted_at, [department_id, status]

---

### 11. Referral
Referral sources (people who refer clients).

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| full_name | String(100) | Full name |
| phone | String(20)? | Phone |
| description | Text? | Description |
| status | RecordStatus | Default: ACTIVE |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |
| registered_by | Int? | → User |
| modified_by | Int? | → User |

**Relations:**
- `register_user` → User? (fk_referral_registered_by)
- `modify_user` → User? (fk_referral_modified_by)
- `visit_referrals` → VisitReferral[] (fk_visit_referral_referral)

**Indexes:** status, phone, deleted_at

---

### 12. Visit
Visit/Appointment (CORE entity).

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| client_id | Int? | → Client |
| doctor_id | Int? | → User (doctor) |
| status | VisitStatus | SCHEDULED/IN_PROGRESS/COMPLETED/CANCELLED/NO_SHOW/DONE |
| total_amount | Decimal(15,2) | Default: 0 |
| paid_amount | Decimal(15,2) | Default: 0 |
| debt_amount | Decimal(15,2) | Default: 0 |
| description | Text? | Description |
| visit_date | DateTime | Default: now() |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |
| registered_by | Int? | → User |
| modified_by | Int? | → User |

**Relations:**
- `client` → Client? (fk_visit_client)
- `doctor` → User? (fk_visit_doctor)
- `register_user` → User? (fk_visit_registered_by)
- `modify_user` → User? (fk_visit_modified_by)
- `visit_referrals` → VisitReferral[] (fk_visit_referral_visit)
- `visit_rooms` → VisitRoom[] (fk_visit_room_visit)
- `visit_services` → VisitService[] (fk_visit_service_visit)
- `payments` → Payment[] (fk_payment_visit)
- `client_paid` → ClientPaid[] (fk_client_paid_visit)

**Indexes:** client_id, doctor_id, status, visit_date, deleted_at, [client_id, visit_date], [doctor_id, visit_date], [status, visit_date], [visit_date, deleted_at]

---

### 13. VisitService
Services provided during a visit.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| visit_id | Int? | → Visit |
| service_id | Int? | → Service |
| user_id | Int? | → User (doctor) |
| quantity | Int | Default: 1 |
| price | Decimal(15,2) | Service price |
| total | Decimal(15,2) | quantity * price |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |
| registered_by | Int? | → User |
| modified_by | Int? | → User |

**Relations:**
- `visit` → Visit? (fk_visit_service_visit)
- `service` → Service? (fk_visit_service_service)
- `user` → User? (fk_visit_service_user)
- `register_user` → User? (fk_visit_service_registered_by)
- `modify_user` → User? (fk_visit_service_modified_by)

**Indexes:** visit_id, service_id, user_id, deleted_at, [visit_id, service_id]

---

### 14. VisitRoom
Rooms used during a visit.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| visit_id | Int? | → Visit |
| room_id | Int? | → Room |
| status | VisitRoomStatus | ASSIGNED/IN_USE/COMPLETED |
| start_time | DateTime? | Usage start |
| end_time | DateTime? | Usage end |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |
| registered_by | Int? | → User |
| modified_by | Int? | → User |

**Relations:**
- `visit` → Visit? (fk_visit_room_visit)
- `room` → Room? (fk_visit_room_room)
- `register_user` → User? (fk_visit_room_registered_by)
- `modify_user` → User? (fk_visit_room_modified_by)

**Indexes:** visit_id, room_id, status, deleted_at

---

### 15. VisitReferral
Referrals linked to visits.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| visit_id | Int? | → Visit |
| referral_id | Int? | → Referral |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |
| registered_by | Int? | → User |
| modified_by | Int? | → User |

**Relations:**
- `visit` → Visit? (fk_visit_referral_visit)
- `referral` → Referral? (fk_visit_referral_referral)
- `register_user` → User? (fk_visit_referral_registered_by)
- `modify_user` → User? (fk_visit_referral_modified_by)

**Indexes:** visit_id, referral_id, deleted_at

---

### 16. ServiceUser
Doctor commission rates for services.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| service_id | Int? | → Service |
| user_id | Int? | → User (doctor) |
| type | ServiceUserType | FIXED or PERCENT |
| value | Decimal(10,2) | Commission value |
| status | RecordStatus | Default: ACTIVE |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |
| registered_by | Int? | → User |
| modified_by | Int? | → User |

**Relations:**
- `service` → Service? (fk_service_user_service)
- `user` → User? (fk_service_user_user)
- `register_user` → User? (fk_service_user_registered_by)
- `modify_user` → User? (fk_service_user_modified_by)

**Indexes:** service_id, user_id, status, deleted_at, [service_id, user_id]  
**Unique:** [service_id, user_id]

---

### 17. Payment
Payment transactions.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| client_id | Int? | → Client |
| user_id | Int? | → User |
| visit_id | Int? | → Visit |
| amount | Decimal(15,2) | Default: 0 |
| payment_type | PaymentType | INCOME or OUTCOME |
| description | Text? | Description |
| payment_date | DateTime | Default: now() |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |
| registered_by | Int? | → User |
| modified_by | Int? | → User |

**Relations:**
- `client` → Client? (fk_payment_client)
- `user` → User? (fk_payment_user)
- `visit` → Visit? (fk_payment_visit)
- `register_user` → User? (fk_payment_registered_by)
- `modify_user` → User? (fk_payment_modified_by)

**Indexes:** client_id, user_id, visit_id, payment_type, payment_date, deleted_at, [client_id, payment_date], [payment_type, payment_date], [payment_date, deleted_at]

---

### 18. ClientPaid
Client prepayments.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| client_id | Int? | → Client |
| visit_id | Int? | → Visit |
| amount | Decimal(15,2) | Default: 0 |
| description | Text? | Description |
| payment_date | DateTime | Default: now() |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |
| registered_by | Int? | → User |
| modified_by | Int? | → User |

**Relations:**
- `client` → Client? (fk_client_paid_client)
- `visit` → Visit? (fk_client_paid_visit)
- `register_user` → User? (fk_client_paid_registered_by)
- `modify_user` → User? (fk_client_paid_modified_by)

**Indexes:** client_id, visit_id, payment_date, deleted_at, [client_id, payment_date], [visit_id, payment_date]

---

### 19. OtherPaidGroup
Expense categories.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| name | String(100) | Category name |
| description | Text? | Description |
| status | RecordStatus | Default: ACTIVE |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |
| registered_by | Int? | → User |
| modified_by | Int? | → User |

**Relations:**
- `other_paid` → OtherPaid[] (fk_other_paid_group)
- `register_user` → User? (fk_other_paid_group_registered_by)
- `modify_user` → User? (fk_other_paid_group_modified_by)

**Indexes:** status, name, deleted_at

---

### 20. OtherPaid
Other income/expenses.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| group_id | Int? | → OtherPaidGroup |
| type | PaymentType | INCOME or OUTCOME |
| amount | Decimal(15,2) | Default: 0 |
| description | Text? | Description |
| payment_date | DateTime | Default: now() |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| deleted_at | DateTime? | Soft delete |
| registered_by | Int? | → User |
| modified_by | Int? | → User |

**Relations:**
- `group` → OtherPaidGroup? (fk_other_paid_group)
- `register_user` → User? (fk_other_paid_registered_by)
- `modify_user` → User? (fk_other_paid_modified_by)

**Indexes:** group_id, type, payment_date, deleted_at, [type, payment_date]

---

## Dependency Graph

```
PHASE 1: FOUNDATION
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ UserRole │  │LocRegion │  │  Source  │  │ClientGrp │
└────┬─────┘  └────┬─────┘  └──────────┘  └────┬─────┘
     │             │                            │
┌────▼─────┐  ┌────▼─────┐  ┌──────────┐       │
│   User   │  │LocDistrict│ │Department│       │
└──────────┘  └──────────┘  └──────────┘       │
                                                  │
PHASE 2: CORE                                     │
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────▼──────┐
│  Client  │  │   Room   │  │ Service  │  │  Referral   │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └─────────────┘
     │             │             │
     └─────────────┴──────┬──────┘
                          ▼
                    ┌──────────┐
                    │  Visit   │
                    └────┬─────┘
                          │
PHASE 3: DETAILS          │
     ┌────────────────────┼────────────────────┐
     ▼                    ▼                    ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│VisitService  │  │  VisitRoom   │  │VisitReferral │
└──────────────┘  └──────────────┘  └──────────────┘
┌──────────────┐
│ ServiceUser  │
└──────────────┘

PHASE 4: FINANCE
┌──────────┐  ┌──────────────┐  ┌──────────────┐
│ Payment  │  │  ClientPaid  │  │OtherPaidGroup│
└──────────┘  └──────────────┘  └──────┬───────┘
                                       │
                               ┌───────▼───────┐
                               │   OtherPaid   │
                               └───────────────┘
```

---

## Audit Fields (All Models)

Every model has these 5 audit fields:

| Field | Type | Description |
|-------|------|-------------|
| registered_by | Int? | User who created the record |
| modified_by | Int? | User who last modified |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |
| deleted_at | DateTime? | Soft delete timestamp |

---

## Foreign Key Rules

**ON DELETE:**
- `SetNull` - Most relations (preserve history)
- `Cascade` - VisitService, VisitRoom, VisitReferral (child records)

**ON UPDATE:**
- `Cascade` - All relations

---

## Key Indexes

**Single Column:**
- All primary keys (id)
- status (filtering)
- created_at, deleted_at (sorting)
- phone, email, login (search/auth)

**Composite:**
- [client_id, visit_date] - Client history
- [doctor_id, visit_date] - Doctor schedule
- [status, visit_date] - Visit filtering
- [service_id, user_id] - ServiceUser unique
- [payment_type, payment_date] - Financial reports
