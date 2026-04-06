# DEVELOPMENT.md - Development Guide & Next Steps

## Current Status

### ✅ Completed (Phase 1)
- [x] Project setup (NestJS + Prisma)
- [x] Database schema (20 models defined)
- [x] Docker configuration (PostgreSQL + Redis)
- [x] Environment setup (.env)
- [x] Prisma service (Global module)
- [x] Seed data (Admin user + classifiers)
- [x] 7 CRUD modules implemented:
  - Users
  - User Roles
  - Regions
  - Districts
  - Sources
  - Client Groups
  - Departments

### 🚧 Next Priority (Phase 2)
1. **Client Module** - Patient management (CRM core)
2. **Room Module** - Room management
3. **Service Module** - Service catalog
4. **Referral Module** - Referral sources
5. **Visit Module** - Appointment management (CORE)

### 📋 Future (Phase 3)
- VisitService - Services per visit
- VisitRoom - Rooms per visit
- VisitReferral - Referrals per visit
- ServiceUser - Doctor commission rates

### 📋 Future (Phase 4)
- Payment - Payment processing
- ClientPaid - Prepayments
- OtherPaidGroup - Expense categories
- OtherPaid - Other income/expenses

---

## Module Template

Use this template for creating new modules:

### 1. Create Module Structure
```
src/modules/{module-name}/
├── dto/
│   ├── create-{name}.dto.ts
│   └── update-{name}.dto.ts
├── {name}.controller.ts
├── {name}.service.ts
├── {name}.module.ts
└── index.ts (optional barrel export)
```

### 2. Generate with Nest CLI
```bash
nest g module modules/{module-name}
nest g controller modules/{module-name}
nest g service modules/{module-name}
```

### 3. Create DTOs

**create-{name}.dto.ts:**
```typescript
import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  parent_id?: number;
}
```

**update-{name}.dto.ts:**
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateDto } from './create-{name}.dto';

export class UpdateDto extends PartialType(CreateDto) {}
```

### 4. Implement Service

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';

const select = {
  id: true,
  name: true,
  description: true,
  status: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
};

@Injectable()
export class Service {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDto) {
    return this.prisma.model.create({
      data: dto,
      select,
    });
  }

  async findMany() {
    return this.prisma.model.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
      select,
    });
  }

  async findOne(id: number) {
    const row = await this.prisma.model.findFirst({
      where: { id, deleted_at: null },
      select,
    });
    if (!row) throw new NotFoundException('Not found');
    return row;
  }

  private async findRaw(id: number) {
    const row = await this.prisma.model.findFirst({
      where: { id, deleted_at: null },
    });
    if (!row) throw new NotFoundException('Not found');
    return row;
  }

  async update(id: number, dto: UpdateDto) {
    await this.findRaw(id);
    return this.prisma.model.update({
      where: { id },
      data: dto,
      select,
    });
  }

  async remove(id: number) {
    await this.findRaw(id);
    return this.prisma.model.update({
      where: { id },
      data: { deleted_at: new Date() },
      select,
    });
  }
}
```

### 5. Implement Controller

```typescript
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';
import { Service } from './service';

@ApiTags('{module-name}')
@Controller('{module-name}')
export class Controller {
  constructor(private readonly service: Service) {}

  @Post()
  create(@Body() dto: CreateDto) {
    return this.service.create(dto);
  }

  @Get()
  findMany() {
    return this.service.findMany();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
```

### 6. Register in AppModule

```typescript
// src/app.module.ts
import { NewModule } from './modules/new-module/new-module.module';

@Module({
  imports: [
    // ... existing
    NewModule,
  ],
})
export class AppModule {}
```

---

## Development Workflow

### 1. Start Development
```bash
# Terminal 1: Start database
docker-compose up -d

# Terminal 2: Start dev server
npm run start:dev

# Terminal 3: (Optional) Prisma Studio
npx prisma studio
```

### 2. After Schema Changes
```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name description_of_changes

# (Optional) Reset database (DEVELOPMENT ONLY)
npx prisma migrate reset

# Seed data
npm run seed
```

### 3. Code Quality
```bash
# Lint
npm run lint

# Format
npm run format

# Test
npm run test
npm run test:e2e
```

### 4. Build for Production
```bash
npm run build
npm run start:prod
```

---

## Next Module to Implement: Clients

### Priority: HIGH (Phase 2)

**File:** `src/modules/clients/`

**Dependencies:** User, LocRegion, LocDistrict, Source, ClientGroup

**DTOs:**

