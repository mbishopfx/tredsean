import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

interface ScheduledMessage {
  id: string;
  campaignId: string;
  contactPhone: string;
  contactName: string;
  messageText: string;
  templateDay: number;
  scheduledFor: string;
  status: 'scheduled' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  twilioSid?: string;
  error?: string;
}

// File paths for persistent storage
const CAMPAIGNS_FILE = path.join(process.cwd(), 'data', 'drip-campaigns.json');
const MESSAGES_FILE = path.join(process.cwd(), 'data', 'drip-messages.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Read/write campaigns to storage
const getCampaigns = () => {
  ensureDataDir();
  if (!fs.existsSync(CAMPAIGNS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(CAMPAIGNS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading campaigns:', error);
    return [];
  }
};

const saveCampaigns = (campaigns: any[]) => {
  ensureDataDir();
  try {
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2));
  } catch (error) {
    console.error('Error saving campaigns:', error);
    throw error;
  }
};

// Read/write scheduled messages
const getScheduledMessages = () => {
  ensureDataDir();
  if (!fs.existsSync(MESSAGES_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading scheduled messages:', error);
    return [];
  }
};

const saveScheduledMessages = (messages: ScheduledMessage[]) => {
  ensureDataDir();
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error('Error saving scheduled messages:', error);
    throw error;
  }
};

// Replace variables in message text
const replaceVariables = (messageText: string, contact: Contact): string => {
  let processedMessage = messageText;
  
  // Replace standard variables
  processedMessage = processedMessage.replace(/{name}/g, contact.name || "there");
  processedMessage = processedMessage.replace(/{company}/g, contact.company || "");
  processedMessage = processedMessage.replace(/{phone}/g, contact.phone || "");
  processedMessage = processedMessage.replace(/{email}/g, contact.email || "");
  processedMessage = processedMessage.replace(/{location}/g, contact.location || "");
  
  // Replace date/time variables
  processedMessage = processedMessage.replace(/{date}/g, new Date().toLocaleDateString());
  processedMessage = processedMessage.replace(/{time}/g, new Date().toLocaleTimeString());
  
  // Replace any custom variables from contact
  Object.keys(contact).forEach(key => {
    if (key !== 'name' && key !== 'phone' && key !== 'company' && key !== 'email' && key !== 'location') {
      const regex = new RegExp(`{${key}}`, 'g');
      processedMessage = processedMessage.replace(regex, contact[key] || "");
    }
  });
  
  return processedMessage;
};

// Generate campaign ID
const generateCampaignId = () => `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Generate message ID  
const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Schedule drip messages
const scheduleDripMessages = async (campaignId: string, messageTemplates: MessageTemplate[], contacts: Contact[]): Promise<ScheduledMessage[]> => {
  const scheduledMessages: ScheduledMessage[] = [];
  
  for (const contact of contacts) {
    for (const template of messageTemplates) {
      if (!template.active) continue;
      
      // Calculate send date
      const sendDate = new Date();
      sendDate.setDate(sendDate.getDate() + template.day);
      
      // Process message text with variables
      const personalizedMessage = replaceVariables(template.message, contact);
      
      const scheduledMessage: ScheduledMessage = {
        id: generateMessageId(),
        campaignId,
        contactPhone: contact.phone,
        contactName: contact.name,
        messageText: personalizedMessage,
        templateDay: template.day,
        scheduledFor: sendDate.toISOString(),
        status: 'scheduled'
      };
      
      scheduledMessages.push(scheduledMessage);
    }
  }
  
  return scheduledMessages;
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
    
    const activeTemplates = data.messageTemplates.filter(t => t.active && t.message.trim());
    if (activeTemplates.length === 0) {
      return NextResponse.json(
        { error: 'At least one active message template is required' },
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
      const scheduledMessages = await scheduleDripMessages(campaignId, activeTemplates, data.contacts);
      
      // Save campaign to storage
      const campaigns = getCampaigns();
      campaigns.push(campaign);
      saveCampaigns(campaigns);
      
      // Save scheduled messages to storage
      const existingMessages = getScheduledMessages();
      const allMessages = [...existingMessages, ...scheduledMessages];
      saveScheduledMessages(allMessages);
      
      console.log(`✅ Campaign ${campaignId} created successfully:`);
      console.log(`   - Name: ${campaign.name}`);
      console.log(`   - Contacts: ${campaign.totalContacts}`);
      console.log(`   - Scheduled Messages: ${scheduledMessages.length}`);
      console.log(`   - Active Templates: ${activeTemplates.length}`);
      
      return NextResponse.json({
        success: true,
        message: 'Drip campaign created successfully! Messages will be sent according to schedule.',
        campaign: {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          totalContacts: campaign.totalContacts,
          scheduledMessages: scheduledMessages.length,
          activeTemplates: activeTemplates.length,
          created: campaign.created
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