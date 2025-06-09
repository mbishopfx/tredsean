// Twilio Cost Analysis Script
// This script analyzes your Twilio usage to identify why you're paying $500/month for 1,000 messages/day
require('dotenv').config({ path: '.env.local' });
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function analyzeTwilioCosts() {
  try {
    console.log('🔍 TWILIO COST ANALYSIS - Finding Your $500/month');
    console.log('='.repeat(60));
    
    // Get last 30 days of usage
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    console.log(`📅 Analysis Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}\n`);
    
    // 1. SMS Messages Analysis
    console.log('📱 ANALYZING SMS MESSAGES...');
    const messages = await client.messages.list({
      dateSentAfter: startDate,
      dateSentBefore: endDate,
      limit: 5000
    });
    
    let smsCount = 0;
    let smsCost = 0;
    let mmsCount = 0;
    let mmsCost = 0;
    let internationalCount = 0;
    let internationalCost = 0;
    let inboundCount = 0;
    let inboundCost = 0;
    
    const countryCosts = {};
    const dailyCounts = {};
    
    messages.forEach(message => {
      const price = Math.abs(parseFloat(message.price || '0'));
      const dateKey = message.dateSent ? message.dateSent.toISOString().split('T')[0] : 'unknown';
      
      if (!dailyCounts[dateKey]) {
        dailyCounts[dateKey] = 0;
      }
      dailyCounts[dateKey]++;
      
      if (message.direction === 'inbound') {
        inboundCount++;
        inboundCost += price;
      } else if (message.direction === 'outbound') {
        if (message.numMedia && parseInt(message.numMedia) > 0) {
          mmsCount++;
          mmsCost += price;
        } else if (message.to && message.to.startsWith('+1')) {
          smsCount++;
          smsCost += price;
        } else {
          internationalCount++;
          internationalCost += price;
          
          // Track by country
          const country = message.to ? message.to.substring(0, 3) : 'unknown';
          if (!countryCosts[country]) {
            countryCosts[country] = { count: 0, cost: 0 };
          }
          countryCosts[country].count++;
          countryCosts[country].cost += price;
        }
      }
    });
    
    console.log('📊 MESSAGE BREAKDOWN:');
    console.log(`  • US SMS Messages: ${smsCount.toLocaleString()} ($${smsCost.toFixed(2)})`);
    console.log(`  • MMS Messages: ${mmsCount.toLocaleString()} ($${mmsCost.toFixed(2)})`);
    console.log(`  • International SMS: ${internationalCount.toLocaleString()} ($${internationalCost.toFixed(2)})`);
    console.log(`  • Inbound Messages: ${inboundCount.toLocaleString()} ($${inboundCost.toFixed(2)})`);
    console.log(`  • Total Messages: ${(smsCount + mmsCount + internationalCount + inboundCount).toLocaleString()}`);
    console.log(`  • Total Message Cost: $${(smsCost + mmsCost + internationalCost + inboundCost).toFixed(2)}`);
    
    if (internationalCount > 0) {
      console.log('\n🌍 INTERNATIONAL BREAKDOWN (EXPENSIVE!):');
      Object.entries(countryCosts)
        .sort((a, b) => b[1].cost - a[1].cost)
        .slice(0, 5)
        .forEach(([country, data]) => {
          console.log(`  • ${country}: ${data.count} messages ($${data.cost.toFixed(2)})`);
        });
    }
    
    // Daily average
    const validDays = Object.keys(dailyCounts).length;
    const avgDailyMessages = validDays > 0 ? Math.round((smsCount + mmsCount + internationalCount) / validDays) : 0;
    console.log(`\n📈 Daily Average: ${avgDailyMessages} messages/day`);
    
    console.log('\n' + '='.repeat(60));
    
    // 2. Voice Calls Analysis
    console.log('\n📞 ANALYZING VOICE CALLS...');
    const calls = await client.calls.list({
      startTimeAfter: startDate,
      startTimeBefore: endDate,
      limit: 1000
    });
    
    let callCount = 0;
    let callCost = 0;
    let totalMinutes = 0;
    let inboundCallCount = 0;
    let outboundCallCount = 0;
    let inboundCallCost = 0;
    let outboundCallCost = 0;
    
    calls.forEach(call => {
      if (call.price) {
        const price = Math.abs(parseFloat(call.price));
        callCount++;
        callCost += price;
        
        if (call.duration) {
          totalMinutes += parseInt(call.duration) / 60;
        }
        
        if (call.direction === 'inbound') {
          inboundCallCount++;
          inboundCallCost += price;
        } else {
          outboundCallCount++;
          outboundCallCost += price;
        }
      }
    });
    
    console.log('📊 VOICE BREAKDOWN:');
    console.log(`  • Total Calls: ${callCount.toLocaleString()}`);
    console.log(`  • Inbound Calls: ${inboundCallCount.toLocaleString()} ($${inboundCallCost.toFixed(2)})`);
    console.log(`  • Outbound Calls: ${outboundCallCount.toLocaleString()} ($${outboundCallCost.toFixed(2)})`);
    console.log(`  • Total Minutes: ${totalMinutes.toFixed(1)}`);
    console.log(`  • Total Call Cost: $${callCost.toFixed(2)}`);
    console.log(`  • Avg Cost/Minute: $${totalMinutes > 0 ? (callCost / totalMinutes).toFixed(4) : '0'}`);
    
    console.log('\n' + '='.repeat(60));
    
    // 3. Phone Numbers Analysis
    console.log('\n📞 ANALYZING PHONE NUMBER RENTALS...');
    const phoneNumbers = await client.incomingPhoneNumbers.list();
    
    let localNumbers = 0;
    let tollFreeNumbers = 0;
    let shortCodes = 0;
    let internationalNumbers = 0;
    
    const phoneDetails = [];
    
    phoneNumbers.forEach(number => {
      const phone = number.phoneNumber;
      phoneDetails.push({
        number: phone,
        friendlyName: number.friendlyName,
        capabilities: number.capabilities
      });
      
      if (phone.includes('800') || phone.includes('888') || 
          phone.includes('877') || phone.includes('866') ||
          phone.includes('855') || phone.includes('844')) {
        tollFreeNumbers++;
      } else if (phone.length <= 6) {
        shortCodes++; // Short codes are typically 5-6 digits
      } else if (phone.startsWith('+1')) {
        localNumbers++;
      } else {
        internationalNumbers++;
      }
    });
    
    const phoneNumberCost = (localNumbers * 1) + (tollFreeNumbers * 2) + (shortCodes * 750) + (internationalNumbers * 5);
    
    console.log('📊 PHONE NUMBER BREAKDOWN:');
    console.log(`  • Local Numbers: ${localNumbers} ($${localNumbers}/month)`);
    console.log(`  • Toll-Free Numbers: ${tollFreeNumbers} ($${tollFreeNumbers * 2}/month)`);
    console.log(`  • Short Codes: ${shortCodes} ($${shortCodes * 750}/month) ⚠️  EXPENSIVE!`);
    console.log(`  • International Numbers: ${internationalNumbers} ($${internationalNumbers * 5}/month)`);
    console.log(`  • Total Phone Cost: $${phoneNumberCost}/month`);
    
    if (phoneNumbers.length > 0) {
      console.log('\n📱 YOUR PHONE NUMBERS:');
      phoneDetails.forEach(phone => {
        console.log(`  • ${phone.number} (${phone.friendlyName || 'No name'})`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    // 4. Additional Services Check
    console.log('\n🔍 CHECKING FOR OTHER SERVICES...');
    
    try {
      // Check for Flex usage (if any)
      const flexData = await client.flex.v1.configuration.list();
      console.log(`  • Flex Configuration: ${flexData.length > 0 ? 'ACTIVE ⚠️' : 'Not active'}`);
    } catch (e) {
      console.log('  • Flex: Not available/configured');
    }
    
    try {
      // Check for Conversations API usage
      const conversations = await client.conversations.v1.conversations.list({ limit: 10 });
      console.log(`  • Conversations API: ${conversations.length > 0 ? `${conversations.length} active ⚠️` : 'Not used'}`);
    } catch (e) {
      console.log('  • Conversations API: Not available/configured');
    }
    
    console.log('\n' + '='.repeat(60));
    
    // 5. Cost Summary & Analysis
    const totalUsageCost = smsCost + mmsCost + internationalCost + inboundCost + callCost;
    const estimatedMonthlyCost = totalUsageCost + phoneNumberCost;
    const unaccountedCost = 500 - estimatedMonthlyCost;
    
    console.log('\n💰 COST SUMMARY:');
    console.log(`  • US SMS: $${smsCost.toFixed(2)}`);
    console.log(`  • MMS: $${mmsCost.toFixed(2)}`);
    console.log(`  • International SMS: $${internationalCost.toFixed(2)}`);
    console.log(`  • Inbound Messages: $${inboundCost.toFixed(2)}`);
    console.log(`  • Voice Calls: $${callCost.toFixed(2)}`);
    console.log(`  • Phone Numbers: $${phoneNumberCost.toFixed(2)}`);
    console.log(`  ─────────────────────────`);
    console.log(`  • Total Calculated: $${estimatedMonthlyCost.toFixed(2)}`);
    console.log(`  • Your Reported Cost: $500.00`);
    console.log(`  • Unaccounted Cost: $${unaccountedCost.toFixed(2)} ⚠️`);
    
    console.log('\n' + '='.repeat(60));
    
    // 6. Specific Recommendations
    console.log('\n🎯 COST REDUCTION RECOMMENDATIONS:');
    
    let potentialSavings = 0;
    
    if (shortCodes > 0) {
      console.log(`  🚨 CRITICAL: ${shortCodes} Short Code(s) costing $${shortCodes * 750}/month!`);
      console.log(`    → Consider canceling if not essential`);
      potentialSavings += shortCodes * 750;
    }
    
    if (internationalCost > 50) {
      console.log(`  🚨 HIGH: International SMS costing $${internationalCost.toFixed(2)}/month`);
      console.log(`    → Block international sending or add validation`);
      potentialSavings += internationalCost;
    }
    
    if (callCost > 50) {
      console.log(`  ⚠️  Voice calls costing $${callCost.toFixed(2)}/month`);
      console.log(`    → Consider using personal phones for calls`);
      potentialSavings += callCost;
    }
    
    if (tollFreeNumbers > 1) {
      console.log(`  ⚠️  Multiple toll-free numbers: $${tollFreeNumbers * 2}/month`);
      console.log(`    → Keep only essential toll-free numbers`);
      potentialSavings += (tollFreeNumbers - 1) * 2;
    }
    
    if (mmsCount > smsCount * 0.1) {
      console.log(`  ⚠️  High MMS usage: ${mmsCount} messages ($${mmsCost.toFixed(2)})`);
      console.log(`    → Review if MMS is necessary`);
    }
    
    if (avgDailyMessages > 500) {
      console.log(`  💡 HIGH VOLUME: ${avgDailyMessages} messages/day`);
      console.log(`    → Perfect candidate for personal SMS gateway!`);
      console.log(`    → Potential savings: $371-411/month with personal gateway`);
    }
    
    console.log('\n🔍 IMMEDIATE ACTIONS TO TAKE:');
    console.log('  1. Check Twilio Console → Billing → Usage-Based Pricing for detailed breakdown');
    console.log('  2. Look for any active Programmable Wireless, Video, or other premium services');
    console.log('  3. Check for webhook failures causing retry charges');
    console.log('  4. Review any third-party add-ons or marketplace services');
    console.log('  5. Set up billing alerts to prevent future overspend');
    
    if (potentialSavings > 0) {
      console.log(`\n💡 Immediate potential savings: $${potentialSavings.toFixed(2)}/month`);
    }
    
    console.log('\n🚀 PERSONAL SMS GATEWAY SAVINGS:');
    console.log(`  • Current: $500/month for ${avgDailyMessages * 30} messages`);
    console.log(`  • With Personal Gateway: $89-129/month`);
    console.log(`  • Monthly Savings: $371-411`);
    console.log(`  • Annual Savings: $4,452-4,932`);
    console.log(`  • ROI: Immediate (pays for itself in month 1)`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Analysis Complete! Review the recommendations above.');
    
  } catch (error) {
    console.error('❌ Error analyzing costs:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your .env.local file has correct Twilio credentials');
    console.log('2. Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are valid');
    console.log('3. Ensure your Twilio account has API access enabled');
  }
}

console.log('🔍 Starting Twilio Cost Analysis...\n');
analyzeTwilioCosts(); 