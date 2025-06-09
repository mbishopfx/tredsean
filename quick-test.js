#!/usr/bin/env node

// Quick Test Script for TRD System
// Tests the GBP audit tool with JR's Auto Spa

console.log('🚀 TRD System Quick Test');
console.log('========================');

// Test the GBP professional audit API
async function testGBPAudit() {
  try {
    console.log('\n🏢 Testing GBP Professional Audit with JR\'s Auto Spa...');
    
    const response = await fetch('http://localhost:3000/api/gbp/professional-audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: "http://www.jrsautospanb.com"
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ GBP Professional Audit API Success!');
      console.log(`🏢 Business: ${data.businessName}`);
      console.log(`📊 Overall Score: ${data.overallScore}/100`);
      console.log(`📝 Listing Completeness: ${data.listingCompletenessScore}/100`);
      console.log(`🎯 Content Alignment: ${data.contentAlignmentScore}/100`);
      console.log(`🔍 Local SEO Readiness: ${data.localSeoReadinessScore}/100`);
      console.log(`📄 Audit ID: ${data.auditId}`);
      console.log(`⏰ Timestamp: ${data.timestamp}`);
      console.log(`📈 Analysis: ${data.analysisSummary.substring(0, 100)}...`);
    } else {
      console.log('❌ GBP Professional Audit API Failed:');
      console.log(data.error);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

// Test the SEO audit API
async function testSEOAudit() {
  try {
    console.log('\n🔍 Testing SEO Audit with JR\'s Auto Spa website...');
    
    const response = await fetch('http://localhost:3000/api/seo/instant-audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: "http://www.jrsautospanb.com/ - JR's Auto Spa - Auto detailing, ceramic coating, window tinting in Milltown, NJ"
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SEO Audit API Success!');
      console.log(`📊 Overall Score: ${data.overallScore}/100`);
      console.log(`🏢 Business: ${data.businessName}`);
      console.log(`📈 On-Page SEO: ${data.scores.onPage}/100`);
      console.log(`⚙️ Technical SEO: ${data.scores.technicalSEO}/100`);
      console.log(`📍 Local SEO: ${data.scores.localSEO}/100`);
      console.log(`📊 GBP Optimization: ${data.scores.gbpOptimization}/100`);
    } else {
      console.log('❌ SEO Audit API Failed:');
      console.log(data.error);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('Starting tests...\n');
  
  await testGBPAudit();
  await testSEOAudit();
  
  console.log('\n🎯 Test Instructions:');
  console.log('====================');
  console.log('1. Navigate to http://localhost:3000');
  console.log('2. Login with different user types:');
  console.log('   - Admin: Matttrd / admin123');
  console.log('   - Admin: Jontrd / admin123');
  console.log('   - Regular: TestUser / test123');
  console.log('3. Test Stats access (should be denied for regular users)');
  console.log('4. Test Home feed posting (should be restricted to admins)');
  console.log('5. Test NEW GBP Audit Tool (separate tab now!)');
  console.log('6. Test AI SEO audit tools with JR\'s Auto Spa data');
  console.log('7. Verify 45-second AI feed refresh works');
  console.log('8. Check that AI content is educational, not fake stories');
  
  console.log('\n✨ Test Complete!');
  console.log('\n🏢 NEW FEATURES:');
  console.log('• GBP Audit Tool is now a separate professional tab');
  console.log('• Removed from AI Tools (cleaner separation)');
  console.log('• Website scraping and OpenAI analysis');
  console.log('• Professional audit reports with scoring');
}

// Check if we're running from command line
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}

module.exports = { testGBPAudit, testSEOAudit }; 