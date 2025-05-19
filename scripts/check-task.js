require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

// Check tasks for a specific lead
async function checkTasks() {
  try {
    const apiKey = process.env.CLOSE_CRM_API_KEY;
    const leadId = 'lead_unQzD7r5xAzs9ennwlGBmowWFcbNFpnA5Zeni2yDMPS'; // BishopTech.dev
    
    if (!apiKey) {
      console.error('Error: CLOSE_CRM_API_KEY not found in environment variables');
      process.exit(1);
    }
    
    // Create client with authorization header
    const client = axios.create({
      baseURL: 'https://api.close.com/api/v1',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`
      }
    });
    
    // Get tasks for lead
    console.log(`Checking tasks for lead ID: ${leadId}`);
    const response = await client.get('/task', {
      params: {
        lead_id: leadId
      }
    });
    
    if (response.data.data.length === 0) {
      console.log('No tasks found for this lead.');
    } else {
      console.log(`Found ${response.data.data.length} tasks:`);
      
      // Sort tasks by creation date, newest first
      const sortedTasks = response.data.data.sort((a, b) => 
        new Date(b.date_created) - new Date(a.date_created)
      );
      
      sortedTasks.forEach((task, index) => {
        console.log(`\nTask ${index + 1}:`);
        console.log(`ID: ${task.id}`);
        console.log(`Text: ${task.text}`);
        console.log(`Status: ${task.is_complete ? 'Complete' : 'Incomplete'}`);
        console.log(`Due Date: ${task.due_date || 'Not set'}`);
        console.log(`Created: ${new Date(task.date_created).toLocaleString()}`);
      });
      
      // Look specifically for our task
      console.log('\nLooking for "Create Audit and schedule meeting" task:');
      const auditTask = sortedTasks.find(task => 
        task.text.includes('Create Audit and schedule meeting')
      );
      
      if (auditTask) {
        console.log('✅ Found the task!');
        console.log(`ID: ${auditTask.id}`);
        console.log(`Text: ${auditTask.text}`);
        console.log(`Created: ${new Date(auditTask.date_created).toLocaleString()}`);
      } else {
        console.log('❌ The specific task was not found.');
      }
    }
    
  } catch (error) {
    console.error('Error:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

checkTasks(); 