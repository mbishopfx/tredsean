// Test script to verify CSV parsing fix
const fs = require('fs');

// Test the CSV parsing logic with the problematic CSV
function testCSVParsing() {
  console.log('🧪 Testing CSV Parsing Fix\n');
  
  try {
    // Read the CSV file
    const csvContent = fs.readFileSync('scripts/cleaned_apollo-contacts-export (23).csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      console.log('❌ No data found in CSV');
      return;
    }
    
    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('📋 Headers:', headers);
    console.log('📍 Phone column index:', headers.indexOf('phone'));
    console.log('📍 Phone_type column index:', headers.indexOf('phone_type'));
    console.log();
    
    // Test the first few contacts
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const contact = { phone: '' };
      
      console.log(`👤 Contact ${i}:`);
      
      headers.forEach((header, index) => {
        if (values[index]) {
          const key = header.toLowerCase().replace(/\s+/g, '_');
          contact[key] = values[index];
          
          // OLD LOGIC (BROKEN)
          if ((key.includes('phone') || key.includes('mobile') || key.includes('cell')) && values[index]) {
            console.log(`  🔍 OLD LOGIC - Found phone match: ${key} = ${values[index]}`);
          }
          
          // NEW LOGIC (FIXED)
          if (key === 'phone' || key === 'mobile' || key === 'cell' || key === 'phone_number' || key === 'mobile_phone' || key === 'cell_phone') {
            contact.phone = values[index];
            console.log(`  ✅ NEW LOGIC - Phone set to: ${values[index]}`);
          }
        }
      });
      
      console.log(`  📞 Final phone value: ${contact.phone}`);
      console.log(`  📧 Email: ${contact.email}`);
      console.log(`  🏢 Company: ${contact.company}`);
      console.log();
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCSVParsing(); 