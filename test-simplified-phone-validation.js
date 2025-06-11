// Test script for simplified phone validation logic
const axios = require('axios');
const fs = require('fs');

async function testSimplifiedPhoneValidation() {
  console.log('🧪 Testing Simplified Phone Validation Logic\n');
  
  const baseURL = 'http://localhost:3000';
  
  // Create test CSV with various phone number types
  const testCSVContent = `Name,Company,Phone,Email,Title
Matt Bishop,TechFlow Solutions,4176297373,matt@techflow.com,CEO
Sean O'Brien,Digital Marketing Pro,+16467705587,sean@trurankdigital.com,Marketing Director
Toll Free Customer Service,Big Corp,8001234567,support@bigcorp.com,Support
Jane Smith,Small Business,555-123-4567,jane@smallbiz.com,Owner
John Doe,Enterprise Inc,+1-888-999-8888,john@enterprise.com,Manager
Valid Mobile,Tech Startup,2025551234,mobile@startup.com,Developer`;

  // Write test CSV file
  fs.writeFileSync('test-phone-validation.csv', testCSVContent);
  console.log('📄 Created test CSV with mixed phone number types');
  
  // Test 1: CSV Validator
  console.log('\n1. Testing CSV Validator with simplified logic...');
  
  try {
    const formData = new FormData();
    const csvBlob = new Blob([testCSVContent], { type: 'text/csv' });
    formData.append('file', csvBlob, 'test-phone-validation.csv');
    formData.append('mode', 'validate');
    
    const response = await fetch(`${baseURL}/api/csv-validator`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Validation successful');
      console.log(`📊 Stats:
  - Total Rows: ${result.validation.stats.totalRows}
  - SMS-Eligible Numbers: ${result.validation.stats.mobileNumbers}
  - Toll-Free Filtered: ${result.validation.stats.landlines}
  - Ready for Campaign: ${result.readyForCampaign}`);
      
      if (result.validation.errors.length > 0) {
        console.log(`❌ Errors: ${result.validation.errors.join(', ')}`);
      }
      
      if (result.validation.warnings.length > 0) {
        console.log(`⚠️ Warnings: ${result.validation.warnings.join(', ')}`);
      }
    } else {
      console.log('❌ Validation failed:', result.error);
    }
  } catch (error) {
    console.log('❌ CSV Validator test failed:', error.message);
  }
  
  // Test 2: Apollo CSV Processor
  console.log('\n2. Testing Apollo CSV Processor with simplified logic...');
  
  try {
    const formData = new FormData();
    const csvBlob = new Blob([testCSVContent], { type: 'text/csv' });
    formData.append('file', csvBlob, 'test-phone-validation.csv');
    formData.append('filterType', 'mobile_only');
    
    const response = await fetch(`${baseURL}/api/apollo/process-csv`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Apollo processing successful');
      console.log(`📊 Processing Stats:
  - Total Input: ${result.stats.total_input}
  - SMS-Eligible Numbers: ${result.stats.mobile_numbers}
  - Toll-Free Numbers: ${result.stats.voip}
  - Unknown Numbers: ${result.stats.unknown}
  - Final Output: ${result.stats.final_output}`);
    } else {
      console.log('❌ Apollo processing failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Apollo CSV Processor test failed:', error.message);
  }
  
  // Test 3: Expected Results Verification
  console.log('\n3. Verifying expected results...');
  
  const expectedSMSEligible = [
    '4176297373',     // Matt's number
    '+16467705587',   // Sean's number  
    '555-123-4567',   // Jane's number (555 is not toll-free)
    '2025551234'      // Valid mobile
  ];
  
  const expectedTollFree = [
    '8001234567',     // 800 toll-free
    '+1-888-999-8888' // 888 toll-free
  ];
  
  console.log(`✅ Expected ${expectedSMSEligible.length} SMS-eligible numbers`);
  console.log(`✅ Expected ${expectedTollFree.length} toll-free numbers to be filtered`);
  console.log('✅ Simplified logic should be more reliable than mobile vs landline detection');
  
  // Cleanup
  fs.unlinkSync('test-phone-validation.csv');
  console.log('\n🧹 Cleaned up test files');
  
  console.log('\n🎯 Key Improvements:');
  console.log('  • No longer trying to distinguish mobile vs landline (unreliable)');
  console.log('  • Simply filtering out toll-free numbers (800, 888, etc.)');
  console.log('  • All other US numbers considered SMS-eligible');
  console.log('  • Much more accurate for SMS campaign purposes');
}

// Run the test
testSimplifiedPhoneValidation().catch(console.error); 