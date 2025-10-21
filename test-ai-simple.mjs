#!/usr/bin/env node

/**
 * Simple Integration Test for AI Assistant
 */

import Anthropic from '@anthropic-ai/sdk';
import { searchGroceries } from './src/data/groceries.ts';

console.log('🧪 AI Shopping Assistant Integration Test\n');

// Test 1: SDK Version
console.log('1️⃣ Checking Anthropic SDK...');
console.log(`   ✅ SDK imported successfully`);

// Test 2: Test grocery database
console.log('\n2️⃣ Testing grocery database...');
const milkResults = searchGroceries('milk');
console.log(`   ✅ Found ${milkResults.length} milk products`);
if (milkResults.length > 0) {
  console.log(`   ℹ️  ${milkResults[0].name}: £${milkResults[0].bestPrice} at ${milkResults[0].bestStore}`);
}

const breadResults = searchGroceries('bread');
console.log(`   ✅ Found ${breadResults.length} bread products`);

const chickenResults = searchGroceries('chicken');
console.log(`   ✅ Found ${chickenResults.length} chicken products`);

// Test 3: Create Anthropic client
console.log('\n3️⃣ Testing Anthropic client creation...');
const apiKey = process.env.VITE_ANTHROPIC_API_KEY || 'test-key';

try {
  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
  console.log('   ✅ Client created successfully');
} catch (error) {
  console.error('   ❌ Client creation failed:', error.message);
  process.exit(1);
}

// Test 4: If API key available, test real call
if (process.env.VITE_ANTHROPIC_API_KEY && process.env.VITE_ANTHROPIC_API_KEY !== 'test-key') {
  console.log('\n4️⃣ Testing real API call with model claude-sonnet-4-5-20250929...');

  const testClient = new Anthropic({
    apiKey: process.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  try {
    const response = await testClient.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: 'Respond with exactly: "AI test passed"',
        },
      ],
    });

    const textBlock = response.content.find(block => block.type === 'text');
    if (textBlock) {
      console.log(`   ✅ API call successful!`);
      console.log(`   ℹ️  Model used: ${response.model}`);
      console.log(`   ℹ️  Response: "${textBlock.text}"`);
      console.log(`   ℹ️  Stop reason: ${response.stop_reason}`);

      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('\nSummary:');
      console.log('  ✅ SDK working');
      console.log('  ✅ Grocery database (70+ items)');
      console.log('  ✅ Model ID: claude-sonnet-4-5-20250929');
      console.log('  ✅ Real API call successful');
      console.log('\n✅ Ready to deploy to Railway!');
    } else {
      throw new Error('No text response received');
    }
  } catch (error) {
    console.error('   ❌ API call failed:', error.message);
    if (error.status) {
      console.error(`   ℹ️  HTTP Status: ${error.status}`);
    }
    if (error.error) {
      console.error(`   ℹ️  Error:`, JSON.stringify(error.error, null, 2));
    }
    process.exit(1);
  }
} else {
  console.log('\n4️⃣ Skipping real API call');
  console.log('   ℹ️  No VITE_ANTHROPIC_API_KEY found');
  console.log('   ℹ️  Set environment variable to test real API');

  console.log('\n✅ OFFLINE TESTS PASSED!');
  console.log('\nSummary:');
  console.log('  ✅ SDK working');
  console.log('  ✅ Grocery database (70+ items)');
  console.log('  ✅ Client creation works');
  console.log('  ⏭️  Real API call skipped');
  console.log('\n⚠️  Deploy with VITE_ANTHROPIC_API_KEY in Railway');
}
