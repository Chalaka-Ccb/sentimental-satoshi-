import { getPrisma } from '../src/lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  const prisma = await getPrisma();
  console.log('🌱 Seeding database...\n');

  // ─── Test User ──────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('testpassword123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'dev@satoshi.local' },
    update: {},
    create: {
      email: 'dev@satoshi.local',
      passwordHash,
      watchlists: {
        create: {
          name: 'My Watchlist',
          assets: {
            createMany: {
              data: [
                { symbol: 'BTC' },
                { symbol: 'ETH' },
                { symbol: 'SOL' },
                { symbol: 'ADA' },
                { symbol: 'LINK' },
              ],
            },
          },
        },
      },
    },
    include: { watchlists: { include: { assets: true } } },
  });

  console.log(`✅ User: ${user.email}`);
  console.log(`   Watchlist: "${user.watchlists[0].name}" with ${user.watchlists[0].assets.length} assets`);

  // ─── Sample Sentiment Scores ────────────────────────────────────────────
  const sampleScores = [
    { symbol: 'BTC', score: 0.72, conviction: 0.85, mentionVolume: 1240 },
    { symbol: 'ETH', score: 0.41, conviction: 0.67, mentionVolume: 890 },
    { symbol: 'SOL', score: -0.18, conviction: 0.52, mentionVolume: 340 },
    { symbol: 'BTC', score: 0.55, conviction: 0.78, mentionVolume: 980 },
    { symbol: 'ETH', score: 0.63, conviction: 0.71, mentionVolume: 720 },
  ];

  for (const s of sampleScores) {
    await prisma.sentimentScore.create({
      data: {
        ...s,
        sources: { twitter: Math.floor(s.mentionVolume * 0.6), reddit: Math.floor(s.mentionVolume * 0.3), news: Math.floor(s.mentionVolume * 0.1) },
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log(`✅ Created ${sampleScores.length} sample sentiment scores`);
  console.log('\n✅ Seed complete.');
  console.log('\nTest credentials:');
  console.log('  Email:    dev@satoshi.local');
  console.log('  Password: testpassword123\n');

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
