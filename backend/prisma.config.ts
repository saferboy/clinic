import { join } from 'path';
import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// Backenddagi .env faylini yuklash
config({ path: join(__dirname, './.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
});

