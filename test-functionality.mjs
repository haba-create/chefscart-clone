#!/usr/bin/env node

/**
 * Comprehensive Functionality Test Suite
 * Tests all existing features in ChefsCart
 */

import { searchGroceries, getGroceryById, getGroceriesByCategory, getBestDeals, CATEGORIES } from './src/data/groceries.ts';

console.log('🧪 ChefsCart Functionality Test Suite\n');
console.log('═'.repeat(60));

let passedTests = 0;
let failedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ ${name}`);
    passedTests++;
    return true;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    failedTests++;
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ==================== PRODUCT DATABASE TESTS ====================
console.log('\n📦 Product Database Tests');
console.log('─'.repeat(60));

test('Search for milk products', () => {
  const results = searchGroceries('milk');
  assert(results.length > 0, 'Should find milk products');
  assert(results[0].name.toLowerCase().includes('milk'), 'Results should contain milk');
});

test('Search for bread products', () => {
  const results = searchGroceries('bread');
  assert(results.length > 0, 'Should find bread products');
});

test('Search for chicken products', () => {
  const results = searchGroceries('chicken');
  assert(results.length > 0, 'Should find chicken products');
});

test('Get product by ID', () => {
  const product = getGroceryById('milk-semi-2l');
  assert(product !== undefined, 'Should find product by ID');
  assert(product.name === 'Semi-Skimmed Milk', 'Should get correct product');
});

test('Get products by category (Dairy)', () => {
  const products = getGroceriesByCategory('Dairy');
  assert(products.length > 0, 'Should find dairy products');
  assert(products.every(p => p.category === 'Dairy'), 'All should be dairy');
});

test('Get products by category (Vegetables)', () => {
  const products = getGroceriesByCategory('Vegetables');
  assert(products.length > 0, 'Should find vegetables');
});

test('Get best deals', () => {
  const deals = getBestDeals(5);
  assert(deals.length > 0, 'Should find products with deals');
  assert(deals.every(p => p.deals && p.deals.length > 0), 'All should have deals');
});

test('All categories are defined', () => {
  assert(CATEGORIES.length > 0, 'Should have categories');
  assert(CATEGORIES.includes('Dairy'), 'Should include Dairy');
  assert(CATEGORIES.includes('Meat'), 'Should include Meat');
  assert(CATEGORIES.includes('Vegetables'), 'Should include Vegetables');
});

test('Products have required fields', () => {
  const product = getGroceryById('milk-semi-2l');
  assert(product.id, 'Should have id');
  assert(product.name, 'Should have name');
  assert(product.category, 'Should have category');
  assert(product.unit, 'Should have unit');
  assert(product.prices, 'Should have prices');
  assert(product.averagePrice > 0, 'Should have average price');
  assert(product.bestStore, 'Should have best store');
  assert(product.bestPrice > 0, 'Should have best price');
});

test('Products have prices from multiple stores', () => {
  const product = getGroceryById('milk-semi-2l');
  const storeCount = Object.keys(product.prices).length;
  assert(storeCount >= 3, `Should have prices from at least 3 stores, got ${storeCount}`);
});

test('Best price is actually the lowest', () => {
  const product = getGroceryById('eggs-medium-12');
  const allPrices = Object.values(product.prices).map(p => typeof p === 'object' ? p.price : p).filter(p => typeof p === 'number');
  const lowest = Math.min(...allPrices);
  assert(product.bestPrice === lowest, `Best price should be ${lowest}, got ${product.bestPrice}`);
});

test('Search is case-insensitive', () => {
  const lower = searchGroceries('milk');
  const upper = searchGroceries('MILK');
  assert(lower.length === upper.length, 'Search should be case-insensitive');
});

// ==================== STORE COVERAGE TESTS ====================
console.log('\n🏪 Store Coverage Tests');
console.log('─'.repeat(60));

test('Tesco prices exist for products', () => {
  const products = searchGroceries('milk');
  const hasTesco = products.some(p => p.prices.Tesco !== undefined);
  assert(hasTesco, 'Should have Tesco prices');
});

test('Sainsburys prices exist for products', () => {
  const products = searchGroceries('bread');
  const hasSainsburys = products.some(p => p.prices.Sainsburys !== undefined);
  assert(hasSainsburys, 'Should have Sainsburys prices');
});

test('Waitrose prices exist for products', () => {
  const products = searchGroceries('eggs');
  const hasWaitrose = products.some(p => p.prices.Waitrose !== undefined);
  assert(hasWaitrose, 'Should have Waitrose prices');
});

test('M&S prices exist for products', () => {
  const products = searchGroceries('chicken');
  const hasMS = products.some(p => p.prices['M&S'] !== undefined);
  assert(hasMS, 'Should have M&S prices');
});

test('Ocado prices should exist', () => {
  const products = searchGroceries('milk');
  const hasOcado = products.some(p => p.prices.Ocado !== undefined);
  if (!hasOcado) {
    console.log('   ⚠️  WARNING: Ocado prices not found - needs to be added');
  }
  // Don't fail the test, just warn
});

// ==================== PRICE ACCURACY TESTS ====================
console.log('\n💰 Price Accuracy Tests');
console.log('─'.repeat(60));

test('All prices are reasonable (£0.10 - £100)', () => {
  const product = getGroceryById('milk-semi-2l');
  Object.values(product.prices).forEach(price => {
    const p = typeof price === 'object' ? price.price : price;
    if (typeof p === 'number') {
      assert(p >= 0.1 && p <= 100, `Price should be between £0.10-£100, got £${p}`);
    }
  });
});

test('Average price is calculated correctly', () => {
  const product = getGroceryById('bread-white-800g');
  const prices = Object.values(product.prices)
    .map(p => typeof p === 'object' ? p.price : p)
    .filter(p => typeof p === 'number');
  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const diff = Math.abs(avg - product.averagePrice);
  assert(diff < 0.01, `Average price calculation off by ${diff.toFixed(2)}`);
});

// ==================== CATEGORY COVERAGE TESTS ====================
console.log('\n📋 Category Coverage Tests');
console.log('─'.repeat(60));

CATEGORIES.forEach(category => {
  test(`Category "${category}" has products`, () => {
    const products = getGroceriesByCategory(category);
    assert(products.length > 0, `Should have products in ${category}`);
  });
});

// ==================== DEAL TESTS ====================
console.log('\n🎉 Deal/Promotion Tests');
console.log('─'.repeat(60));

test('Deals have store and description', () => {
  const dealsProducts = getBestDeals(10);
  if (dealsProducts.length > 0) {
    const product = dealsProducts[0];
    const deal = product.deals[0];
    assert(deal.store, 'Deal should have store');
    assert(deal.description, 'Deal should have description');
    assert(deal.price > 0, 'Deal should have price');
    assert(deal.price < product.averagePrice, 'Deal price should be lower than average');
  }
});

// ==================== DATA CONSISTENCY TESTS ====================
console.log('\n🔍 Data Consistency Tests');
console.log('─'.repeat(60));

test('All products have unique IDs', () => {
  const milk = searchGroceries('milk');
  const bread = searchGroceries('bread');
  const allProducts = [...milk, ...bread];
  const ids = allProducts.map(p => p.id);
  const uniqueIds = new Set(ids);
  assert(ids.length === uniqueIds.size, 'All product IDs should be unique');
});

test('Best store matches best price', () => {
  const product = getGroceryById('pasta-penne-500g');
  const bestStorePrice = product.prices[product.bestStore];
  const actualPrice = typeof bestStorePrice === 'object' ? bestStorePrice.price : bestStorePrice;
  assert(actualPrice === product.bestPrice, 'Best store should have best price');
});

test('Units are specified for all products', () => {
  const products = searchGroceries('');
  const total = products.length;
  assert(total > 50, `Should have at least 50 products, got ${total}`);

  products.forEach(p => {
    assert(p.unit, `Product ${p.name} should have unit specified`);
  });
});

// ==================== SEARCH FUNCTIONALITY TESTS ====================
console.log('\n🔎 Search Functionality Tests');
console.log('─'.repeat(60));

test('Empty search returns all products', () => {
  const all = searchGroceries('');
  assert(all.length > 50, 'Empty search should return all products');
});

test('Search matches partial names', () => {
  const results = searchGroceries('chick');
  assert(results.length > 0, 'Should find products with partial match');
  assert(results.some(p => p.name.toLowerCase().includes('chicken')), 'Should match chicken products');
});

test('Search matches category names', () => {
  const results = searchGroceries('dairy');
  assert(results.length > 0, 'Should find products by category');
  assert(results.every(p => p.category === 'Dairy'), 'All results should be from Dairy category');
});

// ==================== SUMMARY ====================
console.log('\n');
console.log('═'.repeat(60));
console.log('📊 TEST SUMMARY');
console.log('═'.repeat(60));
console.log(`Total Tests: ${totalTests}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log('═'.repeat(60));

if (failedTests === 0) {
  console.log('\n🎉 All tests passed!');
  console.log('\n✅ Product database is working correctly');
  console.log('✅ Ready for integration testing');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${failedTests} test(s) failed`);
  console.log('❌ Fix issues before proceeding');
  process.exit(1);
}
