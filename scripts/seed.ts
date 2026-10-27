import { db } from '../src/server/db/storageEngine.js';

async function runSeed() {
  console.log('[BasketWise Seed] Initializing and resetting database to pristine demo state...');
  await db.init();
  await db.resetAndSeed();
  console.log(`[BasketWise Seed] Seeding complete!`);
  console.log(`- Categories: ${db.categories.length}`);
  console.log(`- Products: ${db.products.length}`);
  console.log(`- Sellers: ${db.sellers.length}`);
  console.log(`- Offers: ${db.offers.length}`);
  console.log(`- Historical Observations: ${db.priceHistories.length}`);
  console.log(`- Users: ${db.users.length}`);
  console.log(`  * Admin: admin@basketwise.com / Admin@123`);
  console.log(`  * User:  alex@example.com / User@123`);
}

runSeed().catch((err) => {
  console.error('[BasketWise Seed Error]', err);
  process.exit(1);
});
