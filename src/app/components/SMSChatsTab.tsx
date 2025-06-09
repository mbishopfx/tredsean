'use client';

import { useState, useEffect, useRef } from 'react';

interface SMSChatsTabProps {
  isActive: boolean;
  logActivity: (action: string, details?: any) => void;
}

export function SMSChatsTab({ isActive, logActivity }: SMSChatsTabProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [sendingChatMessage, setSendingChatMessage] = useState(false);
  const [previousTotalMessages, setPreviousTotalMessages] = useState(0);
  const notificationSound = useRef<HTMLAudioElement>(null);

  // Always call useEffect - don't make it conditional
  useEffect(() => {
    async function fetchConversations() {
      if (!isActive) return; // Early return instead of conditional hook
      
      setLoadingConversations(true);
      
      try {
        const response = await fetch('/api/twilio/conversations');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch conversations');
        }
        
        setConversations(data.conversations || []);
        
        // Check for new messages and play notification sound if needed
        const currentTotalMessages = data.conversations?.reduce((total: number, conv: any) => {
          const recentMessages = conv.messages?.filter((m: any) => 
            m.direction === 'inbound' && 
            new Date(m.dateCreated) > new Date(Date.now() - 60 * 60 * 1000)
          ).length || 0;
          
          return total + recentMessages;
        }, 0) || 0;
        
        if (previousTotalMessages > 0 && currentTotalMessages > previousTotalMessages) {
          notificationSound.current?.play().catch(err => console.log("Could not play notification sound:", err));
        }
        
        setPreviousTotalMessages(currentTotalMessages);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoadingConversations(false);
      }
    }
    
    fetchConversations();
    
    // Set up auto-refresh every 30 seconds while tab is active
    let intervalId: NodeJS.Timeout;
    if (isActive) {
      intervalId = setInterval(fetchConversations, 30000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive, previousTotalMessages]);

  // Always call useEffect for messages
  useEffect(() => {
    async function fetchMessages() {
      if (!selectedConversation) {
        setConversationMessages([]);
        return;
      }
      
      setLoadingMessages(true);
      
      try {
        const response = await fetch(`/api/twilio/conversations?phoneNumber=${encodeURIComponent(selectedConversation)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch messages');
        }
        
        setConversationMessages(data.messages || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    }
    
    fetchMessages();
  }, [selectedConversation]);

  const handleSendChatMessage = async () => {
    if (!chatMessage.trim() || !selectedConversation || sendingChatMessage) return;
    
    setSendingChatMessage(true);
    
    try {
      const response = await fetch('/api/twilio/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedConversation,
          message: chatMessage,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      
      // Log the sent message
      logActivity('sms_sent', {
        to: selectedConversation,
        messageLength: chatMessage.length,
        via: 'chat_interface'
      });
      
      setChatMessage('');
      
      // Refresh messages to show the sent message
      const messagesResponse = await fetch(`/api/twilio/conversations?phoneNumber=${encodeURIComponent(selectedConversation)}`);
      const messagesData = await messagesResponse.json();
      
      if (messagesResponse.ok) {
        setConversationMessages(messagesData.messages || []);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingChatMessage(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Hidden audio element for notifications */}
      <audio ref={notificationSound} preload="auto">
        <source src="/notification.mp3" type="audio/mpeg" />
      </audio>

      {/* Conversations List */}
      <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
        <div className="h-1 bg-gradient"></div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-tech-foreground">SMS Conversations</h3>
            <button
              onClick={() => {
                // Refresh conversations
                const fetchConversations = async () => {
                  setLoadingConversations(true);
                  try {
                    const response = await fetch('/api/twilio/conversations');
                    const data = await response.json();
                    if (response.ok) {
                      setConversations(data.conversations || []);
                    }
                  } catch (error) {
                    console.error('Error fetching conversations:', error);
                  } finally {
                    setLoadingConversations(false);
                  }
                };
                fetchConversations();
              }}
              className="p-2 bg-tech-secondary hover:bg-tech-border rounded-md transition-colors duration-200"
              disabled={loadingConversations}
            >
              <svg className={`w-4 h-4 ${loadingConversations ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {loadingConversations ? (
            <div className="text-center text-gray-400">Loading conversations...</div>
          ) : conversations.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {conversations.map((conversation, index) => (
                <div
                  key={conversation.phoneNumber || index}
                  className={`p-3 rounded-md cursor-pointer transition-colors duration-200 ${
                    selectedConversation === conversation.phoneNumber
                      ? 'bg-primary bg-opacity-20 border border-primary'
                      : 'bg-tech-secondary hover:bg-tech-border'
                  }`}
                  onClick={() => setSelectedConversation(conversation.phoneNumber)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm text-tech-foreground">
                      {conversation.phoneNumber}
                    </span>
                    <span className="text-xs text-gray-400">
                      {conversation.lastMessageTime && new Date(conversation.lastMessageTime).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {conversation.lastMessage && (
                    <p className="text-xs text-gray-400 truncate">
                      {conversation.lastMessage}
                    </p>
                  )}
                  
                  {conversation.unreadCount > 0 && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        {conversation.messageCount} messages
                      </span>
                      <span className="bg-accent text-white text-xs px-2 py-1 rounded-full">
                        {conversation.unreadCount} new
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 text-sm">
              No conversations yet
            </div>
          )}
        </div>
      </div>

      {/* Messages and Reply Interface */}
      <div className="lg:col-span-2 bg-tech-card rounded-lg shadow-tech overflow-hidden flex flex-col">
        <div className="h-1 bg-gradient-accent"></div>
        
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-tech-border">
              <h3 className="text-lg font-semibold text-tech-foreground">
                Conversation with {selectedConversation}
              </h3>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto max-h-96">
              {loadingMessages ? (
                <div className="text-center text-gray-400">Loading messages...</div>
              ) : conversationMessages.length > 0 ? (
                <div className="space-y-3">
                  {conversationMessages.map((message, index) => {
                    console.log('SMSChatsTab - Message:', message.sid, 'Direction:', message.direction, 'From:', message.from);
                    const isOutbound = message.direction === 'outbound' || message.direction === 'outbound-api';
                    return (
                    <div
                      key={message.sid || index}
                      className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          isOutbound
                            ? 'bg-orange-500 text-white'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        <p className="text-sm">{message.body}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.dateCreated).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-400 text-sm">
                  No messages in this conversation
                </div>
              )}
            </div>
            
            {/* Reply Interface */}
            <div className="p-4 border-t border-tech-border">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 bg-tech-secondary border border-tech-border rounded-md text-tech-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChatMessage();
                    }
                  }}
                  disabled={sendingChatMessage}
                />
                <button
                  onClick={handleSendChatMessage}
                  disabled={!chatMessage.trim() || sendingChatMessage}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {sendingChatMessage ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 