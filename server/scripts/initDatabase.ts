#!/usr/bin/env tsx
/**
 * Database Initialization Script
 *
 * Initializes the SQLite database with the schema
 * and optionally seeds with sample data
 */

import ProductDatabase from '../database.js';
import { existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDatabase() {
  console.log('🗄️  Initializing ChefsCart Database...\n');

  const dbPath = join(__dirname, '../../database/products.db');

  // Check if database exists
  if (existsSync(dbPath)) {
    console.log('⚠️  Database already exists at:', dbPath);
    console.log('   To recreate, delete the file first.\n');

    // Just show stats
    const db = new ProductDatabase(dbPath);
    const stats = db.getStats();
    console.log('📊 Current Database Stats:');
    console.log(`   - Products: ${stats.total_products}`);
    console.log(`   - Stores: ${stats.total_stores}`);
    console.log(`   - Categories: ${stats.total_categories}`);
    console.log(`   - Last Updated: ${stats.last_updated || 'Never'}`);
    db.close();
    return;
  }

  // Create new database
  console.log('✨ Creating new database...');
  const db = new ProductDatabase(dbPath);

  console.log('✅ Database initialized successfully!');
  console.log('📍 Location:', dbPath);
  console.log('\n💡 Next steps:');
  console.log('   1. Run: npm run db:scrape');
  console.log('   2. Or use the API to scrape: POST /api/scrape');
  console.log('   3. Start the server: npm run dev\n');

  db.close();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase().catch(error => {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  });
}

export default initDatabase;
