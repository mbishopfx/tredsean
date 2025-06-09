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
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAiAnalysis, setLoadingAiAnalysis] = useState(false);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
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
        
        // Mark conversation as read when messages are loaded
        setConversations(prev => prev.map(conv => 
          conv.phoneNumber === selectedConversation 
            ? { ...conv, unreadCount: 0 }
            : conv
        ));
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

  const handleAiAnalysis = async () => {
    if (!selectedConversation || conversationMessages.length === 0) return;
    
    setLoadingAiAnalysis(true);
    setShowAiAnalysis(true);
    
    try {
      const response = await fetch('/api/ai/analyze-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: selectedConversation,
          messages: conversationMessages,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze conversation');
      }
      
      setAiAnalysis(data.suggestedResponse);
      logActivity('ai_analysis_requested', {
        phoneNumber: selectedConversation,
        messageCount: conversationMessages.length
      });
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      setAiAnalysis('Sorry, I couldn\'t analyze this conversation right now. Please try again later.');
    } finally {
      setLoadingAiAnalysis(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy text:', error);
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
              {conversations.map((conversation, index) => {
                const lastMessageDirection = conversation.lastMessageDirection;
                const isUnread = conversation.unreadCount > 0;
                const isAwaitingReply = lastMessageDirection === 'inbound' && !isUnread;
                const wasRepliedTo = lastMessageDirection === 'outbound';
                
                return (
                <div
                  key={conversation.phoneNumber || index}
                  className={`p-3 rounded-md cursor-pointer transition-colors duration-200 ${
                    selectedConversation === conversation.phoneNumber
                      ? 'bg-primary bg-opacity-20 border border-primary'
                      : 'bg-tech-secondary hover:bg-tech-border'
                  }`}
                  onClick={() => {
                    setSelectedConversation(conversation.phoneNumber);
                    // Mark as read when conversation is opened
                    if (isUnread) {
                      // Update the conversation to mark as read
                      setConversations(prev => prev.map(conv => 
                        conv.phoneNumber === conversation.phoneNumber 
                          ? { ...conv, unreadCount: 0 }
                          : conv
                      ));
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="font-medium text-sm text-tech-foreground truncate">
                        {conversation.phoneNumber}
                      </span>
                      
                      {/* Status Indicators */}
                      {isUnread && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                          UNREAD
                        </span>
                      )}
                      {!isUnread && isAwaitingReply && (
                        <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                          PENDING
                        </span>
                      )}
                      {!isUnread && wasRepliedTo && (
                        <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                          REPLIED
                        </span>
                      )}
                    </div>
                    
                    <span className="text-xs text-gray-400 ml-2">
                      {conversation.lastMessageTime && new Date(conversation.lastMessageTime).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {conversation.lastMessage && (
                    <div className="flex items-start space-x-2">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 truncate">
                          <span className="font-medium">
                            {lastMessageDirection === 'outbound' ? 'You: ' : 'Them: '}
                          </span>
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {conversation.messageCount} messages
                    </span>
                    
                    {isUnread && (
                      <span className="bg-accent text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                        {conversation.unreadCount} new
                      </span>
                    )}
                  </div>
                </div>
                );
              })}
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
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-tech-foreground">
                  Conversation with {selectedConversation}
                </h3>
                <button
                  onClick={handleAiAnalysis}
                  disabled={loadingAiAnalysis || conversationMessages.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-md hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className={`w-4 h-4 ${loadingAiAnalysis ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {loadingAiAnalysis ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    )}
                  </svg>
                  <span>{loadingAiAnalysis ? 'Analyzing...' : 'AI Analysis'}</span>
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto max-h-96">
              {loadingMessages ? (
                <div className="text-center text-gray-400">Loading messages...</div>
              ) : conversationMessages.length > 0 ? (
                <div className="space-y-3">
                  {conversationMessages.map((message, index) => {
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
            
            {/* AI Analysis Panel */}
            {showAiAnalysis && (
              <div className="p-4 border-t border-tech-border bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-purple-700 flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>AI Suggested Response</span>
                  </h4>
                  <button
                    onClick={() => setShowAiAnalysis(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {loadingAiAnalysis ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 animate-spin text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="text-purple-600">Analyzing conversation...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
                      <p className="text-gray-800 whitespace-pre-wrap">{aiAnalysis}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(aiAnalysis)}
                        className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy Response</span>
                      </button>
                      
                      <button
                        onClick={() => setChatMessage(aiAnalysis)}
                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Use Response</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
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