'use client';

import { useState, useEffect, useRef } from 'react';
import { SMSGatewayHealthChecker } from './SMSGatewayHealthChecker';
import { SMSGatewayStatus } from './SMSGatewayStatus';
import { saveCampaignResults, saveActivityLog, saveCleanedCSV } from '../../lib/supabase';

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

// Add new interface for console logs near the top with other interfaces
interface ConsoleLog {
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

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
  
  // Always use personal SMS Gateway - no provider selection needed

  // Add new state for console logs
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

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
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    setFileName(file.name);
    
    try {
      const text = await file.text();
      
      // Better CSV parsing that handles quoted fields and commas within quotes
      const parseCSVLine = (line: string): string[] => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const nextChar = line[i + 1];
          
          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              // Escaped quote
              current += '"';
              i++; // Skip next quote
            } else {
              // Toggle quote state
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            // End of field
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        
        // Add the last field
        result.push(current.trim());
        return result;
      };
      
      // Function to validate and clean phone numbers
      const isValidPhoneNumber = (value: string): string | null => {
        if (!value || typeof value !== 'string') return null;
        
        // Skip obvious non-phone values
        const lowerValue = value.toLowerCase();
        if (lowerValue.includes('suite') || 
            lowerValue.includes('c-suite') || 
            lowerValue.includes('operations') || 
            lowerValue.includes('sales') || 
            lowerValue.includes('marketing') || 
            lowerValue.includes('finance') ||
            lowerValue.includes('department') ||
            lowerValue.length < 10) {
          return null;
        }
        
        // Extract only digits and + sign
        const cleanPhone = value.replace(/[^\d+]/g, '');
        
        // Check if it's a valid phone number format
        if (cleanPhone.length >= 10) {
          // Remove leading 1 if it's 11 digits and starts with 1
          if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
            return '+1' + cleanPhone.substring(1);
          }
          // Add +1 if it's 10 digits
          else if (cleanPhone.length === 10) {
            return '+1' + cleanPhone;
          }
          // Keep as is if it already has country code
          else if (cleanPhone.length > 10) {
            return cleanPhone.startsWith('+') ? cleanPhone : '+' + cleanPhone;
          }
        }
        
