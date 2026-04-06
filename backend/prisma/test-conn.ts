import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
  const envPath = path.join(__dirname, '../../.env');
  console.log('Loading env from:', envPath);
  dotenv.config({ path: envPath });

  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Connected successfully!');
    
    const rolesCount = await prisma.userRole.count();
    console.log('User roles count:', rolesCount);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
