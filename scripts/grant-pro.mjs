import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const identifier = process.argv[2]?.trim();

if (!identifier) {
  console.error('Usage: npm run grant-pro -- <user-email-or-user-id-or-name>');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required. Run with npm run grant-pro so .env.local is loaded.');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const user = await prisma.user.findFirst({
  where: {
    OR: [
      { id: identifier },
      { email: identifier },
      { name: identifier },
    ],
  },
  select: {
    id: true,
    email: true,
    name: true,
  },
});

if (!user) {
  console.error(`No user found for "${identifier}". Ask them to sign in with GitHub first.`);
  await prisma.$disconnect();
  process.exit(1);
}

const existing = await prisma.entitlement.findFirst({
  where: {
    userId: user.id,
    plan: 'PRO',
  },
  select: { id: true },
});

if (existing) {
  await prisma.entitlement.update({
    where: { id: existing.id },
    data: {
      status: 'ACTIVE',
      paymentProvider: 'manual',
      providerCustomerId: user.email,
    },
  });
} else {
  await prisma.entitlement.create({
    data: {
      userId: user.id,
      plan: 'PRO',
      status: 'ACTIVE',
      paymentProvider: 'manual',
      providerCustomerId: user.email,
    },
  });
}

console.log(`Pro access active for ${user.email ?? user.name ?? user.id}.`);
await prisma.$disconnect();
