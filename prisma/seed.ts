import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Starting fresh seeding...');

  await prisma.attendance.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("demo@123", 10);

  const user = await prisma.user.create({
    data: {
      name: 'Developer',
      email: 'demo@test.com',
      password: hashedPassword,
    },
  });

  console.log('Creating events for April, May, and June...');

  await prisma.event.create({
    data: {
      title: 'Global Tech Expo 2026',
      description: 'A massive gathering of tech enthusiasts and innovators.',
      date: new Date("2026-04-12T10:00:00Z"),
      totalCapacity: 300,
      remainingTickets: 100,
    },
  });

  await prisma.event.create({
    data: {
      title: 'React Advanced Workshop',
      description: 'Deep dive into React Server Components and Next.js 15.',
      date: new Date("2026-05-05T09:00:00Z"),
      totalCapacity: 100,
      remainingTickets: 10,
    },
  });

  await prisma.event.create({
    data: {
      title: 'Exclusive AI Roundtable',
      description: 'An intimate discussion on the future of Generative AI.',
      date: new Date("2026-05-20T18:30:00Z"),
      totalCapacity: 50,
      remainingTickets: 50,
    },
  });

  await prisma.event.create({
    data: {
      title: 'Full-Stack Summer Camp',
      description: 'Master the MERN stack in this intensive summer series.',
      date: new Date("2026-06-15T08:00:00Z"),
      totalCapacity: 100,
      remainingTickets: 100,
    },
  });

  console.log('\n--- SEEDING COMPLETE ---');
  console.log('Events created:');
  console.log('- April 12: Global Tech Expo (100/300)');
  console.log('- May 05: React Workshop (10/100)');
  console.log('- May 20: AI Roundtable (50/50)');
  console.log('- June 15: Summer Camp (100/100)');
  console.log('------------------------\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  