        return null;
      };
      
      const rows = text.split('\n').filter(row => row.trim());
      const headers = parseCSVLine(rows[0]).map(header => 
        header.trim().toLowerCase().replace(/['"]/g, '')
      );
      
      addConsoleLog(`CSV Headers found: ${headers.join(', ')}`, 'info');
      
      // Enhanced phone number detection for Apollo and other formats
      const phoneColumns = headers.filter(header => 
        header.includes('phone') || 
        header.includes('mobile') || 
        header.includes('cell') ||
        header.includes('direct') ||
        header === 'work direct phone' ||
        header === 'mobile phone' ||
        header === 'other phone'
      );
      
      addConsoleLog(`Phone columns detected: ${phoneColumns.join(', ')}`, 'info');
      
      const contacts: ContactData[] = [];
      const phones: string[] = [];
      const seenPhones = new Set<string>(); // Track duplicates
      let duplicateCount = 0;
      let tollFreeCount = 0;
      
      // Process each row after headers
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue; // Skip empty rows
        
        const values = parseCSVLine(rows[i]);
        const contact: ContactData = { phone: '' }; // Initialize with required phone field
        
        // Map CSV columns to contact data
        headers.forEach((header, index) => {
          if (values[index] && values[index].trim()) {
            const cleanValue = values[index].trim().replace(/['"]/g, '');
            contact[header] = cleanValue;
          }
        });
        
        // Try to find a valid phone number from phone columns first
        let foundPhone = '';
        for (const phoneCol of phoneColumns) {
          if (contact[phoneCol]) {
            const validPhone = isValidPhoneNumber(contact[phoneCol]);
            if (validPhone) {
              foundPhone = validPhone;
              addConsoleLog(`Row ${i + 1}: Found phone in "${phoneCol}": ${validPhone}`, 'info');
              break;
            }
          }
        }
        
        // If no phone found in dedicated columns, try all fields
        if (!foundPhone) {
          for (const [key, value] of Object.entries(contact)) {
            if (typeof value === 'string') {
              const validPhone = isValidPhoneNumber(value);
              if (validPhone) {
                foundPhone = validPhone;
                addConsoleLog(`Row ${i + 1}: Found phone in "${key}": ${validPhone}`, 'info');
                break;
              }
            }
          }
        }
        
        if (foundPhone) {
          // Check for toll-free numbers (800, 888, 877, 866, 855, 844, 833)
          const phoneDigits = foundPhone.replace(/[^\d]/g, '');
          const areaCode = phoneDigits.substring(phoneDigits.length - 10, phoneDigits.length - 7);
          
          if (['800', '888', '877', '866', '855', '844', '833'].includes(areaCode)) {
            addConsoleLog(`Row ${i + 1}: Skipping toll-free number ${foundPhone}`, 'warning');
            tollFreeCount++;
            continue;
          }
          
          // Check for duplicates
          if (seenPhones.has(foundPhone)) {
            addConsoleLog(`Row ${i + 1}: Duplicate phone number ${foundPhone}`, 'warning');
            duplicateCount++;
            continue;
          }
          
          seenPhones.add(foundPhone);
          contact.phone = foundPhone;
          
          // Enhanced name processing for Apollo format
          if (!contact.first_name && contact['first name']) {
            contact.first_name = contact['first name'];
          }
          if (!contact.last_name && contact['last name']) {
            contact.last_name = contact['last name'];
          }
          if (!contact.company && contact['company name for emails']) {
            contact.company = contact['company name for emails'];
          }
          if (!contact.name && contact.first_name) {
            contact.name = contact.first_name + (contact.last_name ? ' ' + contact.last_name : '');
          }
          
          contacts.push(contact);
          phones.push(foundPhone);
          addConsoleLog(`Row ${i + 1}: Added contact: ${contact.first_name || contact.name || 'Unknown'} - ${foundPhone}`, 'success');
        } else {
          addConsoleLog(`Row ${i + 1}: No valid phone number found`, 'warning');
        }
      }
      
      setContactData(contacts);
      setPhoneNumbers(phones);
      setPreviewContact(contacts[0] || null);
      
      // Summary message
      const totalRows = rows.length - 1; // Exclude header
      const successMessage = `Successfully loaded ${contacts.length} contacts with valid phone numbers out of ${totalRows} total rows.`;
      const detailMessage = duplicateCount > 0 || tollFreeCount > 0 ? 
        ` ${duplicateCount} duplicates and ${tollFreeCount} toll-free numbers were filtered out.` : '';
      
      addConsoleLog(successMessage + detailMessage, 'success');
      
      setSendStatus({
        success: contacts.length > 0,
        message: contacts.length > 0 ? 
          `✅ ${successMessage}${detailMessage}` : 
          '❌ No valid phone numbers found in CSV. Please check your file format.'
      });
      
    } catch (error: any) {
      addConsoleLog(`Error parsing CSV: ${error.message}`, 'error');
      console.error('Error parsing CSV:', error);
      setSendStatus({
        success: false,
        message: `❌ Error parsing CSV: ${error.message}`
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

  // Add function to add console logs
  const addConsoleLog = (message: string, type: ConsoleLog['type'] = 'info') => {
    setConsoleLogs(prev => [...prev, {
      timestamp: new Date(),
      message,
      type
    }]);
    
    // Auto-scroll to bottom without disrupting UI - only if user is near bottom
    setTimeout(() => {
      const consoleContainer = consoleEndRef.current?.parentElement;
      if (consoleContainer) {
        const isNearBottom = consoleContainer.scrollTop + consoleContainer.clientHeight >= consoleContainer.scrollHeight - 50;
        if (isNearBottom) {
          consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 100);
  };

  // Copy console logs to clipboard
  const copyConsoleLogs = async () => {
    const logText = consoleLogs.map(log => 
      `[${log.timestamp.toLocaleTimeString()}] ${log.type.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(logText);
      // Add a brief success indication without disrupting the UI
      const originalLength = consoleLogs.length;
      setConsoleLogs(prev => [...prev, {
        timestamp: new Date(),
        message: '📋 Console logs copied to clipboard',
        type: 'info'
      }]);
      
      // Remove the success message after 2 seconds
      setTimeout(() => {
        setConsoleLogs(prev => prev.slice(0, originalLength));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy logs:', error);
    }
  };

  const handleSendSingleMessage = async () => {
    if (!singleMessage.trim() || !singlePhone.trim() || isSendingSingle) return;
    
    setIsSendingSingle(true);
    addConsoleLog(`Sending message to ${formatPhoneNumber(singlePhone)}...`, 'info');
    
    try {
      // Always use personal SMS Gateway credentials
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

      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumbers: [singlePhone],
          message: singleMessage,
          provider: 'personal',
          credentials: transformedCredentials,
          contactData: [{ phone: singlePhone }],
          campaignId: `single_${Date.now()}`
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSendStatus({
          success: true,
          message: `✅ Message sent successfully to ${singlePhone}`
        });
        setSingleMessage('');
        setSinglePhone('');
        
        // Log activity
        logActivity('Single SMS Sent', {
          phone: singlePhone,
          messageLength: singleMessage.length,
          timestamp: new Date().toISOString()
        });

        // Save to Supabase storage
        try {
          const username = typeof window !== 'undefined' ? 
            localStorage.getItem('username') || 'unknown' : 'unknown';
          
          await saveActivityLog(username, 'single_sms_sent', {
            phone: singlePhone,
            messageLength: singleMessage.length,
            message: singleMessage.substring(0, 100) + '...',
            provider: 'personal',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Failed to save activity log:', error);
        }

        addConsoleLog(`Message sent successfully to ${singlePhone}`, 'success');
      } else {
        setSendStatus({
          success: false,
          message: `❌ Failed to send message: ${data.error || 'Unknown error'}`
        });
        addConsoleLog(`Failed to send message to ${singlePhone}: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (error: any) {
      setSendStatus({
        success: false,
        message: `❌ Error sending message: ${error.message}`
      });
      addConsoleLog(`Failed to send message to ${singlePhone}: ${error.message}`, 'error');
    } finally {
      setIsSendingSingle(false);
    }
  };

  const personalizeMessage = (message: string, contact: ContactData) => {
    let personalized = message;
    
    // Debug logging
    addConsoleLog(`Personalizing message for contact:`, 'info');
    addConsoleLog(`Contact data: ${JSON.stringify(contact)}`, 'info');
    addConsoleLog(`Original message: ${message}`, 'info');
    
    // Pre-process name fields if we have a full name but need first/last name
    if (contact.name && !contact.first_name) {
      const nameParts = contact.name.split(' ');
      contact.first_name = nameParts[0];
      if (nameParts.length > 1) {
        contact.last_name = nameParts.slice(1).join(' ');
      }
      addConsoleLog(`Split name "${contact.name}" into first_name: "${contact.first_name}", last_name: "${contact.last_name}"`, 'info');
    }

    // Common field mappings for CSV column variations
    const fieldMappings: { [key: string]: string[] } = {
      'first_name': ['first_name', 'firstname', 'fname', 'first'],
      'last_name': ['last_name', 'lastname', 'lname', 'last'],
      'name': ['name', 'full_name', 'fullname'],
      'company': ['company', 'company_name', 'organization', 'business'],
      'email': ['email', 'email_address', 'emailaddress'],
      'phone': ['phone', 'phone_number', 'phonenumber', 'mobile', 'cell']
    };

    // First try direct variable replacement
    Object.entries(contact).forEach(([key, value]) => {
      if (value) {
        const regex = new RegExp(`{${key}}`, 'gi');
        personalized = personalized.replace(regex, value.toString());
        if (personalized !== message) {
          addConsoleLog(`Replaced {${key}} with ${value}`, 'info');
        }
      }
    });

    // Then try mapped variations
    Object.entries(fieldMappings).forEach(([standardKey, variations]) => {
      variations.forEach(variant => {
        if (contact[variant]) {
          const regex = new RegExp(`{${standardKey}}`, 'gi');
          personalized = personalized.replace(regex, contact[variant]?.toString() || '');
          if (personalized !== message) {
            addConsoleLog(`Mapped {${standardKey}} to ${variant} value: ${contact[variant]}`, 'info');
          }
        }
      });
    });

    // Replace system variables
    const systemVariables = {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      current_month: new Date().toLocaleString('default', { month: 'long' }),
      current_year: new Date().getFullYear().toString(),
      day_of_week: new Date().toLocaleString('default', { weekday: 'long' })
    };

    Object.entries(systemVariables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'gi');
      personalized = personalized.replace(regex, value);
      if (personalized !== message) {
        addConsoleLog(`Replaced system variable {${key}} with ${value}`, 'info');
      }
    });
    
    // Debug logging
    addConsoleLog(`Final personalized message: ${personalized}`, 'info');
    
    return personalized;
  };

  // Update handleSendMessages to handle Jose's device
  const handleSendMessages = async () => {
    if (!messageText.trim() || phoneNumbers.length === 0 || isSending) return;
    
    setIsSending(true);
    addConsoleLog(`Starting campaign to ${phoneNumbers.length} recipients...`, 'info');
    
    try {
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
        messagePreview: messageText.substring(0, 100) + '...',
        estimatedCost: (phoneNumbers.length * 0.0075).toFixed(2)
      };
      
      setCampaignReport(report);
      setSendStatus(null);

      // Add delay function
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Calculate delay based on list size
      const getDelay = (listSize: number) => {
        if (listSize <= 100) return 2000; // 2 seconds for small lists
        if (listSize <= 300) return 3000; // 3 seconds for medium lists
        return 4000; // 4 seconds for large lists (300+)
      };
      
      const delayTime = getDelay(contactData.length);
      addConsoleLog(`Setting ${delayTime/1000} second delay between messages for list size ${contactData.length}`, 'info');

      // Process each contact with delay
      for (let i = 0; i < contactData.length; i++) {
        const contact = contactData[i];
        const personalizedMessage = personalizeMessage(messageText, contact);
        
        // Add progress percentage
        const progress = Math.round((i / contactData.length) * 100);
        addConsoleLog(`Processing ${contact.phone} (${i + 1}/${contactData.length} - ${progress}%)...`, 'info');
        
        try {
          // Always use personal SMS Gateway credentials
          const storedCredentials = localStorage.getItem('personalSMSCredentials');
          const personalSMSCredentials = storedCredentials ? JSON.parse(storedCredentials) : null;
          
          if (!personalSMSCredentials) {
            throw new Error('Personal SMS credentials not found. Please log in again.');
          }

          // Transform credentials for SMS Gateway compatibility
          const transformedCredentials = personalSMSCredentials?.provider === 'smsgateway' ? {
            ...personalSMSCredentials,
            username: personalSMSCredentials.cloudUsername || personalSMSCredentials.username,
            password: personalSMSCredentials.cloudPassword || personalSMSCredentials.password
          } : personalSMSCredentials;

          const response = await fetch('/api/sms/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumbers: [contact.phone],
              message: personalizedMessage,
              provider: 'personal',
              credentials: transformedCredentials,
              contactData: [contact],
              campaignId: `${newCampaignId}_${i}`
            }),
          });

          if (!response) {
            throw new Error('No response received from SMS gateway');
          }

          const data = await response.json();
          
          if (response.ok) {
            report.successful++;
            report.details.push({
              phone: contact.phone,
              status: 'sent',
              timestamp: new Date().toISOString()
            });
            addConsoleLog(`✓ Sent to ${contact.phone}`, 'success');
          } else {
            report.failed++;
            report.details.push({
              phone: contact.phone,
              status: 'failed',
              error: data.error,
              timestamp: new Date().toISOString()
            });
            addConsoleLog(`✕ Failed to send to ${contact.phone}: ${data.error}`, 'error');
          }
        } catch (error: any) {
          report.failed++;
          report.details.push({
            phone: contact.phone,
            status: 'failed',
            error: error.message,
            timestamp: new Date().toISOString()
          });
          addConsoleLog(`✕ Error sending to ${contact.phone}: ${error.message}`, 'error');
        }
        
        report.pending--;
        setCampaignReport({ ...report });

        // Add delay between messages, but not after the last message
        if (i < contactData.length - 1) {
          addConsoleLog(`Waiting ${delayTime/1000} seconds before next message...`, 'info');
          await delay(delayTime);
        }
      }

      // Final status update
      if (report.failed === 0) {
        setSendStatus({
          success: true,
          message: `✅ Campaign completed successfully! Sent to ${report.successful} recipients.`
        });
        addConsoleLog(`Campaign completed successfully! Sent to ${report.successful} recipients`, 'success');
      } else {
        setSendStatus({
          success: false,
          message: `⚠️ Campaign completed with ${report.failed} failures. ${report.successful} messages sent successfully.`
        });
        addConsoleLog(`Campaign completed with ${report.failed} failures. ${report.successful} messages sent successfully.`, 'warning');
      }
      
    } catch (error: any) {
      setSendStatus({
        success: false,
        message: `❌ Campaign failed: ${error.message}`
      });
      addConsoleLog(`Campaign failed: ${error.message}`, 'error');
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
                
                {/* SMS Provider Status */}
                <div className="bg-tech-secondary rounded-lg p-3">
                  <div className="flex items-center justify-center">
                    <span className="text-purple-400">🔧 Using Personal SMS Gateway</span>
                  </div>
                  <div className="text-xs text-gray-400 text-center mt-1">
                    <span>Messages sent via your personal Gate-SMS credentials</span>
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
            
            {/* Message Composer */}
            <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
              <div className="h-1 bg-gradient"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Campaign Message</h3>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-400">SMS Gateway Connected</span>
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
            {/* Console Output */}
            <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Console Output</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">{consoleLogs.length} entries</span>
                    <button
                      onClick={copyConsoleLogs}
                      className="text-gray-400 hover:text-blue-400 transition-colors text-sm px-2 py-1 rounded hover:bg-tech-secondary flex items-center gap-1"
                      title="Copy all logs to clipboard"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                    <button
                      onClick={() => setConsoleLogs([])}
                      className="text-gray-400 hover:text-red-400 transition-colors text-sm px-2 py-1 rounded hover:bg-tech-secondary flex items-center gap-1"
                      title="Clear all logs"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear
                    </button>
                  </div>
                </div>
                
                <div className="bg-[#1E1E1E] rounded-lg p-3 h-[300px] overflow-y-auto font-mono text-sm">
                  {consoleLogs.map((log, index) => (
                    <div key={index} className="mb-2 leading-relaxed">
                      <span className="text-gray-500 text-xs">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      <span className={`ml-2 ${
                        log.type === 'success' ? 'text-green-400' :
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'warning' ? 'text-yellow-400' :
                        'text-gray-300'
                      }`}>
                        {log.type === 'success' ? '✓ ' :
                         log.type === 'error' ? '✕ ' :
                         log.type === 'warning' ? '⚠ ' :
                         'ℹ '}
                        {log.message}
                      </span>
                    </div>
                  ))}
                  <div ref={consoleEndRef} />
                </div>
              </div>
            </div>

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