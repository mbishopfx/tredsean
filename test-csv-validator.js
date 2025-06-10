const fs = require('fs');
const path = require('path');

// Test the CSV validator with the existing Apollo CSV
async function testCSVValidator() {
  try {
    console.log('🧪 Testing CSV Validator with Apollo CSV...\n');
    
    // Read the Apollo CSV file
    const csvPath = path.join(__dirname, 'apollo-contacts-export (22).csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log('❌ Apollo CSV file not found. Please ensure apollo-contacts-export (22).csv exists.');
      return;
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    
    console.log(`📄 CSV File Analysis:`);
    console.log(`   • File size: ${(csvContent.length / 1024).toFixed(1)} KB`);
    console.log(`   • Total lines: ${lines.length}`);
    console.log(`   • Header: ${lines[0]}`);
    console.log(`   • Sample row: ${lines[1]}\n`);
    
    // Create FormData equivalent for testing
    const formData = new FormData();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'apollo-contacts-export (22).csv', { type: 'text/csv' });
    formData.append('file', file);
    formData.append('mode', 'validate');
    
    console.log('🔍 Validating CSV...');
    
    // Test validation
    const response = await fetch('http://localhost:3002/api/csv-validator', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      console.log(`❌ Validation failed: ${response.status}`);
      const errorText = await response.text();
      console.log(errorText);
      return;
    }
    
    const result = await response.json();
    
    console.log('✅ Validation completed!\n');
    
    // Display results
    console.log('📊 VALIDATION RESULTS:');
    console.log('═'.repeat(50));
    
    console.log(`\n🎯 Overall Status:`);
    console.log(`   • Valid: ${result.validation.isValid ? '✅' : '❌'}`);
    console.log(`   • Ready for campaigns: ${result.readyForCampaign ? '✅' : '❌'}`);
    
    console.log(`\n📈 Statistics:`);
    const stats = result.validation.stats;
    console.log(`   • Total rows: ${stats.totalRows}`);
    console.log(`   • Valid rows: ${stats.validRows}`);
    console.log(`   • Mobile numbers: ${stats.mobileNumbers}`);
    console.log(`   • Landlines: ${stats.landlines}`);
    console.log(`   • Companies found: ${stats.companiesFound}`);
    console.log(`   • Names found: ${stats.namesFound}`);
    console.log(`   • Emails found: ${stats.emailsFound}`);
    console.log(`   • Duplicate phones: ${stats.duplicatePhones}`);
    
    console.log(`\n📧 Available Variables (${stats.availableVariables.length}):`);
    stats.availableVariables.forEach(variable => {
      console.log(`   • {${variable}}`);
    });
    
    if (result.validation.errors.length > 0) {
      console.log(`\n🚨 Errors (${result.validation.errors.length}):`);
      result.validation.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    }
    
    if (result.validation.warnings.length > 0) {
      console.log(`\n⚠️  Warnings (${result.validation.warnings.length}):`);
      result.validation.warnings.forEach(warning => {
        console.log(`   • ${warning}`);
      });
    }
    
    if (result.validation.suggestions.length > 0) {
      console.log(`\n💡 Suggestions (${result.validation.suggestions.length}):`);
      result.validation.suggestions.forEach(suggestion => {
        console.log(`   • ${suggestion}`);
      });
    }
    
    // Test fixing if validation passed
    if (result.validation.isValid && stats.mobileNumbers > 0) {
      console.log('\n🔧 Testing CSV fixing...');
      
      const fixFormData = new FormData();
      fixFormData.append('file', file);
      fixFormData.append('mode', 'fix');
      
      const fixResponse = await fetch('http://localhost:3002/api/csv-validator', {
        method: 'POST',
        body: fixFormData,
      });
      
      if (fixResponse.ok) {
        const fixResult = await fixResponse.json();
        console.log('✅ CSV fixing completed!');
        
        if (fixResult.summary) {
          console.log('\n📋 Cleaning Summary:');
          console.log(`   • Original count: ${fixResult.summary.originalCount}`);
          console.log(`   • After cleaning: ${fixResult.summary.afterCleaning}`);
          console.log(`   • Removed: ${fixResult.summary.removed}`);
          console.log(`   • Ready for campaign: ${fixResult.summary.readyForCampaign ? '✅' : '❌'}`);
        }
        
        if (fixResult.cleanedCSV) {
          // Save cleaned CSV for inspection
          const cleanedPath = path.join(__dirname, 'cleaned_apollo_test.csv');
          fs.writeFileSync(cleanedPath, fixResult.cleanedCSV);
          console.log(`   • Cleaned CSV saved: ${cleanedPath}`);
          
          const cleanedLines = fixResult.cleanedCSV.split('\n');
          console.log(`   • Cleaned file lines: ${cleanedLines.length}`);
          console.log(`   • Headers: ${cleanedLines[0]}`);
        }
      } else {
        console.log('❌ CSV fixing failed');
      }
    }
    
    console.log('\n🎯 Example personalized message:');
    console.log('   Template: "Hi {name}! I noticed {company} could benefit from our digital marketing services. Most {industry} businesses in {city} are missing out on 300% more leads. Quick 15-min call this {current_month}?"');
    console.log('   Would become: "Hi John Smith! I noticed ABC Corp could benefit from our digital marketing services. Most Technology businesses in Austin are missing out on 300% more leads. Quick 15-min call this December?"');
    
    console.log('\n✅ CSV Validator test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Test with local parsing instead
    console.log('\n🔄 Attempting local CSV analysis...');
    try {
      const csvContent = fs.readFileSync('apollo-contacts-export (22).csv', 'utf8');
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      console.log('Local CSV Analysis:');
      console.log(`Headers found: ${headers.join(', ')}`);
      
      // Check for important fields
      const phoneFields = headers.filter(h => 
        h.toLowerCase().includes('phone') || 
        h.toLowerCase().includes('mobile') || 
        h.toLowerCase().includes('cell')
      );
      
      const nameFields = headers.filter(h => 
        h.toLowerCase().includes('name') || 
        h.toLowerCase().includes('contact')
      );
      
      const companyFields = headers.filter(h => 
        h.toLowerCase().includes('company') || 
        h.toLowerCase().includes('organization')
      );
      
      console.log(`Phone fields: ${phoneFields.join(', ')}`);
      console.log(`Name fields: ${nameFields.join(', ')}`);
      console.log(`Company fields: ${companyFields.join(', ')}`);
      
    } catch (localError) {
      console.error('Local analysis also failed:', localError.message);
    }
  }
}

// Run the test
testCSVValidator(); 