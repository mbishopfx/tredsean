// Shared storage for SMS Gateway conversations
// Uses KV (Redis) for production and file-based storage for development

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

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const hasKvConfig = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

// Storage configuration
const STORAGE_FILE = path.join(process.cwd(), '.sms-gateway-storage.json');
const KV_KEY = 'sms-gateway-conversations';

// In-memory cache
let smsGatewayConversations: SMSGatewayMessage[] = [];
let isLoaded = false;

// KV functions with dynamic import
async function getKV() {
  if (!hasKvConfig) return null;
  
  try {
    const { kv } = await import('@vercel/kv');
    return kv;
  } catch (error) {
    console.warn('⚠️ KV not available:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function loadFromKV() {
  const kvClient = await getKV();
  if (!kvClient) return null;
  
  try {
    console.log('☁️ Loading SMS Gateway conversations from KV...');
    const data = await kvClient.get(KV_KEY);
    if (Array.isArray(data)) {
      console.log(`📂 Loaded ${data.length} SMS Gateway conversations from KV`);
      return data;
    }
  } catch (error) {
    console.error('❌ Error loading from KV:', error);
  }
  return null;
}

async function saveToKV(data: SMSGatewayMessage[]) {
  const kvClient = await getKV();
  if (!kvClient) return false;
  
  try {
    await kvClient.set(KV_KEY, data);
    console.log(`☁️ Saved ${data.length} SMS Gateway conversations to KV`);
    return true;
  } catch (error) {
    console.error('❌ Error saving to KV:', error);
    return false;
  }
}

async function loadFromFile() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      console.log('📁 Loading SMS Gateway conversations from file...');
      const data = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
      if (Array.isArray(data)) {
        console.log(`📂 Loaded ${data.length} SMS Gateway conversations from file`);
        return data;
      }
    } else {
      console.log('📁 No existing storage file found, starting fresh');
    }
  } catch (error) {
    console.error('❌ Error loading from file:', error);
  }
  return [];
}

async function saveToFile(data: SMSGatewayMessage[]) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
    console.log(`📁 Saved ${data.length} SMS Gateway conversations to file`);
    return true;
  } catch (error) {
    console.error('❌ Error saving to file:', error);
    return false;
  }
}

async function loadConversations() {
  if (isLoaded) return;
  
  // Try KV first in production, then fall back to file
  if (isProduction && hasKvConfig) {
    const kvData = await loadFromKV();
    if (kvData) {
      smsGatewayConversations = kvData;
      isLoaded = true;
      return;
    }
  }
  
  // Use file storage (development or fallback)
  const fileData = await loadFromFile();
  smsGatewayConversations = fileData;
  isLoaded = true;
}

async function saveConversations() {
  // Try KV first in production, then fall back to file
  if (isProduction && hasKvConfig) {
    const kvSuccess = await saveToKV(smsGatewayConversations);
    if (kvSuccess) return;
  }
  
  // Save to file (development or fallback)
  await saveToFile(smsGatewayConversations);
}

export async function addSMSGatewayMessage(message: Omit<SMSGatewayMessage, 'id'>) {
  try {
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
    
    // Only try to save if we're on the server side
    if (typeof window === 'undefined') {
      await saveConversations();
    }
    
    console.log('💾 Saved SMS Gateway conversation:', {
      phoneNumber: newMessage.phoneNumber,
      direction: newMessage.direction,
      messagePreview: newMessage.message.substring(0, 50) + '...'
    });

    return newMessage;
  } catch (error) {
    console.warn('⚠️ Failed to save SMS Gateway conversation:', error);
    // Don't throw error - allow the operation to continue even if storage fails
    return null;
  }
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
    
    // Update last message if this is newer
    if (!phoneConv.lastTimestamp || new Date(conv.timestamp) > new Date(phoneConv.lastTimestamp)) {
      phoneConv.lastMessage = conv.message;
      phoneConv.lastTimestamp = conv.timestamp;
    }
  });
  
  // Convert to array format expected by the UI
  return Array.from(conversationsByPhone.values()).map(conv => ({
    sid: `sms_gateway_${conv.phoneNumber.replace(/\D/g, '')}`,
    friendlyName: `SMS Gateway - ${conv.phoneNumber}`,
    participants: [{ identity: conv.phoneNumber }],
    lastMessage: conv.lastMessage || '',
    dateUpdated: conv.lastTimestamp || new Date().toISOString(),
    provider: 'sms_gateway',
    messageCount: conv.messages.length,
    phoneNumber: conv.phoneNumber,
    lastMessageDirection: conv.messages[conv.messages.length - 1]?.direction || 'outbound',
    lastMessageDate: conv.lastTimestamp || new Date().toISOString(),
    lastMessageText: conv.lastMessage || '',
    unreadCount: 0
  })).sort((a, b) => new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime());
} 