// Shared storage for SMS Gateway conversations
// In production, this would be replaced with a database

import fs from 'fs';
import path from 'path';

export interface SMSGatewayMessage {
  id: string;
  phoneNumber: string;
  message: string;
  direction: 'inbound' | 'outbound';
  status: string;
  timestamp: string;
  endpoint?: string;
  response?: string;
}

// File-based storage for development (replace with database in production)
const STORAGE_FILE = path.join(process.cwd(), '.sms-gateway-storage.json');

// In-memory cache
let smsGatewayConversations: SMSGatewayMessage[] = [];
let isLoaded = false;

function loadConversations() {
  if (isLoaded) return;
  
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      smsGatewayConversations = JSON.parse(data);
      console.log(`📂 Loaded ${smsGatewayConversations.length} SMS Gateway conversations from storage`);
    }
  } catch (error) {
    console.log('⚠️ Could not load SMS Gateway storage file, starting fresh');
    smsGatewayConversations = [];
  }
  
  isLoaded = true;
}

function saveConversations() {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(smsGatewayConversations, null, 2));
  } catch (error) {
    console.error('❌ Failed to save SMS Gateway conversations to file:', error);
  }
}

export function addSMSGatewayMessage(message: Omit<SMSGatewayMessage, 'id' | 'timestamp'>) {
  loadConversations();
  
  const conversation: SMSGatewayMessage = {
    id: `sms_gateway_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...message
  };

  smsGatewayConversations.push(conversation);

  // Keep only last 1000 messages to prevent file from getting too large
  if (smsGatewayConversations.length > 1000) {
    smsGatewayConversations = smsGatewayConversations.slice(-1000);
  }
  
  saveConversations();

  console.log('💾 Saved SMS Gateway conversation:', {
    phoneNumber: message.phoneNumber,
    direction: message.direction,
    messagePreview: message.message.substring(0, 50) + '...'
  });

  return conversation;
}

export function getSMSGatewayConversations() {
  loadConversations();
  return smsGatewayConversations;
}

export function getSMSGatewayMessages(phoneNumber: string) {
  loadConversations();
  
  const filteredMessages = smsGatewayConversations
    .filter(conv => conv.phoneNumber === phoneNumber);
  
  return filteredMessages
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(conv => ({
      sid: conv.id,
      body: conv.message,
      from: conv.direction === 'outbound' ? 'SMS Gateway' : conv.phoneNumber,
      to: conv.direction === 'outbound' ? conv.phoneNumber : 'SMS Gateway',
      direction: conv.direction,
      status: conv.status,
      dateCreated: conv.timestamp,
      provider: 'sms_gateway'
    }));
}

export function formatConversationsForAPI() {
  loadConversations();
  
  // Get unique phone numbers and their latest conversations
  const conversationsByPhone = new Map<string, any>();
  
  // Group conversations by phone number
  smsGatewayConversations.forEach(conv => {
    if (!conversationsByPhone.has(conv.phoneNumber)) {
      conversationsByPhone.set(conv.phoneNumber, {
        phoneNumber: conv.phoneNumber,
        messages: [],
        lastMessage: null,
        lastTimestamp: null
      });
    }
    
    const phoneConv = conversationsByPhone.get(conv.phoneNumber);
    phoneConv.messages.push(conv);
    
    // Update last message info
    if (!phoneConv.lastTimestamp || conv.timestamp > phoneConv.lastTimestamp) {
      phoneConv.lastMessage = conv.message;
      phoneConv.lastTimestamp = conv.timestamp;
    }
  });

  // Convert to array format similar to Twilio conversations
  const conversations = Array.from(conversationsByPhone.values()).map(conv => ({
    sid: `sms_gateway_${conv.phoneNumber}`,
    friendlyName: `SMS Gateway - ${conv.phoneNumber}`,
    participants: [{ identity: conv.phoneNumber }],
    lastMessage: conv.lastMessage,
    dateUpdated: conv.lastTimestamp,
    provider: 'sms_gateway',
    messageCount: conv.messages.length,
    phoneNumber: conv.phoneNumber,
    lastMessageDirection: conv.messages[conv.messages.length - 1]?.direction || 'outbound',
    lastMessageDate: conv.lastTimestamp,
    lastMessageText: conv.lastMessage,
    unreadCount: 0 // For now, assume all messages are read
  }));

  // Sort by last updated (most recent first)
  conversations.sort((a, b) => new Date(b.dateUpdated || '').getTime() - new Date(a.dateUpdated || '').getTime());

  return conversations;
} 