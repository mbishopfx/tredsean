require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

// Create client for Close CRM API
function createClient() {
  const apiKey = process.env.CLOSE_CRM_API_KEY;
  
  if (!apiKey) {
    console.error('Error: CLOSE_CRM_API_KEY not found in environment variables');
    process.exit(1);
  }
  
  return axios.create({
    baseURL: 'https://api.close.com/api/v1',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`
    }
  });
}

// Add tags to a lead
async function testAddTags() {
  try {
    const leadId = 'lead_unQzD7r5xAzs9ennwlGBmowWFcbNFpnA5Zeni2yDMPS'; // BishopTech.dev
    const client = createClient();
    
    console.log(`\n===== TESTING TAG ADDING =====`);
    console.log(`Adding tags to lead ID: ${leadId}`);
    
    // Step 1: Get current tags
    const leadResponse = await client.get(`/lead/${leadId}/`);
    const lead = leadResponse.data;
    
    console.log(`\nCurrent tags for ${lead.display_name}:`, lead.tags || 'None');
    
    // Step 2: Create new tag array
    const newTags = ['Interested', 'SMS-Lead', 'Test-Tag'];
    const existingTags = Array.isArray(lead.tags) ? lead.tags : [];
    const uniqueTags = [...new Set([...existingTags, ...newTags])];
    
    console.log(`\nAttempting to set tags:`, uniqueTags);
    
    // Step 3: Update the lead with new tags
    const updateResponse = await client.put(`/lead/${leadId}/`, {
      tags: uniqueTags
    });
    
    console.log(`\nUpdate response status:`, updateResponse.status);
    
    // Step 4: Verify tags were updated
    const verifyResponse = await client.get(`/lead/${leadId}/`);
    console.log(`\nTags after update:`, verifyResponse.data.tags || 'None');
    
    // Check if all tags were added
    const allTagsAdded = newTags.every(tag => 
      verifyResponse.data.tags && verifyResponse.data.tags.includes(tag)
    );
    
    console.log(`\nAll tags successfully added: ${allTagsAdded ? 'YES ✓' : 'NO ✗'}`);
    
    return allTagsAdded;
  } catch (error) {
    console.error('\nError adding tags:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
}

// Check tags for a specific lead
async function checkLeadTags() {
  try {
    const leadId = 'lead_unQzD7r5xAzs9ennwlGBmowWFcbNFpnA5Zeni2yDMPS'; // BishopTech.dev
    const client = createClient();
    
    // Get lead data
    console.log(`Checking lead ID: ${leadId}`);
    const response = await client.get(`/lead/${leadId}/`);
    const lead = response.data;
    
    console.log(`\nLead: ${lead.display_name} (${lead.id})`);
    
    // Check tags
    if (lead.tags && lead.tags.length > 0) {
      console.log(`\nTags: ${lead.tags.join(', ')}`);
    } else {
      console.log('\nNo tags found on this lead.');
    }
    
    // Check tasks
    const tasksResponse = await client.get('/task', {
      params: {
        lead_id: leadId
      }
    });
    
    if (tasksResponse.data.data.length > 0) {
      console.log(`\nTasks (${tasksResponse.data.data.length}):`);
      
      // Sort tasks by creation date, newest first
      const sortedTasks = tasksResponse.data.data.sort((a, b) => 
        new Date(b.date_created) - new Date(a.date_created)
      );
      
      sortedTasks.forEach((task, index) => {
        console.log(`\n${index + 1}. Task: ${task.text}`);
        console.log(`   Status: ${task.is_complete ? 'Complete' : 'Incomplete'}`);
        console.log(`   Due Date: ${task.due_date || 'Not set'}`);
        console.log(`   Created: ${new Date(task.date_created).toLocaleString()}`);
      });
    } else {
      console.log('\nNo tasks found for this lead.');
    }
    
  } catch (error) {
    console.error('Error:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Run the tests
async function runTests() {
  // First, check current state
  await checkLeadTags();
  
  // Then test adding tags
  const tagsAdded = await testAddTags();
  
  // Finally, check state after tag addition
  if (tagsAdded) {
    console.log("\n===== VERIFICATION =====");
    await checkLeadTags();
  }
}

runTests(); 