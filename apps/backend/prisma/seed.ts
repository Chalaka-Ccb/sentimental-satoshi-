import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  const hash = await bcrypt.hash('testpassword123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'test@satoshi.dev' },
    update: {},
    create: {
      email: 'test@satoshi.dev',
      passwordHash: hash,
      watchlists: {
        create: {
          name: 'My Watchlist',
          assets: {
            createMany: {
              data: [{ symbol: 'BTC' }, { symbol: 'ETH' }, { symbol: 'SOL' }],
            },
          },
        },
      },
    },
  });
  console.log('Seeded user:', user.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());