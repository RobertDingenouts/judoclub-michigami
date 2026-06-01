import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 12);
  await db.user.upsert({
    where: { email: 'robertdingenouts@gmail.com' },
    update: { passwordHash: hash, role: 'ADMIN' },
    create: { email: 'robertdingenouts@gmail.com', name: 'Robert', passwordHash: hash, role: 'ADMIN' }
  });
  console.log('Admin user created!');
}

main().catch(console.error).finally(() => db.$disconnect());
