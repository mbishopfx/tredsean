import axios from 'axios';

// Close CRM base URL
const CLOSECRM_BASE_URL = 'https://api.close.com/api/v1';

// Function to create axios client with auth
export const getCloseClient = () => {
  const apiKey = process.env.CLOSE_CRM_API_KEY;
  
  if (!apiKey) {
    throw new Error('Close CRM API key not configured');
  }
  
  return axios.create({
    baseURL: CLOSECRM_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`
    },
  });
};

// Function to format phone number for API queries (remove formatting)
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Strip all non-numeric characters except leading +
  return phoneNumber.replace(/[^\d+]/g, '');
};

// Function to update pipeline status (custom implementation)
export const updateLeadStatus = async (client: any, leadId: string, statusId: string) => {
  try {
    // First get the current lead data
    const leadResponse = await client.get(`/lead/${leadId}`);
    const lead = leadResponse.data;
    
    // Now create a custom update that only changes the status
    const updateData = {
      status_id: statusId
    };
    
    // Make the update request
    const response = await client.put(`/lead/${leadId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating lead status:', error);
    throw error;
  }
};

// Function to add tags to a lead
export const addTagsToLead = async (client: any, leadId: string, tags: string[]) => {
  try {
    // First get the current lead data to get existing tags
    const leadResponse = await client.get(`/lead/${leadId}/`);
    const lead = leadResponse.data;
    
    console.log('Current lead tags:', lead.tags);
    
    // Create a new array combining existing tags with new ones, removing duplicates
    const existingTags = Array.isArray(lead.tags) ? lead.tags : [];
    const uniqueTags = [...new Set([...existingTags, ...tags])];
    
    console.log('New unique tags to set:', uniqueTags);
    
    // Update the lead with the new tags (just sending the tags field)
    const updateResponse = await client.put(`/lead/${leadId}/`, {
      tags: uniqueTags
    });
    
    console.log('Tag update response status:', updateResponse.status);
    
    // Double-check the lead tags after update
    const verifyResponse = await client.get(`/lead/${leadId}/`);
    console.log('Tags after update:', verifyResponse.data.tags);
    
    return updateResponse.data;
  } catch (error: any) {
    console.error('Error adding tags to lead:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

// Error handling helper
export const handleCloseApiError = (error: any): { message: string; status: number } => {
  console.error('Close CRM API error:', error);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    return {
      message: error.response.data.error || 'Error from Close CRM API',
      status: error.response.status,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      message: 'No response received from Close CRM API',
      status: 500,
    };
  } else {
    // Something happened in setting up the request
    return {
      message: error.message || 'Error setting up request to Close CRM API',
      status: 500,
    };
  }
}; 