'use client';

import { useState, useEffect } from 'react';
import { SMSGatewayHealthChecker } from './SMSGatewayHealthChecker';
import { SMSGatewayStatus } from './SMSGatewayStatus';

interface ContactData {
  [key: string]: any;
  phone: string;
  name?: string;
  company?: string;
  email?: string;
  location?: string;
  title?: string;
  industry?: string;
  website?: string;
  revenue?: string;
  employees?: string;
  source?: string;
}

interface AdvancedMessageSenderProps {
  isActive: boolean;
  logActivity: (action: string, details?: any) => void;
}

// Extended variable list for Apollo and lead generation
const AVAILABLE_VARIABLES = [
  // Basic Contact Info
  { name: 'name', description: 'Contact first name', category: 'Basic' },
  { name: 'full_name', description: 'Full contact name', category: 'Basic' },
  { name: 'first_name', description: 'First name only', category: 'Basic' },
  { name: 'last_name', description: 'Last name only', category: 'Basic' },
  { name: 'phone', description: 'Phone number', category: 'Basic' },
  { name: 'email', description: 'Email address', category: 'Basic' },
  
  // Company Information
  { name: 'company', description: 'Company name', category: 'Company' },
  { name: 'company_size', description: 'Number of employees', category: 'Company' },
  { name: 'revenue', description: 'Annual revenue', category: 'Company' },
  { name: 'industry', description: 'Business industry', category: 'Company' },
  { name: 'website', description: 'Company website', category: 'Company' },
  { name: 'company_location', description: 'Company headquarters', category: 'Company' },
  
  // Job/Position Info
  { name: 'title', description: 'Job title', category: 'Position' },
  { name: 'department', description: 'Department/division', category: 'Position' },
  { name: 'seniority', description: 'Seniority level', category: 'Position' },
  { name: 'years_experience', description: 'Years of experience', category: 'Position' },
  
  // Location Data
  { name: 'location', description: 'Contact location', category: 'Location' },
  { name: 'city', description: 'City', category: 'Location' },
  { name: 'state', description: 'State/Province', category: 'Location' },
  { name: 'country', description: 'Country', category: 'Location' },
  { name: 'zip_code', description: 'ZIP/Postal code', category: 'Location' },
  
  // Apollo-specific fields
  { name: 'apollo_score', description: 'Apollo contact score', category: 'Apollo' },
  { name: 'linkedin_url', description: 'LinkedIn profile URL', category: 'Apollo' },
  { name: 'twitter_handle', description: 'Twitter username', category: 'Apollo' },
  { name: 'facebook_url', description: 'Facebook profile', category: 'Apollo' },
  { name: 'crunchbase_url', description: 'Crunchbase company URL', category: 'Apollo' },
  
  // Lead Generation specific
  { name: 'lead_source', description: 'Lead generation source', category: 'Lead Gen' },
  { name: 'lead_score', description: 'Lead quality score', category: 'Lead Gen' },
  { name: 'intent_signal', description: 'Buying intent indicator', category: 'Lead Gen' },
  { name: 'technology_stack', description: 'Company tech stack', category: 'Lead Gen' },
  { name: 'funding_stage', description: 'Funding/growth stage', category: 'Lead Gen' },
  { name: 'recent_news', description: 'Recent company news', category: 'Lead Gen' },
  
  // System/Dynamic variables
  { name: 'date', description: 'Current date', category: 'System' },
  { name: 'time', description: 'Current time', category: 'System' },
  { name: 'current_month', description: 'Current month name', category: 'System' },
  { name: 'current_year', description: 'Current year', category: 'System' },
  { name: 'day_of_week', description: 'Day of the week', category: 'System' },
  
  // Custom/Additional
  { name: 'custom_field_1', description: 'Custom field 1', category: 'Custom' },
  { name: 'custom_field_2', description: 'Custom field 2', category: 'Custom' },
  { name: 'custom_field_3', description: 'Custom field 3', category: 'Custom' },
  { name: 'notes', description: 'Additional notes', category: 'Custom' },
  { name: 'tag', description: 'Contact tag/label', category: 'Custom' },
];

const VARIABLE_CATEGORIES = [
  'All',
  'Basic',
  'Company', 
  'Position',
  'Location',
  'Apollo',
  'Lead Gen',
  'System',
  'Custom'
];

