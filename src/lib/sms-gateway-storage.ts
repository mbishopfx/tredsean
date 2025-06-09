// Shared storage for SMS Gateway conversations
// Uses Redis for production, file for development

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

// Redis storage for production (if KV is available)
let kv: any = null;

// Only try to import KV in production environment
if (process.env.NODE_ENV === 'production' && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  try {
    // Dynamic import to avoid compilation issues in development
    import('@vercel/kv').then(({ createClient }) => {
      kv = createClient({
        url: process.env.KV_REST_API_URL!,
        token: process.env.KV_REST_API_TOKEN!,
      });
      console.log('📡 Redis client initialized for production');
    }).catch(() => {
      console.log('📄 Redis not available, using file storage');
    });
  } catch (error) {
    console.log('📄 Redis not available, using file storage');
  }
}

// File-based storage for development
const STORAGE_FILE = path.join(process.cwd(), '.sms-gateway-storage.json');

// In-memory cache
let smsGatewayConversations: SMSGatewayMessage[] = [];
let isLoaded = false;

// Storage key for Redis
const REDIS_KEY = 'sms-gateway-conversations';

async function loadConversations() {
  if (isLoaded) return;
  
  try {
    // Try Redis first (production)
    if (kv && process.env.NODE_ENV === 'production') {
      console.log('📡 Loading SMS Gateway conversations from Redis...');
      const data = await kv.get(REDIS_KEY);
      if (data && Array.isArray(data)) {
        smsGatewayConversations = data;
        console.log(`📂 Loaded ${data.length} SMS Gateway conversations from Redis`);
      }
    } 
    // Fallback to file storage (development)
    else if (fs.existsSync(STORAGE_FILE)) {
      console.log('📁 Loading SMS Gateway conversations from file...');
      const data = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
      if (Array.isArray(data)) {
        smsGatewayConversations = data;
        console.log(`📂 Loaded ${data.length} SMS Gateway conversations from storage`);
      }
    }
  } catch (error) {
    console.error('❌ Error loading SMS Gateway conversations:', error);
    smsGatewayConversations = [];
  }
  
  isLoaded = true;
}

async function saveConversations() {
  try {
    // Save to Redis (production)
    if (kv && process.env.NODE_ENV === 'production') {
      await kv.set(REDIS_KEY, smsGatewayConversations);
      console.log(`💾 Saved ${smsGatewayConversations.length} SMS Gateway conversations to Redis`);
    } 
    // Save to file (development)
    else {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(smsGatewayConversations, null, 2));
      console.log(`💾 Saved ${smsGatewayConversations.length} SMS Gateway conversations to file`);
    }
  } catch (error) {
    console.error('❌ Error saving SMS Gateway conversations:', error);
  }
}

export async function addSMSGatewayMessage(message: Omit<SMSGatewayMessage, 'id'>) {
  await loadConversations();
  
  const newMessage: SMSGatewayMessage = {
    ...message,
    id: `sms_gateway_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  };
  
  // Add message to array
  smsGatewayConversations.push(newMessage);
  
  // Keep only last 1000 messages
  if (smsGatewayConversations.length > 1000) {
    smsGatewayConversations = smsGatewayConversations.slice(-1000);
  }
  
  await saveConversations();
  
  console.log('💾 Saved SMS Gateway conversation:', {
    phoneNumber: newMessage.phoneNumber,
    direction: newMessage.direction,
    messagePreview: newMessage.message.substring(0, 50) + '...'
  });
}

export async function getSMSGatewayConversations() {
  await loadConversations();
  
  // Group by phone number and get the latest message for each
  const conversationMap = new Map();
  
  smsGatewayConversations.forEach(msg => {
    const existing = conversationMap.get(msg.phoneNumber);
    if (!existing || new Date(msg.timestamp) > new Date(existing.timestamp)) {
      conversationMap.set(msg.phoneNumber, msg);
    }
  });
  
  // Convert to API format
  return Array.from(conversationMap.values()).map(msg => ({
    sid: `sms_gateway_${msg.phoneNumber}`,
    friendlyName: `SMS Gateway - ${msg.phoneNumber}`,
    participants: [{ identity: msg.phoneNumber }],
    lastMessage: msg.message,
    dateUpdated: msg.timestamp,
    provider: 'sms_gateway',
    messageCount: smsGatewayConversations.filter(m => m.phoneNumber === msg.phoneNumber).length,
    phoneNumber: msg.phoneNumber,
    lastMessageDirection: msg.direction,
    lastMessageDate: msg.timestamp,
    lastMessageText: msg.message,
    unreadCount: 0
  })).sort((a, b) => new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime());
}

export async function getSMSGatewayMessages(phoneNumber: string) {
  await loadConversations();
  
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