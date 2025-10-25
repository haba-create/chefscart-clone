/**
 * Test script to debug Apify integration
 * Run with: node test-apify.js
 */

import { ApifyClient } from 'apify-client';
import 'dotenv/config';

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

console.log('🔍 Testing Apify Integration\n');
console.log(`Token present: ${APIFY_TOKEN ? 'YES ✅' : 'NO ❌'}`);
console.log(`Token (first 20 chars): ${APIFY_TOKEN ? APIFY_TOKEN.substring(0, 20) + '...' : 'N/A'}\n`);

if (!APIFY_TOKEN) {
  console.error('❌ APIFY_API_TOKEN not found in environment');
  process.exit(1);
}

const client = new ApifyClient({ token: APIFY_TOKEN });

async function testActor(actorId, input, storeName) {
  console.log(`\n📦 Testing ${storeName} (${actorId})...`);

  try {
    console.log(`   Input:`, JSON.stringify(input));

    const run = await client.actor(actorId).call(input, {
      timeout: 60,
      memory: 256
    });

    console.log(`   ✅ Run completed: ${run.id}`);
    console.log(`   Status: ${run.status}`);
    console.log(`   Dataset ID: ${run.defaultDatasetId}`);

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`   ✅ Found ${items.length} products`);

    if (items.length > 0) {
      const firstItem = items[0];
      console.log(`\n   First product:`);
      console.log(`   - Name: ${firstItem.title || firstItem.name || firstItem.productName}`);
      console.log(`   - Price: ${firstItem.price || firstItem.currentPrice}`);
      console.log(`   - URL: ${firstItem.url || firstItem.productUrl}`);
    } else {
      console.log(`   ⚠️  No products returned`);
    }

    return { success: true, count: items.length };

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    if (error.statusCode) {
      console.error(`   Status code: ${error.statusCode}`);
    }
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════');

  // Test 1: Tesco
  const tescoResult = await testActor(
    'jupri/tesco-grocery',
    {
      keyword: 'milk',
      max_items: 5,
      max_pages: 1
    },
    'Tesco'
  );

  // Test 2: Sainsbury's
  const sainsburysResult = await testActor(
    'natanielsantos/sainsbury-s-scraper',
    {
      search: 'milk',
      maxItems: 5
    },
    "Sainsbury's"
  );

  // Test 3: Waitrose
  const waitroseResult = await testActor(
    'thenetaji/waitrose-scraper',
    {
      search: 'milk',
      maxProducts: 5
    },
    'Waitrose'
  );

  console.log('\n═══════════════════════════════════════════════════');
  console.log('\n📊 SUMMARY:');
  console.log(`   Tesco: ${tescoResult.success ? `✅ ${tescoResult.count} products` : `❌ ${tescoResult.error}`}`);
  console.log(`   Sainsbury's: ${sainsburysResult.success ? `✅ ${sainsburysResult.count} products` : `❌ ${sainsburysResult.error}`}`);
  console.log(`   Waitrose: ${waitroseResult.success ? `✅ ${waitroseResult.count} products` : `❌ ${waitroseResult.error}`}`);

  const allSuccess = tescoResult.success && sainsburysResult.success && waitroseResult.success;

  if (allSuccess) {
    console.log('\n✅ ALL TESTS PASSED - Apify integration is working!');
  } else {
    console.log('\n❌ SOME TESTS FAILED - Check errors above');
  }
}

main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