// 50+ Pre-made Templates organized by category
const QUICK_TEMPLATES = {
  'Cold Outreach': [
    {
      name: 'Basic Introduction',
      template: 'Hi {name}, I noticed {company} is growing fast in {location}. We help companies like yours increase leads by 3x. Quick 5-min chat this week?'
    },
    {
      name: 'Industry-Specific',
      template: 'Hi {name}, saw {company} is making waves in {industry}. We just helped {recent_client} increase their revenue by 40%. Worth a quick call?'
    },
    {
      name: 'Referral Opening',
      template: '{name}, {mutual_connection} suggested I reach out. {company} could benefit from our {service}. Coffee this week?'
    },
    {
      name: 'Pain Point Focus',
      template: 'Hi {name}, many {title}s at {industry} companies struggle with {pain_point}. We solved this for {similar_company}. Quick chat?'
    },
    {
      name: 'News Hook',
      template: '{name}, congrats on {recent_news}! As {company} scales, you\'ll need {solution}. We helped {competitor} with similar growth. Call?'
    },
    {
      name: 'LinkedIn Connect',
      template: 'Hi {name}, loved your recent LinkedIn post about {topic}. {company} could benefit from our {service}. Quick 10-min call?'
    },
    {
      name: 'Competitor Mention',
      template: '{name}, we just helped {competitor} achieve {result}. {company} could see similar gains. Worth a brief discussion?'
    },
    {
      name: 'Urgency Creator',
      template: 'Hi {name}, offering {service} to 5 {industry} companies this month. {company} fits perfectly. Free consultation this week?'
    }
  ],
  'Follow-Up': [
    {
      name: 'Gentle Follow-Up',
      template: 'Hi {name}, following up on my message about {service}. Still relevant for {company}? Happy to send more details.'
    },
    {
      name: 'Value-Add Follow-Up',
      template: '{name}, thought you\'d find this {resource} useful for {company}. Still interested in discussing {service}?'
    },
    {
      name: 'Deadline Follow-Up',
      template: 'Hi {name}, our {offer} for {company} expires {deadline}. Don\'t want you to miss out. Quick call today?'
    },
    {
      name: 'Social Proof Follow-Up',
      template: '{name}, just helped {client} achieve {result}. {company} could see similar gains. Ready to chat?'
    },
    {
      name: 'Last Attempt',
      template: 'Hi {name}, this is my final reach out about {service} for {company}. If timing isn\'t right, just let me know!'
    },
    {
      name: 'Re-engagement',
      template: '{name}, it\'s been a while! Things might have changed at {company}. Still interested in {service}?'
    }
  ],
  'Sales': [
    {
      name: 'Demo Invitation',
      template: 'Hi {name}, ready to see how {company} can save {savings} annually? Free demo available this week. When works best?'
    },
    {
      name: 'Trial Offer',
      template: '{name}, try our {product} free for 30 days. No risk, just results. {company} has nothing to lose. Start today?'
    },
    {
      name: 'Limited Time Offer',
      template: 'Hi {name}, offering {discount}% off for {company} this month only. Save ${amount} on {product}. Interested?'
    },
    {
      name: 'Case Study Share',
      template: '{name}, {similar_company} increased {metric} by {percentage}% using our {solution}. {company} could see similar results. Case study?'
    },
    {
      name: 'ROI Focused',
      template: 'Hi {name}, {company} could save ${amount} annually with our {solution}. 15-min ROI calculation call this week?'
    },
    {
      name: 'Objection Handler',
      template: '{name}, I know {company} might think {objection}. That\'s exactly what {client} said before seeing {result}. Quick call?'
    },
    {
      name: 'Closing Push',
      template: 'Hi {name}, everything looks good for {company} to start with {product}. Just need your approval to begin. Ready?'
    }
  ],
  'Lead Nurturing': [
    {
      name: 'Educational Content',
      template: 'Hi {name}, here\'s a guide on {topic} that\'s helped other {title}s at {industry} companies. Thought {company} would benefit!'
    },
    {
      name: 'Industry Update',
      template: '{name}, big changes coming to {industry}. {company} should prepare. We\'re helping clients navigate this. Need guidance?'
    },
    {
      name: 'Tip of the Week',
      template: 'Hi {name}, quick tip: {company} can {benefit} by {action}. We help {industry} companies implement this daily.'
    },
    {
      name: 'Success Story',
      template: '{name}, {client_name} just achieved {result} using our methods. Similar opportunity for {company}. Want details?'
    },
    {
      name: 'Resource Share',
      template: 'Hi {name}, created this {resource_type} specifically for {industry} {title}s like yourself. Hope {company} finds it valuable!'
    },
    {
      name: 'Question Poser',
      template: '{name}, quick question: What\'s {company}\'s biggest challenge with {area}? We might have a solution.'
    }
  ],
  'Event/Webinar': [
    {
      name: 'Webinar Invitation',
      template: 'Hi {name}, hosting a webinar on {topic} for {industry} leaders. Perfect for {company}. {date} at {time}. Register?'
    },
    {
      name: 'Conference Invite',
      template: '{name}, will you be at {event_name}? Would love to connect and discuss how {company} can {benefit}. Coffee?'
    },
    {
      name: 'Workshop Announcement',
      template: 'Hi {name}, free workshop on {topic} for {industry} {title}s. {company} would benefit greatly. Limited spots: {date}.'
    },
    {
      name: 'Exclusive Event',
      template: '{name}, exclusive roundtable for {industry} leaders like yourself. Discussing {topic}. {company} perspective would be valuable!'
    },
    {
      name: 'Post-Event Follow-Up',
      template: 'Hi {name}, great meeting you at {event}. As discussed, {company} could benefit from {solution}. Coffee this week?'
    }
  ],
  'Seasonal/Holiday': [
    {
      name: 'New Year',
      template: 'Hi {name}, Happy New Year! What are {company}\'s goals for {current_year}? We help {industry} companies achieve them.'
    },
    {
      name: 'Quarter End',
      template: '{name}, end of Q{quarter} approaching. Can {company} hit targets? Our {solution} helps close the gap quickly.'
    },
    {
      name: 'Holiday Greeting',
      template: 'Hi {name}, wishing {company} a wonderful {holiday}! New year, new opportunities to grow. Let\'s connect in January.'
    },
    {
      name: 'Summer Slowdown',
      template: '{name}, summer\'s perfect time for {company} to implement {solution}. Less busy, better focus. Quick planning call?'
    },
    {
      name: 'Back to School',
      template: 'Hi {name}, September = fresh starts. Perfect time for {company} to launch {solution}. Ready to begin?'
    }
  ],
  'Industry-Specific': [
    {
      name: 'SaaS/Tech',
      template: 'Hi {name}, {company}\'s growth metrics are impressive! Our {solution} helps SaaS companies scale customer acquisition. Demo?'
    },
    {
      name: 'E-commerce',
      template: '{name}, busy shopping season ahead! {company} needs to maximize conversion rates. Our tool increased sales by {percentage}%. Interested?'
    },
    {
      name: 'Healthcare',
      template: 'Hi {name}, HIPAA-compliant {solution} for healthcare orgs like {company}. Streamlines {process} while ensuring security. Demo?'
    },
    {
      name: 'Real Estate',
      template: '{name}, market\'s hot! {company} needs every lead possible. Our {solution} increased closings by {percentage}% for agents. Call?'
    },
    {
      name: 'Manufacturing',
      template: 'Hi {name}, supply chain challenges got {company} down? Our {solution} optimizes operations for manufacturers. ROI in months!'
    },
    {
      name: 'Legal Services',
      template: '{name}, client acquisition tough for law firms? {company} could benefit from our legal marketing solution. Case studies available!'
    },
    {
      name: 'Financial Services',
      template: 'Hi {name}, compliance headaches at {company}? Our {solution} automates regulatory reporting for financial firms. Demo this week?'
    }
  ],
  'Personalization': [
    {
      name: 'Company Growth',
      template: 'Hi {name}, saw {company} just raised ${funding_amount}! Perfect timing to scale with our {solution}. Growth-focused chat?'
    },
    {
      name: 'Hiring Surge',
      template: '{name}, noticed {company} is hiring fast. Great sign! Our {solution} helps scaling companies maintain quality. Relevant?'
    },
    {
      name: 'Location-Based',
      template: 'Hi {name}, we work with several {industry} companies in {city}. {company} would fit right in. Local success stories to share!'
    },
    {
      name: 'Technology Stack',
      template: '{name}, saw {company} uses {tech_stack}. Our {solution} integrates perfectly! Saved {similar_company} 20 hours/week.'
    },
    {
      name: 'Recent Achievement',
      template: 'Hi {name}, congrats on {company}\'s {achievement}! As you grow, you\'ll need {solution}. We\'ve helped others at your stage.'
    },
    {
      name: 'Mutual Connection',
      template: '{name}, {mutual_contact} at {their_company} raved about your work at {company}. Should connect about {topic}!'
    }
  ]
};

