import { NextRequest, NextResponse } from 'next/server';

// Rebuttal generation system prompt with GBP sales context
const REBUTTAL_SYSTEM_PROMPT = `You are an expert Google Business Profile sales coach specializing in helping agents overcome objections during calls.
Your responses should be:
1. Concise and direct (2-3 sentences max)
2. Persuasive without being pushy
3. Professional but conversational
4. Focused on addressing the specific objection
5. Formatted for easy reading aloud during a live call
6. Emphasize the value of Google Business Profile optimization
7. Include specific statistics or benefits when possible
8. End with a gentle call to action aimed at scheduling a meeting with a closer

You'll be given a brief description of an objection or hurdle a business prospect has raised.
Provide an effective, natural-sounding response that helps the agent overcome this objection and move the prospect closer to scheduling a meeting.`;

// Different rebuttal styles based on prospect type
const REBUTTAL_STYLES = {
  standard: REBUTTAL_SYSTEM_PROMPT,
  aggressive: `${REBUTTAL_SYSTEM_PROMPT}\nUse a more confident and direct approach. Focus on creating urgency and emphasizing missed opportunities if they don't optimize their Google Business Profile quickly.`,
  consultative: `${REBUTTAL_SYSTEM_PROMPT}\nUse a more educational and consultative approach. Focus on providing value, insights about local search, and position yourself as a trusted advisor rather than a salesperson.`,
  empathetic: `${REBUTTAL_SYSTEM_PROMPT}\nUse a more understanding and empathetic approach. Acknowledge their concerns sincerely before providing gentle guidance on how GBP optimization can help address those business challenges.`
};

export async function POST(request: NextRequest) {
  try {
    const { objection, style = 'standard' } = await request.json();
    
    if (!objection || objection.trim().length === 0) {
      return NextResponse.json(
        { error: 'Objection description is required' },
        { status: 400 }
      );
    }
    
    // Get OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // If no API key, provide some sample rebuttals for common GBP sales objections
      const mockRebuttals: {[key: string]: string} = {
        "busy": "I completely understand you're busy running your business. That's exactly why our clients work with us - we handle the Google Business Profile optimization while you focus on your core operations. Could I schedule just 15 minutes with our specialist to show you the impact?",
        "already have": "Having a Google listing is a great start. Our data shows that optimized profiles get 7x more engagement than basic ones. Our specialist can review your current profile and show you specifically where you're missing opportunities. Would tomorrow at 2pm work for a quick review?",
        "think about it": "That's a sensible approach. While you're considering, I can send you a quick analysis of your current Google visibility compared to competitors. This will help inform your decision. What email should I send that report to?",
        "too expensive": "I appreciate your concern about investment. Our clients typically see a 3-5x return through increased calls and website visits. Rather than focus on cost, I'd like our specialist to show you the expected ROI for your specific business. When would be a good time?",
        "bad timing": "Market timing is crucial in local search. With recent Google algorithm changes, businesses that optimize now are gaining significant advantages. I'd like our specialist to share some insights about these changes. Would a 15-minute call tomorrow be helpful?",
        "doing fine without it": "I'm glad your business is doing well. Many of our most successful clients came to us when they were already successful but wanted to reach the next level. Our data shows that even established businesses typically find 20-30% more customers with proper GBP optimization. Could I schedule a specialist to show you how?"
      };
      
      // Find the closest matching mock rebuttal
      let closestMatch = "think about it"; // default
      for (const key in mockRebuttals) {
        if (objection.toLowerCase().includes(key)) {
          closestMatch = key;
          break;
        }
      }
      
      return NextResponse.json({ 
        rebuttal: mockRebuttals[closestMatch],
        note: "Using sample rebuttal (OPENAI_API_KEY not configured)"
      });
    }
    
    // Get the appropriate style system prompt
    const systemPrompt = REBUTTAL_STYLES[style as keyof typeof REBUTTAL_STYLES] || REBUTTAL_STYLES.standard;
    
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
          content: objection
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
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
        { error: data.error?.message || 'Failed to generate rebuttal' },
        { status: response.status }
      );
    }
    
    // Extract the rebuttal from the response
    const rebuttal = data.choices[0]?.message?.content?.trim();
    
    if (!rebuttal) {
      return NextResponse.json(
        { error: 'No rebuttal was generated' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ rebuttal, style });
    
  } catch (error) {
    console.error('Error generating rebuttal:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 