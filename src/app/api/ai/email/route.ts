import { NextRequest, NextResponse } from 'next/server';

// Email generation system prompt
const EMAIL_SYSTEM_PROMPT = `You are an expert copywriter who specializes in helping Google Business Profile sales agents craft effective follow-up emails.
Your responses should be:
1. Concise but complete (3-5 short paragraphs)
2. Personalized based on the provided context
3. Compelling without being pushy
4. Professional but conversational in tone
5. Include a clear, low-pressure call to action focused on scheduling a meeting with a closer
6. Formatted for easy reading (with proper spacing between paragraphs)
7. Free of typos and grammatical errors
8. Optimized for high open and response rates
9. Highlight the benefits of Google Business Profile optimization

You'll be given a brief description of the business prospect and the purpose of the email.
Provide an effective, ready-to-send email that will help the agent move the conversation toward scheduling a meeting with a closer.`;

// Different email types for common Google Business Profile sales scenarios
const EMAIL_TYPES = {
  followup: `${EMAIL_SYSTEM_PROMPT}\nThis is a follow-up email after an initial conversation about Google Business Profile services. Focus on reinforcing the benefits discussed, addressing any concerns mentioned, and suggesting a specific meeting time with a GBP specialist.`,
  introduction: `${EMAIL_SYSTEM_PROMPT}\nThis is an introductory email to a potential business client. Focus on the value of Google Business Profile optimization, your company's track record helping similar businesses, and request for a brief consultation with a GBP specialist.`,
  cold_outreach: `${EMAIL_SYSTEM_PROMPT}\nThis is a cold outreach email to a business that might benefit from Google Business Profile optimization. Focus on specific pain points for their industry, demonstrate knowledge of their business challenges, and suggest a no-obligation consultation with a GBP specialist.`,
  reconnect: `${EMAIL_SYSTEM_PROMPT}\nThis is an email to reconnect with a business prospect who hasn't responded in a while. Focus on providing value (new Google updates, new case study), referencing past interactions positively, and suggesting a meeting with a GBP specialist.`,
  case_study: `${EMAIL_SYSTEM_PROMPT}\nThis is an email sharing a case study or success story with a prospect. Focus on highlighting specific results achieved for a similar business, explain how this relates to their situation, and suggest a meeting with a GBP specialist to explore similar results.`,
  analytics_review: `${EMAIL_SYSTEM_PROMPT}\nThis is an email offering a free Google Business Profile analytics review to a prospect. Focus on the insights they'll gain, the value of understanding their current performance, and scheduling a meeting with a specialist to review the findings.`,
};

export async function POST(request: NextRequest) {
  try {
    const { 
      prospect_name,
      business_name,
      type = 'followup',
      context = '',
      agent_name = 'Me',
      agent_title = 'Google Business Profile Consultant',
      agent_phone = '',
      agent_company = '',
      include_signature = true
    } = await request.json();
    
    if (!prospect_name || prospect_name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prospect name is required' },
        { status: 400 }
      );
    }
    
    // Get OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // If no API key, provide sample emails for common scenarios
      const mockEmails: {[key: string]: string} = {
        "followup": `Hi ${prospect_name},\n\nThank you for our conversation about optimizing ${business_name || "your business"}'s Google Business Profile. As mentioned, businesses with optimized GBP listings typically see a 70% increase in customer actions (calls, direction requests, and website visits).\n\nBased on our quick review, I believe there are several opportunities to enhance your visibility in local searches and drive more qualified leads to your business. Our specialist would like to show you exactly where these opportunities exist in your specific market.\n\nWould you be available for a 15-minute call this week with our Google Business Profile expert? They're available Tuesday at 10am or Thursday at 2pm. This consultation is complimentary and designed to show you the specific improvements we can make to your online presence.\n\nLooking forward to connecting you with our specialist,\n\n${agent_name}\n${agent_title}\n${agent_phone}`,
        
        "introduction": `Hi ${prospect_name},\n\nI'm reaching out because I noticed ${business_name || "your business"} could benefit from an optimized Google Business Profile. Did you know that 46% of all Google searches have local intent, and 88% of people who search for a local business on their smartphone visit that business within 24 hours?\n\nOur team specializes in helping businesses like yours maximize visibility in local searches. We've helped over 200 businesses increase their customer engagement through strategic Google Business Profile optimization, resulting in an average of 37% more calls and direction requests.\n\nI'd like to introduce you to our Google Business Profile specialist who can provide a complimentary review of your current online presence and show you specific improvements that could drive more customers to your door.\n\nWould you be available for a quick 15-minute introduction call this week? Our specialist can share some insights specific to ${business_name || "your industry"} and answer any questions you might have.\n\nBest regards,\n\n${agent_name}\n${agent_title}\n${agent_phone}`,
        
        "analytics_review": `Hi ${prospect_name},\n\nI hope this email finds you well. I'd like to offer you a complimentary Google Business Profile analytics review for ${business_name || "your business"}.\n\nThis review will provide you with valuable insights including:\n- How customers are finding you in Google Search and Maps\n- Which search queries are bringing visitors to your business\n- How your listing performs compared to competitors in your area\n- Specific recommendations to increase your visibility and customer actions\n\nOur specialists have helped businesses achieve 3-5x more customer interactions through strategic profile optimization. I'd like to connect you with one of our GBP experts to walk through your analytics and explain the opportunities specific to your business.\n\nAre you available for a 20-minute call this Thursday or Friday afternoon? The specialist will prepare a custom report for you in advance.\n\nLooking forward to helping you attract more customers,\n\n${agent_name}\n${agent_title}\n${agent_phone}`
      };
      
      return NextResponse.json({ 
        email: mockEmails[type] || mockEmails["followup"],
        note: "Using sample email (OPENAI_API_KEY not configured)"
      });
    }
    
    // Get the appropriate email type system prompt
    const systemPrompt = EMAIL_TYPES[type as keyof typeof EMAIL_TYPES] || EMAIL_TYPES.followup;
    
    // Create user prompt with all the details
    const userPrompt = `Create an email to ${prospect_name} about Google Business Profile optimization services.
${business_name ? `Business name: ${business_name}` : ''}
Email type: ${type}
Additional context: ${context}
My name: ${agent_name}
${agent_title ? `My title: ${agent_title}` : ''}
${agent_company ? `My company: ${agent_company}` : ''}

The email should focus on the benefits of Google Business Profile optimization and include a call to action to schedule a meeting with our closer/specialist.`;
    
    // Format the payload for OpenAI API
    const payload = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 700,
      top_p: 1,
      frequency_penalty: 0.2,
      presence_penalty: 0.1
    };
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Failed to generate email' },
        { status: response.status }
      );
    }
    
    // Extract the email from the response
    let email = data.choices[0]?.message?.content?.trim();
    
    if (!email) {
      return NextResponse.json(
        { error: 'No email was generated' },
        { status: 500 }
      );
    }
    
    // Add signature if requested
    if (include_signature && !email.includes(agent_name)) {
      const signature = `\n\n${agent_name}${agent_title ? `\n${agent_title}` : ''}${agent_company ? `\n${agent_company}` : ''}${agent_phone ? `\n${agent_phone}` : ''}`;
      email += signature;
    }
    
    return NextResponse.json({ email, type });
    
  } catch (error) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 