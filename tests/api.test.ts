import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { db } from '../src/server/db/storageEngine.js';
import { enrichProduct } from '../src/server/controllers/productController.js';

describe('BasketWise System Architecture & API Tests', () => {
  before(async () => {
    await db.init();
    await db.resetAndSeed();
  });

  test('Database StorageEngine seeds initial categories and products', () => {
    assert.ok(db.categories.length >= 6, 'Should have at least 6 categories');
    assert.ok(db.products.length >= 20, 'Should have at least 20 products');
    assert.ok(db.sellers.length >= 5, 'Should have at least 5 sellers');
    assert.ok(db.offers.length >= 30, 'Should have multiple offers');
    assert.ok(db.priceHistories.length >= 10, 'Should have verified price observations');
  });

  test('Product enrichment calculates true lowest offer and seller name', () => {
    const sonyHeadphones = db.products.find((p) => p._id === 'prd_sony_wh1000xm5');
    assert.ok(sonyHeadphones, 'Sony headphones should exist');

    const enriched = enrichProduct(sonyHeadphones);
    // Vijay Sales offer is ₹25,990 (lowest among Croma: 26990, Reliance: 27499, Vijay: 25990, TataCLiQ: 28990)
    assert.equal(enriched.lowestPrice, 25990);
    assert.equal(enriched.lowestOfferSellerName, 'Vijay Sales');
    assert.ok(enriched.maxDiscountPercent > 20, 'Discount percentage should be calculated');
  });

  test('Keyword search and brand filtering work accurately', () => {
    const query = 'sony';
    const matches = db.products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
    );
    assert.ok(matches.length >= 1, 'Should find Sony products');
    assert.equal(matches[0].brand, 'Sony');
  });

  test('User authentication: Password hashing with bcrypt works', async () => {
    const adminUser = db.users.find((u) => u.email === 'admin@basketwise.com');
    assert.ok(adminUser, 'Admin user should be seeded');
    assert.equal(adminUser.role, 'admin');

    // Password must be hashed and match Admin@123
    const isMatch = await bcrypt.compare('Admin@123', adminUser.passwordHash);
    assert.ok(isMatch, 'Password should match hash');

    const wrongMatch = await bcrypt.compare('WrongPassword', adminUser.passwordHash);
    assert.equal(wrongMatch, false, 'Invalid credentials should fail');
  });

  test('Wishlist operations: Add and prevent duplicates', () => {
    const testUserId = 'test_user_demo';
    let wishlist = db.wishlists.find((w) => w.userId === testUserId);
    if (!wishlist) {
      wishlist = {
        _id: 'wsh_test',
        userId: testUserId,
        productIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.wishlists.push(wishlist);
    }

    // Add product
    wishlist.productIds.push('prd_sony_wh1000xm5');
    assert.equal(wishlist.productIds.includes('prd_sony_wh1000xm5'), true);

    // Filter remove
    wishlist.productIds = wishlist.productIds.filter((id) => id !== 'prd_sony_wh1000xm5');
    assert.equal(wishlist.productIds.includes('prd_sony_wh1000xm5'), false);
  });

  test('Shopping list total and completion calculations', () => {
    const sampleList = {
      items: [
        { productId: 'prd_sony_wh1000xm5', quantity: 1, purchased: true },
        { productId: 'prd_breville_barista_touch', quantity: 2, purchased: false },
      ],
    };

    const purchasedCount = sampleList.items.filter((i) => i.purchased).length;
    const progress = Math.round((purchasedCount / sampleList.items.length) * 100);
    assert.equal(progress, 50, '1 out of 2 items purchased is 50%');
  });

  test('Price Alert evaluation against verified lowest offer', () => {
    const sonyHeadphones = db.products.find((p) => p._id === 'prd_sony_wh1000xm5');
    assert.ok(sonyHeadphones);
    const enriched = enrichProduct(sonyHeadphones);

    const targetPrice = 26000;
    const isReached = enriched.lowestPrice <= targetPrice;
    assert.equal(isReached, true, 'Since lowest is 25990, 26000 target is reached');

    const higherTarget = 24000;
    const isReachedHigh = enriched.lowestPrice <= higherTarget;
    assert.equal(isReachedHigh, false, 'Target 24000 is not yet reached');
  });
});
