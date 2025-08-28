#!/usr/bin/env node
import dotenv from 'dotenv';
import { apiTool } from './tools/bigcommerce/res-tful-api-basics-blueprint/get-current-customers.js';

// Load environment variables
dotenv.config();

const testCurrentCustomers = async () => {
  console.log('🧪 Testing get_current_customers tool');
  console.log('='.repeat(40));
  
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH;
  const apiKey = process.env.BIGCOMMERCE_API_KEY;
  
  console.log(`Store Hash: ${storeHash}`);
  console.log(`API Key: ${apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET'}`);
  console.log();

  // Test data for creating a customer
  const testCustomerData = {
    email: "test@example.com",
    first_name: "Test",
    last_name: "Customer",
    phone: "1234567890",
    company: "Test Company"
  };

  console.log('📤 Test Customer Data:');
  console.log(JSON.stringify(testCustomerData, null, 2));
  console.log();

  try {
    console.log('🚀 Executing get_current_customers tool...');
    const result = await apiTool.function({
      store_Hash: storeHash,
      customerData: testCustomerData
    });

    console.log('📥 Result:');
    console.log(JSON.stringify(result, null, 2));

    if (result.error) {
      console.log('❌ Tool returned an error');
    } else {
      console.log('✅ Tool executed successfully');
    }

  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
};

// Run the test
testCurrentCustomers();
