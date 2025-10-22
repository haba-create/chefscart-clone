#!/usr/bin/env tsx
/**
 * Product Scraping Script
 *
 * Scrapes UK supermarkets for common grocery items
 * and populates the database
 */

import ProductDatabase from '../database.js';
import GroceryScraper from '../scrapers/groceryScraper.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Common grocery search terms to populate database
const COMMON_ITEMS = [
  // Dairy
  'milk', 'butter', 'cheese', 'yogurt', 'cream', 'eggs',

  // Meat & Fish
  'chicken breast', 'beef mince', 'pork chops', 'salmon', 'cod',

  // Fruit & Veg
  'bananas', 'apples', 'oranges', 'tomatoes', 'potatoes', 'carrots',
  'onions', 'peppers', 'lettuce', 'broccoli',

  // Bakery
  'bread', 'bagels', 'croissants',

  // Pantry
  'pasta', 'rice', 'flour', 'sugar', 'olive oil', 'cereal',
  'baked beans', 'tinned tomatoes',

  // Beverages
  'orange juice', 'coffee', 'tea',

  // Frozen
  'frozen peas', 'ice cream',

  // Snacks
  'crisps', 'chocolate', 'biscuits',
];

async function scrapeProducts() {
  console.log('🕷️  ChefsCart Product Scraping\n');

  const dbPath = join(__dirname, '../../database/products.db');
  const db = new ProductDatabase(dbPath);

  const scraper = new GroceryScraper(db, {
    rapidApiKey: process.env.RAPID_API_KEY,
    enableCaching: true,
    cacheExpiryHours: 6,
    rateLimit: 60,
  });

  console.log('📋 Items to scrape:', COMMON_ITEMS.length);
  console.log('🏪 Stores: Tesco, Sainsburys, Waitrose, Ocado\n');

  if (!process.env.RAPID_API_KEY) {
    console.log('⚠️  RAPID_API_KEY not set - using direct scraping');
    console.log('   Get a key at: https://rapidapi.com/localpearuk/api/uk-supermarkets-product-pricing\n');
  } else {
    console.log('✅ RapidAPI key configured\n');
  }

  let totalProducts = 0;
  let completed = 0;

  for (const item of COMMON_ITEMS) {
    try {
      console.log(`\n[${completed + 1}/${COMMON_ITEMS.length}] Scraping: "${item}"`);

      const results = await scraper.scrapeAllStores(item);
      totalProducts += results.length;

      console.log(`   ✅ Found ${results.length} products`);

      // Rate limiting - wait 2 seconds between searches
      await new Promise(resolve => setTimeout(resolve, 2000));

      completed++;

    } catch (error: any) {
      console.error(`   ❌ Error scraping "${item}":`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Scraping Complete!');
  console.log('='.repeat(60));

  const stats = db.getStats();
  console.log(`✅ Total products in database: ${stats.total_products}`);
  console.log(`🏪 Stores covered: ${stats.total_stores}`);
  console.log(`📦 Categories: ${stats.total_categories}`);
  console.log(`🕐 Last updated: ${stats.last_updated}`);

  console.log('\n💡 Next step: Start the server with: npm run dev\n');

  db.close();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeProducts().catch(error => {
    console.error('❌ Scraping error:', error);
    process.exit(1);
  });
}

export default scrapeProducts;
