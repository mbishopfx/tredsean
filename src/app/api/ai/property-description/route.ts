import { NextRequest, NextResponse } from 'next/server';

// Description generation system prompt
const DESCRIPTION_SYSTEM_PROMPT = `You are an expert Google Business Profile copywriter who specializes in helping agents create compelling business descriptions.
Your responses should be:
1. Concise but complete (150-200 words max)
2. Highlight the key features and benefits of the business
3. Include SEO-friendly keywords naturally
4. Be formatted for easy readability
5. Have a professional but conversational tone
6. Include a brief call-to-action
7. Emphasize the value of having an optimized Google Business Profile

You'll be given basic business information and should create a description that would convince the business owner to optimize their GBP with professional help.`;

// Different business types for tailored descriptions
const BUSINESS_TYPES = {
  restaurant: `${DESCRIPTION_SYSTEM_PROMPT}\nThis is for a restaurant or food service business. Emphasize aspects like cuisine type, dining experience, special dishes, hours, and local reputation.`,
  retail: `${DESCRIPTION_SYSTEM_PROMPT}\nThis is for a retail business. Emphasize aspects like product selection, shopping experience, unique offerings, and customer service.`,
  service: `${DESCRIPTION_SYSTEM_PROMPT}\nThis is for a service business. Emphasize aspects like expertise, experience, service quality, customer satisfaction, and service area.`,
  healthcare: `${DESCRIPTION_SYSTEM_PROMPT}\nThis is for a healthcare business. Emphasize aspects like expertise, patient care, specialties, facilities, and insurance acceptance.`,
  professional: `${DESCRIPTION_SYSTEM_PROMPT}\nThis is for a professional service (lawyer, accountant, etc). Emphasize aspects like expertise, credentials, specialized knowledge, and client results.`,
  fitness: `${DESCRIPTION_SYSTEM_PROMPT}\nThis is for a fitness or wellness business. Emphasize aspects like facilities, classes, trainers, results, and community atmosphere.`,
  general: `${DESCRIPTION_SYSTEM_PROMPT}\nThis is for a general business. Create a versatile description that can be adapted to most business types.`
};

export async function POST(request: NextRequest) {
  try {
    const { 
      business_name,
      business_type = 'general',
      location = '',
      business_features = '',
      years_in_business = '',
      target_keywords = ''
    } = await request.json();
    
    if (!business_name || business_name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }
    
    // Get OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // If no API key, provide sample descriptions
      const mockDescriptions: {[key: string]: string} = {
        "general": `${business_name} has been proudly serving ${location || 'the local community'} ${years_in_business ? `for over ${years_in_business} years` : 'with distinction'}. Known for ${business_features || 'exceptional service and attention to detail'}, we pride ourselves on putting our customers first.\n\nOur Google Business Profile helps new customers discover our services daily, but it's only as effective as the information it contains. An optimized profile can dramatically increase your visibility and attract more ideal customers.\n\nContact us today to schedule a free consultation and learn how we can help your business stand out in Google searches and attract more customers.`,
        "restaurant": `At ${business_name}, we invite you to experience ${business_features || 'delicious cuisine in a welcoming atmosphere'}. ${location ? `Located in the heart of ${location}, we` : 'We'} serve up authentic flavors that keep our customers coming back.\n\nOur Google Business Profile brings in new diners every day who find us through local searches, but an optimized profile can dramatically increase your visibility and showcase your best dishes to hungry searchers.\n\nContact us today to learn how we can help your restaurant stand out in local search results and attract more reservations.`,
        "service": `${business_name} delivers premium ${business_features || 'services'} to ${location || 'customers'} ${years_in_business ? `with ${years_in_business} years of trusted experience` : 'with trusted expertise'}. Our dedicated team ensures each client receives personalized attention and exceptional results.\n\nYour Google Business Profile is often the first impression potential customers have of your business. An optimized profile helps you appear in more local searches and converts more viewers into paying customers.\n\nContact us today to schedule your consultation and discover how we can enhance your online presence to drive more qualified leads to your business.`
      };
      
      return NextResponse.json({ 
        description: mockDescriptions[business_type] || mockDescriptions["general"],
        note: "Using sample description (OPENAI_API_KEY not configured)"
      });
    }
    
    // Get the appropriate business type system prompt
    const systemPrompt = BUSINESS_TYPES[business_type as keyof typeof BUSINESS_TYPES] || BUSINESS_TYPES.general;
    
    // Create user prompt with all the details
    const userPrompt = `Create a compelling Google Business Profile description for ${business_name}.
Business type: ${business_type}
${location ? `Location: ${location}` : ''}
${business_features ? `Key features/specialties: ${business_features}` : ''}
${years_in_business ? `Years in business: ${years_in_business}` : ''}
${target_keywords ? `Target keywords: ${target_keywords}` : ''}

The description should convince business owners of the value of having a professionally optimized Google Business Profile and include a call to action to schedule a meeting with our closers.`;
    
    // Format the payload for OpenAI API
    const payload = {
      model: "gpt-4-turbo",
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
      max_tokens: 500,
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
        { error: data.error?.message || 'Failed to generate description' },
        { status: response.status }
      );
    }
    
    // Extract the description from the response
    const description = data.choices[0]?.message?.content?.trim();
    
    if (!description) {
      return NextResponse.json(
        { error: 'No description was generated' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ description, business_type });
    
  } catch (error) {
    console.error('Error generating business description:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 