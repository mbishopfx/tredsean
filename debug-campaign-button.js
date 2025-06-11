// Debug script for Launch Campaign Button
// Paste this into browser console on the campaign page

console.log('🔍 DEBUGGING LAUNCH CAMPAIGN BUTTON');
console.log('=====================================');

// Check if we're in the Advanced Message Sender component
const launchButton = document.querySelector('button:has(span:contains("Launch Campaign"))') || 
                    Array.from(document.querySelectorAll('button')).find(btn => 
                      btn.textContent.includes('Launch Campaign')
                    );

if (launchButton) {
  console.log('✅ Found Launch Campaign button');
  console.log('📊 Button disabled:', launchButton.disabled);
  console.log('🎨 Button classes:', launchButton.className);
  
  // Check what's displayed for contact count
  const contactCountElement = document.querySelector('p:contains("Ready to send to")') ||
                             Array.from(document.querySelectorAll('p')).find(p => 
                               p.textContent.includes('Ready to send to')
                             );
  
  if (contactCountElement) {
    console.log('📞 Contact count text:', contactCountElement.textContent);
  }
  
  // Check message textarea
  const messageTextarea = document.querySelector('textarea[placeholder*="personalized message"]') ||
                         document.querySelector('textarea');
  
  if (messageTextarea) {
    console.log('💬 Message text length:', messageTextarea.value.length);
    console.log('💬 Message text (first 50 chars):', messageTextarea.value.substring(0, 50));
    console.log('💬 Message text trimmed length:', messageTextarea.value.trim().length);
  }
  
  // Check for file upload status
  const fileStatus = document.querySelector('div:contains("contacts)")') ||
                    Array.from(document.querySelectorAll('div')).find(div => 
                      div.textContent.includes('contacts)')
                    );
  
  if (fileStatus) {
    console.log('📁 File upload status:', fileStatus.textContent);
  }
  
  console.log('\n🚨 BUTTON DISABLED CONDITIONS:');
  console.log('1. isSending: Check if any loading/sending animations are visible');
  console.log('2. !messageText.trim(): Message textarea is empty or whitespace only');
  console.log('3. phoneNumbers.length === 0: No contacts loaded from CSV');
  
  console.log('\n🔧 TROUBLESHOOTING STEPS:');
  console.log('1. Type a message in the textarea');
  console.log('2. Upload and process a CSV file');
  console.log('3. Wait for any loading states to complete');
  console.log('4. Check that contact count shows > 0 contacts');
  
} else {
  console.log('❌ Launch Campaign button not found');
  console.log('💡 Make sure you are on the Advanced Message Sender tab');
}

// Additional checks for React component state (if accessible)
console.log('\n🔍 ADDITIONAL DEBUGGING:');
console.log('Check these values in React DevTools:');
console.log('- phoneNumbers.length');
console.log('- messageText.trim()');
console.log('- isSending'); 