import { NextRequest, NextResponse } from 'next/server';

interface MessageTemplate {
  day: number;
  message: string;
  active: boolean;
}

interface Contact {
  name: string;
  phone: string;
  company?: string;
  email?: string;
  location?: string;
  [key: string]: any;
}

interface CreateCampaignRequest {
  name: string;
  messageTemplates: MessageTemplate[];
  contacts: Contact[];
  variables: string[];
}

// Mock function to generate campaign ID
const generateCampaignId = () => `camp_${Date.now()}`;

// Mock function to schedule messages (in production, this would use a job queue)
const scheduleDripMessages = async (campaignId: string, messageTemplates: MessageTemplate[], contacts: Contact[]) => {
  console.log(`Scheduling ${messageTemplates.length} message templates for ${contacts.length} contacts in campaign ${campaignId}`);
  
  // In a real implementation, you would:
  // 1. Store campaign data in database
  // 2. Schedule messages using a job queue (like Bull, Agenda, or cloud functions)
  // 3. Set up reply tracking webhooks
  // 4. Initialize campaign statistics
  
  const schedulePromises = contacts.map(contact => {
    return messageTemplates.map(template => {
      const sendDate = new Date();
      sendDate.setDate(sendDate.getDate() + template.day);
      
      return {
        campaignId,
        contactId: contact.phone,
        contactName: contact.name,
        messageTemplate: template,
        scheduledFor: sendDate.toISOString(),
        status: 'scheduled'
      };
    });
  }).flat();
  
  console.log(`Created ${schedulePromises.length} scheduled messages`);
  return schedulePromises;
};

export async function POST(request: NextRequest) {
  try {
    const data: CreateCampaignRequest = await request.json();
    
    // Validate required fields
    if (!data.name || !data.messageTemplates || !data.contacts) {
      return NextResponse.json(
        { error: 'Missing required fields: name, messageTemplates, or contacts' },
        { status: 400 }
      );
    }
    
    if (data.contacts.length === 0) {
      return NextResponse.json(
        { error: 'At least one contact is required' },
        { status: 400 }
      );
    }
    
    if (data.messageTemplates.length === 0) {
      return NextResponse.json(
        { error: 'At least one message template is required' },
        { status: 400 }
      );
    }
    
    // Validate contacts have required phone numbers
    const invalidContacts = data.contacts.filter(contact => !contact.phone || contact.phone.trim() === '');
    if (invalidContacts.length > 0) {
      return NextResponse.json(
        { error: `${invalidContacts.length} contacts are missing phone numbers` },
        { status: 400 }
      );
    }
    
    // Generate campaign ID
    const campaignId = generateCampaignId();
    
    // Create campaign object
    const campaign = {
      id: campaignId,
      name: data.name,
      status: 'active',
      totalContacts: data.contacts.length,
      messageTemplates: data.messageTemplates,
      contacts: data.contacts,
      variables: data.variables || [],
      created: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      sentMessages: 0,
      replies: 0,
      deliveredMessages: 0,
      failedMessages: 0
    };
    
    // Schedule drip messages
    try {
      const scheduledMessages = await scheduleDripMessages(
        campaignId, 
        data.messageTemplates.filter(t => t.active), 
        data.contacts
      );
      
      console.log(`Campaign ${campaignId} created with ${scheduledMessages.length} scheduled messages`);
      
      // In production, you would:
      // 1. Save campaign to database
      // 2. Save scheduled messages to job queue
      // 3. Set up monitoring and webhooks
      
      return NextResponse.json({
        success: true,
        message: 'Drip campaign created successfully',
        campaign: {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          totalContacts: campaign.totalContacts,
          scheduledMessages: scheduledMessages.length
        }
      });
      
    } catch (scheduleError) {
      console.error('Error scheduling messages:', scheduleError);
      return NextResponse.json(
        { error: 'Campaign created but failed to schedule messages' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error creating drip campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create drip campaign' },
      { status: 500 }
    );
  }
} 