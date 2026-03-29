import fs from 'fs';
import path from 'path';

import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import 'dotenv/config'

const adapter = new PrismaMariaDb(process.env.DATABASE_URL as string)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding ...')

  await prisma.attendance.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.event.deleteMany()
  await prisma.user.deleteMany()

  const user1 = await prisma.user.create({
    data: {
      name: 'Harsh',
      email: 'harsh@example.com',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      name: 'Alice Developer',
      email: 'alice@example.com',
    },
  })

  const event1 = await prisma.event.create({
    data: {
      title: 'Next.js Global Summit 2026',
      description: 'The biggest Next.js and React conference of the year. Join us for deep dives into App Router and Server Actions.',
      date: new Date(new Date().setMonth(new Date().getMonth() + 1)), // 1 month from now
      totalCapacity: 500,
      remainingTickets: 499,
    },
  })

  const event2 = await prisma.event.create({
    data: {
      title: 'Local MERN Stack Meetup',
      description: 'A casual meetup for local developers building with Node, Express, React, and databases. Pizza provided!',
      date: new Date(new Date().setDate(new Date().getDate() + 14)), // 2 weeks from now
      totalCapacity: 50,
      remainingTickets: 50,
    },
  })

  const event3 = await prisma.event.create({
    data: {
      title: 'Exclusive Developer Workshop',
      description: 'An intimate workshop focusing on advanced system architecture and database race conditions.',
      date: new Date(new Date().setDate(new Date().getDate() + 3)), // 3 days from now
      totalCapacity: 5,
      remainingTickets: 5,
    },
  })

  await prisma.booking.create({
    data: {
      userId: user1.id,
      eventId: event1.id,
      ticketCount: 1,
      uniqueCode: "SEED-VIP-001",
    }
  })

  const configPath = path.join(process.cwd(), 'src', 'lib', 'config.ts');
  const content = `export const MOCK_USER_ID = "${user1.id}";`;
  fs.writeFileSync(configPath, content);

  console.log(`✅ Updated src/lib/config.ts with User ID: ${user1.id}`);

  console.log(`Created users: ${user1.name}, ${user2.name}`)
  console.log(`Created events: ${event1.title}, ${event2.title}, ${event3.title}`)
  
  console.log('\n--- IMPORTANT ---')
  console.log(`Use this User ID in your frontend (page.tsx): ${user1.id}`)
  console.log('-----------------\n')
  
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