const TEMPLATE_CATEGORIES = Object.keys(QUICK_TEMPLATES);

export function AdvancedMessageSender({ isActive, logActivity }: AdvancedMessageSenderProps) {
  const [messageText, setMessageText] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [contactData, setContactData] = useState<ContactData[]>([]);
  const [fileName, setFileName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ success: boolean; message: string } | null>(null);
  
  // Variable management
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [variableSearch, setVariableSearch] = useState('');
  const [showVariables, setShowVariables] = useState(true);
  
  // Template management
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('Cold Outreach');
  const [showTemplates, setShowTemplates] = useState(false);
  
  // AI enhancements
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContact, setPreviewContact] = useState<ContactData | null>(null);
  
  // Message tracking and reporting
  const [campaignReport, setCampaignReport] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);
  const [campaignId, setCampaignId] = useState<string>('');
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  
  // Standalone message functionality
  const [standaloneMode, setStandaloneMode] = useState(false);
  const [singlePhone, setSinglePhone] = useState('');
  const [singleMessage, setSingleMessage] = useState('');
  const [isSendingSingle, setIsSendingSingle] = useState(false);
  
  // SMS Provider selection - default to Jon's device
  const [smsProvider, setSmsProvider] = useState<'jon-device' | 'personal'>('jon-device');

  const filteredVariables = AVAILABLE_VARIABLES.filter(variable => {
    const matchesCategory = selectedCategory === 'All' || variable.category === selectedCategory;
    const matchesSearch = variable.name.toLowerCase().includes(variableSearch.toLowerCase()) ||
                         variable.description.toLowerCase().includes(variableSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Phone number formatting function
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If it starts with 1 and is 11 digits, keep as is
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    
    // If it's 10 digits, add US country code
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    
    // If it already has a country code but no +, add it
    if (cleaned.length > 10 && !cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    // Return the cleaned version with + if it's not already there
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const contacts: ContactData[] = [];
      const phones: string[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const contact: ContactData = { phone: '' };
        
        headers.forEach((header, index) => {
          if (values[index]) {
            const key = header.toLowerCase().replace(/\s+/g, '_');
            contact[key] = values[index];
            
            // More specific phone number column detection - avoid phone_type
            if (key === 'phone' || key === 'mobile' || key === 'cell' || key === 'phone_number' || key === 'mobile_phone' || key === 'cell_phone') {
              contact.phone = values[index];
            }
          }
        });
        
        if (contact.phone) {
          contacts.push(contact);
          phones.push(contact.phone);
        }
      }
      
      setContactData(contacts);
      setPhoneNumbers(phones);
      setFileName(file.name);
      setPreviewContact(contacts[0] || null);
      
      setSendStatus({
        success: true,
        message: `✅ Loaded ${contacts.length} contacts with ${headers.length} fields`
      });
      
    } catch (error) {
      setSendStatus({
        success: false,
        message: '❌ Failed to parse CSV file. Please check the format.'
      });
    }
  };

  const insertVariable = (variableName: string) => {
    const variable = `{${variableName}}`;
    setMessageText(prev => prev + variable);
  };

  const loadTemplate = (template: string) => {
    setMessageText(template);
    setShowTemplates(false);
    setSendStatus({
      success: true,
      message: '✅ Template loaded successfully'
    });
  };

  const optimizeWithAI = async () => {
    if (!messageText.trim()) return;
    
    setAiOptimizing(true);
    try {
      const response = await fetch('/api/ai/optimize-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          variables: filteredVariables.map(v => v.name),
          messageType: 'mass_sms'
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessageText(data.optimizedMessage);
        setSendStatus({
          success: true,
          message: '✅ Message optimized with AI suggestions'
        });
      }
    } catch (error) {
      setSendStatus({
        success: false,
        message: '❌ AI optimization failed'
      });
    } finally {
      setAiOptimizing(false);
    }
  };

  const generatePreview = () => {
    if (!previewContact || !messageText) return messageText;
    
    let preview = messageText;
    
    // Replace variables with actual data
    Object.keys(previewContact).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      preview = preview.replace(regex, previewContact[key] || `[${key}]`);
    });
    
    // Replace system variables
    preview = preview.replace(/{date}/g, new Date().toLocaleDateString());
    preview = preview.replace(/{time}/g, new Date().toLocaleTimeString());
    preview = preview.replace(/{current_month}/g, new Date().toLocaleString('default', { month: 'long' }));
    preview = preview.replace(/{current_year}/g, new Date().getFullYear().toString());
    preview = preview.replace(/{day_of_week}/g, new Date().toLocaleString('default', { weekday: 'long' }));
    
    return preview;
  };

  const handleSendSingleMessage = async () => {
    if (!singleMessage.trim() || !singlePhone.trim()) {
      setSendStatus({
        success: false,
        message: 'Please enter both phone number and message'
      });
      return;
    }

    setIsSendingSingle(true);
    
    try {
      // Format the phone number
      const formattedPhone = formatPhoneNumber(singlePhone);
      
      // Validate phone number format
      if (formattedPhone.length < 11 || !formattedPhone.startsWith('+')) {
        setSendStatus({
          success: false,
          message: 'Invalid phone number format. Please enter a valid phone number.'
        });
        setIsSendingSingle(false);
        return;
      }

      console.log('📤 Sending single message via', smsProvider, 'to:', formattedPhone);
      
      let response;
      
      if (smsProvider === 'jon-device') {
        // Check if user has their own SMS Gateway credentials
        const userSMSGateway = typeof window !== 'undefined' ? 
          localStorage.getItem('userSMSGateway') : null;
        
        if (userSMSGateway) {
          try {
            const credentials = JSON.parse(userSMSGateway);
            // Use user's personal SMS Gateway device
            response = await fetch('/api/sms-gateway/send-user-sms', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                phoneNumber: formattedPhone,
                message: singleMessage,
                userCredentials: credentials
              }),
            });
          } catch (error) {
            console.error('Error parsing user SMS Gateway credentials:', error);
            // Fallback to Jon's device
            response = await fetch('/api/sms-gateway/send-jon-simple', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                phoneNumber: formattedPhone,
                message: singleMessage
              }),
            });
          }
        } else {
          // Fallback to Jon's device if no user credentials
          response = await fetch('/api/sms-gateway/send-jon-simple', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phoneNumber: formattedPhone,
              message: singleMessage
            }),
          });
        }
      } else {
        // Use personal SMS Gateway credentials
        const storedCredentials = localStorage.getItem('personalSMSCredentials');
        const personalSMSCredentials = storedCredentials ? JSON.parse(storedCredentials) : null;
        
        if (!personalSMSCredentials) {
          setSendStatus({
            success: false,
            message: '❌ Personal SMS credentials not found. Please log in again.'
          });
          setIsSendingSingle(false);
          return;
        }

        // Transform credentials for SMS Gateway compatibility
        const transformedCredentials = personalSMSCredentials?.provider === 'smsgateway' ? {
          ...personalSMSCredentials,
          username: personalSMSCredentials.cloudUsername || personalSMSCredentials.username,
          password: personalSMSCredentials.cloudPassword || personalSMSCredentials.password
        } : personalSMSCredentials;

        response = await fetch('/api/sms/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumbers: [formattedPhone],
            message: singleMessage,
            provider: 'personal',
            credentials: transformedCredentials,
            contactData: [{ phone: formattedPhone }],
            campaignId: `single_${Date.now()}`
          }),
        });
      }

      const data = await response.json();
      
      if (response.ok) {
        setSendStatus({
          success: true,
          message: `✅ Message sent successfully to ${formattedPhone}`
        });
        setSingleMessage('');
        setSinglePhone('');
        
        // Log activity
        logActivity('Single SMS Sent', {
          phone: formattedPhone,
          messageLength: singleMessage.length,
          timestamp: new Date().toISOString()
        });
      } else {
        setSendStatus({
          success: false,
          message: `❌ Failed to send message: ${data.error || 'Unknown error'}`
        });
      }
    } catch (error: any) {
      setSendStatus({
        success: false,
        message: `❌ Error sending message: ${error.message}`
      });
    } finally {
      setIsSendingSingle(false);
    }
  };

  const handleSendMessages = async () => {
    if (!messageText || phoneNumbers.length === 0) {
      setSendStatus({
        success: false,
        message: 'Please enter a message and upload contacts'
      });
      return;
    }

    setIsSending(true);
    
    // Generate campaign ID
    const newCampaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCampaignId(newCampaignId);
    
    // Initialize tracking report
    const report = {
      campaignId: newCampaignId,
      startTime: new Date().toISOString(),
      totalRecipients: phoneNumbers.length,
      successful: 0,
      failed: 0,
      pending: phoneNumbers.length,
      details: [] as any[],
      messagePreview: generatePreview().substring(0, 100) + '...',
      estimatedCost: (phoneNumbers.length * 0.0075).toFixed(2)
    };
    
    setCampaignReport(report);
    setSendStatus(null);
    
    try {
      console.log('📤 Starting mass campaign via', smsProvider, 'to', phoneNumbers.length, 'contacts');
      
      // Only check for personal credentials if not using Jon's device
      let transformedCredentials = null;
      if (smsProvider !== 'jon-device') {
        const storedCredentials = localStorage.getItem('personalSMSCredentials');
        const personalSMSCredentials = storedCredentials ? JSON.parse(storedCredentials) : null;
        
        if (!personalSMSCredentials) {
          setSendStatus({
            success: false,
            message: '❌ Personal SMS credentials not found. Please log in again.'
          });
          setIsSending(false);
          return;
        }

        // Transform credentials for SMS Gateway compatibility
        transformedCredentials = personalSMSCredentials?.provider === 'smsgateway' ? {
          ...personalSMSCredentials,
          username: personalSMSCredentials.cloudUsername || personalSMSCredentials.username,
          password: personalSMSCredentials.cloudPassword || personalSMSCredentials.password
        } : personalSMSCredentials;
      }

      // Send campaign tracking request first
      if (trackingEnabled) {
        await fetch('/api/campaigns/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId: newCampaignId,
            type: 'mass_sms',
            totalRecipients: phoneNumbers.length,
            messageTemplate: messageText,
            contactData: contactData.slice(0, 5) // Sample data
          })
        });
      }

      // Send messages one by one sequentially (like single messages)
      let totalSuccessful = 0;
      let totalFailed = 0;
      const details: any[] = [];

      // Process each contact individually, just like single messages
      for (let i = 0; i < phoneNumbers.length; i++) {
        const phone = phoneNumbers[i];
        const contact = contactData[i] || { phone };
        
        // Format phone number exactly like single messages
        const formattedPhone = formatPhoneNumber(phone);
        
        // Personalize message for this specific contact (using same logic as generatePreview)
        let personalizedMessage = messageText;
        
        // Replace variables with actual contact data (dynamic field mapping)
        Object.keys(contact).forEach(key => {
          const regex = new RegExp(`{${key}}`, 'g');
          personalizedMessage = personalizedMessage.replace(regex, contact[key] || "");
        });
        
        // Also try common field variations for better compatibility
        const fieldMappings = {
          'name': ['name', 'first_name', 'firstname', 'full_name', 'fullname'],
          'company': ['company', 'company_name', 'organization', 'business', 'business_name'],
          'email': ['email', 'email_address', 'e_mail'],
          'title': ['title', 'job_title', 'position', 'role'],
          'location': ['location', 'city', 'address', 'state'],
          'phone': ['phone', 'mobile', 'cell', 'phone_number']
        };
        
        Object.entries(fieldMappings).forEach(([variable, possibleFields]) => {
          const regex = new RegExp(`{${variable}}`, 'g');
          for (const field of possibleFields) {
            if (contact[field]) {
              personalizedMessage = personalizedMessage.replace(regex, contact[field]);
              break;
            }
          }
        });
        
        // Replace system variables
        personalizedMessage = personalizedMessage.replace(/{date}/g, new Date().toLocaleDateString());
        personalizedMessage = personalizedMessage.replace(/{time}/g, new Date().toLocaleTimeString());
        personalizedMessage = personalizedMessage.replace(/{current_month}/g, new Date().toLocaleString('default', { month: 'long' }));
        personalizedMessage = personalizedMessage.replace(/{current_year}/g, new Date().getFullYear().toString());
        personalizedMessage = personalizedMessage.replace(/{day_of_week}/g, new Date().toLocaleString('default', { weekday: 'long' }));
        
        // Set phone number for {phone} variable
        personalizedMessage = personalizedMessage.replace(/{phone}/g, formattedPhone);
        
        console.log(`📤 Sending message ${i + 1}/${phoneNumbers.length} to ${formattedPhone}...`);
        console.log(`Contact data:`, contact);
        console.log(`Original message:`, messageText);
        console.log(`Personalized message:`, personalizedMessage);
        
        try {
          let response;
          
          if (smsProvider === 'jon-device') {
            // Check if user has their own SMS Gateway credentials
            const userSMSGateway = typeof window !== 'undefined' ? 
              localStorage.getItem('userSMSGateway') : null;
            
            if (userSMSGateway) {
              try {
                const credentials = JSON.parse(userSMSGateway);
                // Use user's personal SMS Gateway device
                response = await fetch('/api/sms-gateway/send-user-sms', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    phoneNumber: formattedPhone,
                    message: personalizedMessage,
                    userCredentials: credentials
                  }),
                });
              } catch (error) {
                console.error('Error parsing user SMS Gateway credentials:', error);
                // Fallback to Jon's device
                response = await fetch('/api/sms-gateway/send-jon-simple', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    phoneNumber: formattedPhone,
                    message: personalizedMessage
                  }),
                });
              }
            } else {
              // Fallback to Jon's device if no user credentials
              response = await fetch('/api/sms-gateway/send-jon-simple', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  phoneNumber: formattedPhone,
                  message: personalizedMessage
                }),
              });
            }
          } else {
            // Use personal SMS Gateway credentials
            response = await fetch('/api/sms/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                phoneNumbers: [formattedPhone],
                message: personalizedMessage,
                provider: 'personal',
                credentials: transformedCredentials,
                contactData: [{ phone: formattedPhone }],
                campaignId: `single_${Date.now()}_${i}` // Make each look like a single message
              }),
            });
          }

          const data = await response.json();
          
          if (response.ok) {
            totalSuccessful++;
            details.push({
              phone: formattedPhone,
              status: 'sent',
              timestamp: new Date().toISOString(),
              messagePreview: personalizedMessage.substring(0, 50) + '...',
              contact: contact
            });
            console.log(`✅ Message ${i + 1} sent successfully to ${formattedPhone}`);
          } else {
            totalFailed++;
            details.push({
              phone: formattedPhone,
              status: 'failed',
              error: data.error || 'Unknown error',
              timestamp: new Date().toISOString(),
              contact: contact
            });
            console.log(`❌ Message ${i + 1} failed to ${formattedPhone}: ${data.error || 'Unknown error'}`);
          }
        } catch (error: any) {
          totalFailed++;
          details.push({
            phone: formattedPhone,
            status: 'failed',
            error: error.message,
            timestamp: new Date().toISOString(),
            contact: contact
          });
          console.log(`❌ Message ${i + 1} error to ${formattedPhone}: ${error.message}`);
        }

        // Update report in real-time after each message
        const updatedReport = {
          ...report,
          successful: totalSuccessful,
          failed: totalFailed,
          pending: phoneNumbers.length - totalSuccessful - totalFailed,
          details,
          endTime: new Date().toISOString(),
          actualCost: (totalSuccessful * 0.0075).toFixed(2)
        };
        setCampaignReport(updatedReport);

        // Longer delay between messages to avoid rate limiting
        if (i < phoneNumbers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay between messages
        }
      }

      // Final campaign tracking update
      if (trackingEnabled) {
        await fetch('/api/campaigns/track', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId: newCampaignId,
            successful: totalSuccessful,
            failed: totalFailed,
            details: details,
            endTime: new Date().toISOString()
          })
        });
      }

      setSendStatus({
        success: totalFailed === 0,
        message: totalFailed === 0 
          ? `✅ All messages sent! ${totalSuccessful}/${phoneNumbers.length} messages delivered successfully`
          : `⚠️ Campaign completed: ${totalSuccessful} sent successfully, ${totalFailed} failed`
      });
      
      setShowReport(true);
      
      logActivity('sequential_sms_campaign', {
        campaignId: newCampaignId,
        total: phoneNumbers.length,
        successful: totalSuccessful,
        failed: totalFailed,
        messageLength: messageText.length,
        variablesUsed: messageText.match(/{[^}]+}/g)?.length || 0,
        method: 'one_by_one'
      });
      
    } catch (error: any) {
      setSendStatus({
        success: false,
        message: `❌ Campaign failed: ${error.message}`
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isActive) return null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold">Advanced Mass Messaging</h2>
          <div className="ml-4 px-3 py-1 bg-tech-card text-xs rounded-full text-primary flex items-center">
            <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse-slow"></span>
            AI-Powered Campaign Builder
          </div>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex items-center bg-tech-card rounded-lg p-1">
          <button
            onClick={() => setStandaloneMode(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !standaloneMode 
                ? 'bg-primary text-white' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Mass Campaign
          </button>
          <button
            onClick={() => setStandaloneMode(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              standaloneMode 
                ? 'bg-primary text-white' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Single Message
          </button>
        </div>
      </div>

      {standaloneMode ? (
        /* Standalone Message Mode */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {/* SMS Gateway Health Status */}
            <SMSGatewayHealthChecker />
            
            {/* User's SMS Gateway Status */}
            <SMSGatewayStatus />
            
            {/* Single Message Composer */}
            <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                  Send Single Message
                </h3>
                
                {/* Phone Number Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter phone number (e.g., 4176297373, +14176297373)"
                    value={singlePhone}
                    onChange={(e) => setSinglePhone(e.target.value)}
                    className="w-full p-3 bg-tech-input border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Format will be automatically adjusted (US numbers supported)
                    {singlePhone && (
                      <span className="ml-2 text-green-400">
                        → Will format to: {formatPhoneNumber(singlePhone)}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* SMS Provider Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SMS Provider
                  </label>
                  <div className="flex bg-tech-secondary rounded-lg p-1">
                    <button
                      onClick={() => setSmsProvider('jon-device')}
                      className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        smsProvider === 'jon-device'
                          ? 'bg-green-600 text-white'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      📱 Jon's Device (Recommended)
                    </button>
                    <button
                      onClick={() => setSmsProvider('personal')}
                      className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        smsProvider === 'personal'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      🔧 Personal Credentials
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {smsProvider === 'jon-device' ? (
                      <span className="text-green-400">✅ Using Jon's working Samsung device - Guaranteed delivery!</span>
                    ) : (
                      <span className="text-yellow-400">⚠️ Using personal credentials - May have delivery issues</span>
                    )}
                  </div>
                </div>

                {/* Message Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    className="w-full min-h-[120px] p-3 bg-tech-input border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Type your message here..."
                    value={singleMessage}
                    onChange={(e) => setSingleMessage(e.target.value)}
                  />
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                    <span>Characters: {singleMessage.length} / 1600</span>
                    <span>Est. Cost: $0.0075</span>
                  </div>
                </div>
                
                {/* Send Button */}
                <button
                  onClick={handleSendSingleMessage}
                  disabled={isSendingSingle || !singleMessage.trim() || !singlePhone.trim()}
                  className={`w-full px-6 py-3 rounded-md flex items-center justify-center space-x-2 text-white font-medium ${
                    isSendingSingle || !singleMessage.trim() || !singlePhone.trim()
                      ? 'bg-tech-secondary cursor-not-allowed'
                      : 'bg-gradient hover:shadow-primary'
                  } transition-shadow duration-300`}
                >
                  {isSendingSingle ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Send Message</span>
                    </>
                  )}
                </button>
                
                {sendStatus && (
                  <div className={`mt-4 p-3 rounded-md ${
                    sendStatus.success 
                      ? 'bg-green-900 bg-opacity-20 border border-green-500 text-green-400' 
                      : 'bg-red-900 bg-opacity-20 border border-red-500 text-red-400'
                  }`}>
                    {sendStatus.message}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Templates Sidebar for Single Messages */}
          <div className="space-y-6">
            <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
              <div className="h-1 bg-gradient-accent"></div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Quick Templates</h3>
                <div className="space-y-2">
                  {[
                    { name: 'Follow-up', template: 'Hi! Following up on our previous conversation. Is now a good time to discuss {topic}?' },
                    { name: 'Introduction', template: 'Hello! This is {your_name} from {company}. I wanted to reach out about {service}. Quick call?' },
                    { name: 'Appointment', template: 'Hi! This is a reminder about your appointment on {date} at {time}. Please confirm.' },
                    { name: 'Thank You', template: 'Thank you for your time today! Please let me know if you have any questions.' }
                  ].map((template, index) => (
                    <button
                      key={index}
                      onClick={() => setSingleMessage(template.template)}
                      className="w-full text-left p-3 bg-tech-secondary hover:bg-tech-border rounded transition-colors duration-200"
                    >
                      <div className="font-medium text-sm text-tech-foreground">{template.name}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {template.template.substring(0, 60)}...
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mass Campaign Mode */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Campaign Builder */}
          <div className="xl:col-span-2 space-y-6">
            {/* SMS Gateway Health Status */}
            <SMSGatewayHealthChecker />
            
            {/* SMS Provider Selection */}
            <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">SMS Provider</h3>
                <div className="flex bg-tech-secondary rounded-lg p-1">
                  <button
                    onClick={() => setSmsProvider('jon-device')}
                    className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      smsProvider === 'jon-device'
                        ? 'bg-green-600 text-white'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    📱 Jon's Device (Recommended)
                  </button>
                  <button
                    onClick={() => setSmsProvider('personal')}
                    className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      smsProvider === 'personal'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    🔧 Personal Credentials
                  </button>
                </div>
                <div className="mt-3 p-3 rounded-md bg-tech-secondary bg-opacity-50">
                  <div className="text-sm">
                    {smsProvider === 'jon-device' ? (
                      <>
                        <div className="text-green-400 font-medium">✅ Jon's Samsung Device</div>
                        <div className="text-gray-400 mt-1">
                          • Confirmed working for SMS delivery<br/>
                          • Samsung Galaxy device with SMS Gateway app<br/>
                          • Handles mass campaigns reliably<br/>
                          • Automatic conversation tracking
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-yellow-400 font-medium">⚠️ Personal Credentials</div>
                        <div className="text-gray-400 mt-1">
                          • May have delivery issues on some devices<br/>
                          • Motorola devices known to have problems<br/>
                          • Use only if you've tested delivery<br/>
                          • Requires manual credential setup
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          
          {/* Message Composer */}
          <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
            <div className="h-1 bg-gradient"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Campaign Message</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={optimizeWithAI}
                    disabled={aiOptimizing || !messageText.trim()}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                  >
                    {aiOptimizing ? '🤖 Optimizing...' : '🤖 AI Optimize'}
                  </button>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    disabled={!messageText.trim() || !previewContact}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                  >
                    👀 Preview
                  </button>
                </div>
              </div>
              
              <textarea
                className="w-full min-h-[200px] p-4 bg-tech-input border border-tech-border rounded-md text-tech-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
                placeholder="Create your personalized message template here...\n\nExample:\nHi {name}! I noticed {company} could benefit from digital marketing. Most {industry} businesses in {city} are missing out on 300% more leads. Quick 15-min call this {current_month}?\n\nBest,\nTRD Team"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              
              <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                <span>
                  Variables: {(messageText.match(/{[^}]+}/g) || []).length} | 
                  Characters: {messageText.length} / 1600
                </span>
                <span>
                  Est. Cost: ${((messageText.length / 160) * phoneNumbers.length * 0.01).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && previewContact && (
            <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Message Preview</h3>
                <div className="bg-tech-input border border-tech-border rounded-md p-4 mb-4">
                  <div className="text-sm text-gray-400 mb-2">
                    Preview for: {previewContact.name || previewContact.phone}
                  </div>
                  <div className="text-tech-foreground whitespace-pre-wrap">
                    {generatePreview()}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  This preview shows how your message will appear to the first contact in your list.
                </div>
              </div>
            </div>
          )}

          {/* Contact Upload */}
          <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
            <div className="h-1 bg-gradient-accent"></div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Upload Contact List</h3>
              
              <div className="border-2 border-dashed border-tech-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  id="csv-upload"
                  onChange={handleFileUpload}
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <div className="text-gray-300 mb-4">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                  </div>
                  <div className="text-lg text-gray-300 mb-2">Drop your CSV file here</div>
                  <div className="text-sm text-gray-500">
                    Supports Apollo exports, lead gen CSVs, and custom formats
                  </div>
                </label>
              </div>
              
              {fileName && (
                <div className="mt-4 flex items-center justify-between p-3 bg-green-900 bg-opacity-20 border border-green-500 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-green-400 font-medium">
                      {fileName} ({phoneNumbers.length} contacts)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setFileName('');
                      setPhoneNumbers([]);
                      setContactData([]);
                      setPreviewContact(null);
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Send Campaign */}
          <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Launch Campaign</h3>
                  <p className="text-gray-400 text-sm">
                    Ready to send to {phoneNumbers.length} contacts
                  </p>
                </div>
                <button
                  onClick={handleSendMessages}
                  disabled={isSending || !messageText.trim() || phoneNumbers.length === 0}
                  className={`px-6 py-3 rounded-md flex items-center space-x-2 text-white font-medium ${
                    isSending
                      ? 'bg-tech-secondary cursor-not-allowed'
                      : 'bg-gradient hover:shadow-primary'
                  } transition-shadow duration-300`}
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Launch Campaign</span>
                    </>
                  )}
                </button>
                
                {/* NEW SEND BUTTON - Simpler and more reliable */}
                <button
                  onClick={handleSendMessages}
                  disabled={isSending}
                  className={`ml-4 px-6 py-3 rounded-md flex items-center space-x-2 text-white font-medium ${
                    isSending || !messageText || phoneNumbers.length === 0
                      ? 'bg-gray-600 cursor-not-allowed opacity-50'
                      : 'bg-green-600 hover:bg-green-700'
                  } transition-colors duration-200`}
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Send ({phoneNumbers.length} contacts)</span>
                    </>
                  )}
                </button>
              </div>
              
              {sendStatus && (
                <div className={`mt-4 p-3 rounded-md ${
                  sendStatus.success 
                    ? 'bg-green-900 bg-opacity-20 border border-green-500 text-green-400' 
                    : 'bg-red-900 bg-opacity-20 border border-red-500 text-red-400'
                }`}>
                  {sendStatus.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Variable Library Sidebar */}
        <div className="space-y-6">
          {/* Variable Controls */}
          <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
            <div className="h-1 bg-gradient-accent"></div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Variable Library</h3>
                <button
                  onClick={() => setShowVariables(!showVariables)}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showVariables ? '−' : '+'}
                </button>
              </div>
              
              {showVariables && (
                <>
                  {/* Search */}
                  <input
                    type="text"
                    placeholder="Search variables..."
                    value={variableSearch}
                    onChange={(e) => setVariableSearch(e.target.value)}
                    className="w-full p-2 mb-3 bg-tech-input border border-tech-border rounded text-tech-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                  
                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 mb-4 bg-tech-input border border-tech-border rounded text-tech-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  >
                    {VARIABLE_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  
                  {/* Variable List */}
                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-1">
                      {filteredVariables.map((variable) => (
                        <button
                          key={variable.name}
                          onClick={() => insertVariable(variable.name)}
                          className="w-full text-left p-2 bg-tech-secondary hover:bg-tech-border rounded text-sm transition-colors duration-200"
                        >
                          <div className="font-mono text-primary">{`{${variable.name}}`}</div>
                          <div className="text-xs text-gray-400">{variable.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-400">
                    {filteredVariables.length} variables available
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Templates Library */}
          <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Template Library</h3>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showTemplates ? '−' : '+'}
                </button>
              </div>
              
              {showTemplates && (
                <>
                  {/* Template Category Filter */}
                  <select
                    value={selectedTemplateCategory}
                    onChange={(e) => setSelectedTemplateCategory(e.target.value)}
                    className="w-full p-2 mb-4 bg-tech-input border border-tech-border rounded text-tech-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  >
                    {TEMPLATE_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  
                  {/* Template List */}
                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {(QUICK_TEMPLATES as any)[selectedTemplateCategory]?.map((template: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => loadTemplate(template.template)}
                          className="w-full text-left p-3 bg-tech-secondary hover:bg-tech-border rounded transition-colors duration-200"
                        >
                          <div className="font-medium text-sm text-tech-foreground">{template.name}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {template.template.substring(0, 80)}...
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-400">
                    {(QUICK_TEMPLATES as any)[selectedTemplateCategory]?.length || 0} templates in {selectedTemplateCategory}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Campaign Report */}
          {showReport && campaignReport && (
            <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Campaign Report</h3>
                  <button
                    onClick={() => setShowReport(false)}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Campaign Summary */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-tech-secondary p-3 rounded">
                      <div className="text-gray-400">Total Recipients</div>
                      <div className="text-xl font-bold text-tech-foreground">{campaignReport.totalRecipients}</div>
                    </div>
                    <div className="bg-tech-secondary p-3 rounded">
                      <div className="text-gray-400">Success Rate</div>
                      <div className="text-xl font-bold text-green-400">
                        {((campaignReport.successful / campaignReport.totalRecipients) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-tech-secondary p-3 rounded">
                      <div className="text-gray-400">Successful</div>
                      <div className="text-xl font-bold text-green-400">{campaignReport.successful}</div>
                    </div>
                    <div className="bg-tech-secondary p-3 rounded">
                      <div className="text-gray-400">Failed</div>
                      <div className="text-xl font-bold text-red-400">{campaignReport.failed}</div>
                    </div>
                  </div>

                  {/* Cost Information */}
                  <div className="bg-tech-secondary p-3 rounded">
                    <div className="text-gray-400 text-sm">Campaign Cost</div>
                    <div className="flex justify-between">
                      <span>Estimated: ${campaignReport.estimatedCost}</span>
                      <span>Actual: ${campaignReport.actualCost || '0.00'}</span>
                    </div>
                  </div>

                  {/* Campaign Details */}
                  <div className="bg-tech-secondary p-3 rounded">
                    <div className="text-gray-400 text-sm mb-2">Campaign Info</div>
                    <div className="text-xs space-y-1">
                      <div>ID: {campaignReport.campaignId}</div>
                      <div>Started: {new Date(campaignReport.startTime).toLocaleString()}</div>
                      {campaignReport.endTime && (
                        <div>Completed: {new Date(campaignReport.endTime).toLocaleString()}</div>
                      )}
                    </div>
                  </div>

                  {/* Recent Message Details */}
                  {campaignReport.details && campaignReport.details.length > 0 && (
                    <div className="bg-tech-secondary p-3 rounded">
                      <div className="text-gray-400 text-sm mb-2">Recent Messages</div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {campaignReport.details.slice(-5).map((detail: any, index: number) => (
                          <div key={index} className="text-xs flex justify-between">
                            <span className="truncate mr-2">{detail.phone}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              detail.status === 'sent' 
                                ? 'bg-green-900 text-green-400' 
                                : 'bg-red-900 text-red-400'
                            }`}>
                              {detail.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
} 