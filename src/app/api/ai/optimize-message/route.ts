import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, variables, messageType } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const prompt = `You are an expert SMS marketing copywriter specializing in True Rank Digital's mass messaging campaigns. Your goal is to optimize SMS messages for maximum engagement, response rates, and conversions.

Context: True Rank Digital is a digital marketing agency that helps businesses get more leads through SEO, PPC, and online marketing services.

Current Message:
"${message}"

Available Variables: ${variables ? variables.join(', ') : 'none'}

Instructions:
1. Optimize this SMS message for higher open rates and responses
2. Keep it under 160 characters if possible (SMS standard)
3. Make it conversational and personable (not salesy)
4. Include a clear call-to-action
5. Use urgency and value proposition
6. Incorporate personalization variables where appropriate
7. Focus on benefits, not features
8. Make it sound like it's coming from a real person, not a company
9. Use proven copywriting principles (social proof, scarcity, curiosity)
10. Ensure it follows SMS marketing best practices and compliance

Return ONLY the optimized message text, nothing else. Do not include explanations or formatting.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert SMS marketing copywriter. Return only the optimized message text, no explanations or formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const optimizedMessage = completion.choices[0]?.message?.content?.trim();

    if (!optimizedMessage) {
      throw new Error('No optimization response received');
    }

    return NextResponse.json({
      originalMessage: message,
      optimizedMessage: optimizedMessage,
      messageType: messageType || 'sms',
      variablesUsed: variables || [],
      optimization: {
        characterCount: optimizedMessage.length,
        estimatedSmsCount: Math.ceil(optimizedMessage.length / 160),
        hasCallToAction: optimizedMessage.includes('?') || optimizedMessage.toLowerCase().includes('call') || optimizedMessage.toLowerCase().includes('reply'),
        hasPersonalization: variables && variables.some((v: string) => optimizedMessage.includes(`{${v}}`)),
        urgencyScore: calculateUrgencyScore(optimizedMessage),
        readabilityScore: calculateReadabilityScore(optimizedMessage)
      }
    });

  } catch (error: any) {
    console.error('AI optimization error:', error);
    
    // Fallback optimization using basic rules
    const fallbackOptimization = basicOptimization(await request.json());
    
    return NextResponse.json({
      originalMessage: fallbackOptimization.originalMessage,
      optimizedMessage: fallbackOptimization.optimizedMessage,
      messageType: 'sms',
      fallback: true,
      error: 'AI optimization unavailable, using basic optimization'
    });
  }
}

// Helper function to calculate urgency score
function calculateUrgencyScore(message: string): number {
  const urgencyWords = ['now', 'today', 'limited', 'urgent', 'quick', 'deadline', 'expires', 'hurry', 'fast', 'immediate'];
  const words = message.toLowerCase().split(' ');
  const urgencyCount = words.filter(word => urgencyWords.includes(word)).length;
  return Math.min(urgencyCount * 25, 100); // Max 100%
}

// Helper function to calculate readability score
function calculateReadabilityScore(message: string): number {
  const words = message.split(' ').length;
  const sentences = message.split(/[.!?]+/).length;
  const avgWordsPerSentence = words / sentences;
  
  // Simple readability: shorter sentences = higher score
  if (avgWordsPerSentence <= 10) return 90;
  if (avgWordsPerSentence <= 15) return 75;
  if (avgWordsPerSentence <= 20) return 60;
  return 45;
}

// Fallback optimization function
function basicOptimization(data: any) {
  const { message } = data;
  
  let optimized = message;
  
  // Basic optimization rules
  optimized = optimized.replace(/\b(Hello|Hi there)\b/gi, 'Hey');
  optimized = optimized.replace(/\bcompany\b/gi, 'business');
  optimized = optimized.replace(/\bwebsite\b/gi, 'site');
  optimized = optimized.replace(/\bmarketing\b/gi, 'marketing');
  
  // Add urgency if missing
  if (!optimized.includes('?') && !optimized.toLowerCase().includes('call') && !optimized.toLowerCase().includes('reply')) {
    optimized += ' Quick chat?';
  }
  
  // Trim to SMS length
  if (optimized.length > 160) {
    optimized = optimized.substring(0, 157) + '...';
  }
  
  return {
    originalMessage: message,
    optimizedMessage: optimized
  };
} 