**create-client.dto.ts:**
```typescript
import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ClientGender } from '@prisma/client';

export class CreateClientDto {
  @IsString()
  @MaxLength(100)
  full_name: string;

  @IsString()
  @MaxLength(20)
  phone: string;

  @IsOptional()
  @IsInt()
  group_id?: number;

  @IsEnum(ClientGender)
  gender: ClientGender;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @IsInt()
  region_id?: number;

  @IsOptional()
  @IsInt()
  district_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsInt()
  source_id?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
```

**update-client.dto.ts:**
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';

export class UpdateClientDto extends PartialType(CreateClientDto) {}
```

**Service Select:**
```typescript
const clientSelect = {
  id: true,
  full_name: true,
  phone: true,
  group_id: true,
  gender: true,
  date_of_birth: true,
  region_id: true,
  district_id: true,
  address: true,
  balance: true,
  description: true,
  source_id: true,
  status: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  registered_by: true,
  modified_by: true,
};
```

**Relations to Include:**
```typescript
// In findMany/findOne
include: {
  group: true,
  region: true,
  district: true,
  source: true,
  register_user: true,
  modify_user: true,
}
```

---

## Common Tasks

### Add New Field to Model
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_field_name`
3. Run `npx prisma generate`
4. Update DTOs
5. Update service select object
6. Test

### Add New Module
1. Create module structure
2. Create DTOs
3. Implement service
4. Implement controller
5. Register in AppModule
6. Test with Swagger

### Debug Database
```bash
# Open Prisma Studio
npx prisma studio

# Connect to PostgreSQL
docker exec -it clinic_postgres psql -U clinic_user -d clinic_db

# View logs
docker-compose logs -f postgres
```

---

## Testing Strategy

### Unit Tests
```typescript
// clients.service.spec.ts
describe('ClientsService', () => {
  let service: ClientsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: PrismaService,
          useValue: {
            client: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a client', async () => {
    const dto: CreateClientDto = {
      full_name: 'Test Client',
      phone: '+998901234567',
      gender: ClientGender.MALE,
    };

    jest.spyOn(prisma.client, 'create').mockResolvedValue({
      id: 1,
      ...dto,
      status: RecordStatus.ACTIVE,
    });

    const result = await service.create(dto);
    expect(result.full_name).toBe('Test Client');
  });
});
```

### E2E Tests
```typescript
// clients.e2e-spec.ts
describe('Clients (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/clients (POST)', () => {
    return request(app.getHttpServer())
      .post('/clients')
      .send({
        full_name: 'Test Client',
        phone: '+998901234567',
        gender: 'MALE',
      })
      .expect(201);
  });
});
```

---

## Git Workflow

### Commit Message Format
```
type(module): description

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code refactoring
- `docs` - Documentation
- `test` - Tests
- `chore` - Maintenance

**Examples:**
```
feat(clients): add client CRUD operations
fix(users): resolve password hash issue
refactor(prisma): optimize database queries
docs(api): update API documentation
test(clients): add unit tests for service
chore: update dependencies
```

### Branch Strategy
```bash
# Main branches
main          # Production
develop       # Development

# Feature branches
feature/clients-module
feature/visits-module
fix/auth-bug

# Workflow
git checkout develop
git pull origin develop
git checkout -b feature/feature-name

# After completion
git push origin feature/feature-name
# Create Pull Request: feature/* → develop
```

---

## Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check connection
docker exec -it clinic_postgres psql -U clinic_user -d clinic_db
```

### Prisma Client Not Generated
```bash
npx prisma generate
```

### Migration Error
```bash
# Check migration status
npx prisma migrate status

# Reset migrations (DEV ONLY)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name fix_issue
```

### Port Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

### TypeScript Errors
```bash
# Clear build cache
rm -rf dist
rm -rf node_modules/.cache

# Rebuild
npm run build
```

---

## Resources

### Documentation
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

### Project Docs
- `QWEN.md` - Project overview
- `DATABASE.md` - Database schema
- `API.md` - API specification
- `clinic-doc/texnik-hujjat.md` - Full technical spec
- `clinic-doc/prioritet.md` - Development priorities

### Useful Commands
```bash
# Development
npm run start:dev
npx prisma studio
docker-compose up -d

# Database
npx prisma migrate dev
npx prisma generate
npm run seed

# Code Quality
npm run lint
npm run format
npm run test

# Production
npm run build
npm run start:prod
```

---

## Contact & Support

For questions or issues, refer to:
- Project documentation in `clinic-doc/`
- Swagger API docs at `http://localhost:3000/docs`
- Prisma Studio at `http://localhost:5555`
