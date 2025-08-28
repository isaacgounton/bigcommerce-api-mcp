#!/usr/bin/env node
import dotenv from 'dotenv';
import { apiTool } from './tools/bigcommerce/res-tful-api-basics-blueprint/get-current-customers.js';

// Load environment variables
dotenv.config();

const testCurrentCustomersUpdated = async () => {
  console.log('🧪 Testing updated get_current_customers tool');
  console.log('='.repeat(50));
  
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH;
  console.log(`Store Hash: ${storeHash}`);
  console.log();

  try {
    console.log('🔍 Test 1: Get all customers (no filters)');
    const result1 = await apiTool.function({
      store_Hash: storeHash
    });

    if (result1.error) {
      console.log('❌ Error:', result1.error);
    } else {
      console.log('✅ Success! Found', result1.data?.length || 0, 'customers');
      if (result1.data && result1.data.length > 0) {
        console.log('📄 First customer:', {
          id: result1.data[0].id,
          email: result1.data[0].email,
          name: `${result1.data[0].first_name} ${result1.data[0].last_name}`
        });
      }
    }

    console.log();
    console.log('🔍 Test 2: Get customers with filters (limit 5)');
    const result2 = await apiTool.function({
      store_Hash: storeHash,
      filters: { limit: 5 }
    });

    if (result2.error) {
      console.log('❌ Error:', result2.error);
    } else {
      console.log('✅ Success! Found', result2.data?.length || 0, 'customers (limited to 5)');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testCurrentCustomersUpdated();
