import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, messages } = await request.json();

    if (!phoneNumber || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Phone number and messages array are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Format the conversation for AI analysis
    const conversationText = messages.map(msg => {
      const direction = (msg.direction === 'outbound' || msg.direction === 'outbound-api') ? 'TRD Agent' : 'Customer';
      const timestamp = new Date(msg.dateCreated).toLocaleString();
      return `[${timestamp}] ${direction}: ${msg.body}`;
    }).join('\n');

    // Create the prompt for TRD meeting scheduling
    const prompt = `You are an AI assistant helping TRD (Thompson Real Estate Development) agents craft effective SMS responses to schedule meetings with potential clients.

ABOUT TRD:
- TRD is a real estate development company
- They help clients with property investments, development opportunities, and real estate ventures
- Their goal is to schedule face-to-face or virtual meetings to discuss opportunities
- They use a consultative, professional but friendly approach

CONVERSATION HISTORY:
${conversationText}

TASK:
Analyze this SMS conversation and suggest a casual, friendly but professional response that:

1. Acknowledges the customer's previous message naturally
2. Builds rapport and trust
3. Gently guides toward scheduling a meeting or call
4. Keeps the tone conversational and not pushy
5. Is appropriate for SMS (concise, under 160 characters if possible)
6. Sounds human and authentic, not robotic
7. Creates urgency without being aggressive
8. Offers value or benefit for meeting

RESPONSE GUIDELINES:
- Use a warm, conversational tone
- Be specific about what the meeting would cover
- Offer flexibility (phone call, video call, or in-person)
- Include a soft call-to-action
- Avoid being too sales-y or formal
- Use casual language appropriate for SMS

Please provide ONLY the suggested SMS response text, nothing else. Do not include quotation marks or any explanatory text.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at crafting effective, casual SMS responses for real estate professionals. Always respond with just the suggested message text, no additional formatting or explanation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const suggestedResponse = completion.choices[0]?.message?.content?.trim();

    if (!suggestedResponse) {
      return NextResponse.json(
        { error: 'Failed to generate response suggestion' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      suggestedResponse: suggestedResponse,
      phoneNumber: phoneNumber,
      messageCount: messages.length
    });

  } catch (error) {
    console.error('Error analyzing conversation:', error);
    return NextResponse.json(
      { error: 'Failed to analyze conversation' },
      { status: 500 }
    );
  }
} 