import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { tool, input, userId } = await request.json();

    if (!input || !input.trim()) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'OpenAI API key not configured'
      }, { status: 500 });
    }

    // System prompts for different AI tools
    const systemPrompts = {
      'email-generator': `You are an expert email marketing specialist for True Rank Digital. Create professional, personalized sales emails that:
- Build rapport and trust quickly
- Focus on digital marketing benefits (SEO, PPC, lead generation)
- Include compelling value propositions
- Have clear call-to-action for scheduling meetings
- Use conversational but professional tone
- Avoid being overly salesy
- Highlight ROI and results potential

FORMAT REQUIREMENTS:
- Use **bold text** for important points and key benefits
- Use bullet points with - for lists
- Use proper subject lines with "Subject:" prefix
- Structure with clear paragraphs
- Use placeholders like [Company Name], [Recipient's Name] for personalization
- End with professional signature block`,

      'proposal-writer': `You are a business proposal expert for True Rank Digital. Create compelling proposals that:
- Address specific client pain points around online visibility
- Present clear solutions with digital marketing services
- Include ROI projections and case studies when relevant
- Structure professionally with clear sections
- Build urgency without being pushy
- Focus on business growth and revenue impact
- End with clear next steps

FORMAT REQUIREMENTS:
- Use ## for main section headers (e.g., ## Executive Summary)
- Use **bold text** for key metrics, ROI figures, and important benefits
- Use bullet points with - for service lists and benefits
- Include numbered sections for step-by-step processes
- Use tables or structured lists for pricing/packages
- Include clear call-to-action sections with **bold emphasis**`,

      'objection-handler': `You are a sales objection handling expert for True Rank Digital. Create responses that:
- Acknowledge the prospect's concern genuinely
- Reframe objections using psychological principles
- Use social proof and scarcity when appropriate
- Redirect to value and ROI
- Build urgency naturally
- Provide logical reasoning that makes sense
- Sound conversational and helpful, not argumentative

FORMAT REQUIREMENTS:
- Use **bold text** for key reframes and value propositions
- Structure as conversational responses with natural flow
- Include specific examples and social proof with **bold emphasis**
- Use bullet points for multiple benefits or reasons
- End with clear, **bold call-to-action**`,

      'follow-up-sequence': `You are a follow-up sequence specialist for True Rank Digital. Create follow-up messages that:
- Build on previous conversations naturally
- Provide additional value in each touch
- Use different angles (urgency, social proof, education)
- Maintain professional but friendly tone
- Include clear call-to-action for next steps
- Create curiosity and FOMO
- Sound personal and authentic

FORMAT REQUIREMENTS:
- Number each follow-up (Follow-up #1, #2, etc.)
- Use **bold text** for subject lines and key value propositions
- Include bullet points for benefits and value adds
- Use **bold emphasis** for urgency elements and CTAs
- Structure with clear timing suggestions (e.g., "Send 3 days after initial contact")`,

      'cold-outreach': `You are a cold outreach expert for True Rank Digital. Create messages that:
- Grab attention immediately with relevant hooks
- Personalize based on business/industry
- Focus on specific problems and solutions
- Build credibility quickly
- Include compelling reason to respond
- Keep concise and easy to read
- End with low-pressure call-to-action

FORMAT REQUIREMENTS:
- Use **bold subject lines** that grab attention
- Use **bold text** for key statistics and value propositions
- Keep paragraphs short and scannable
- Use bullet points for quick benefits
- Include **bold call-to-action** at the end
- Use personalization placeholders like [Company Name], [Industry]`,

      'social-media': `You are a social media content expert for True Rank Digital. Create posts that:
- Provide educational value about digital marketing
- Build brand authority and trust
- Use engaging formats (tips, insights, case studies)
- Include relevant hashtags
- Encourage engagement and shares
- Sound authentic and helpful
- Subtly position True Rank Digital as experts

FORMAT REQUIREMENTS:
- Use **bold text** for key tips and important points
- Include relevant hashtags at the end
- Use bullet points or numbered lists for tips
- Include engaging questions to drive comments
- Use emojis strategically for engagement
- Structure with clear, scannable paragraphs`
    };

    const systemPrompt = systemPrompts[tool as keyof typeof systemPrompts] || 
      'You are a helpful AI assistant that creates professional business content.';

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: input
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const output = completion.choices[0]?.message?.content;

    if (!output) {
      throw new Error('No content was generated');
    }

    // Log usage (optional)
    console.log(`AI Content Generated - Tool: ${tool}, User: ${userId}, Tokens: ${completion.usage?.total_tokens}`);

    return NextResponse.json({
      success: true,
      output,
      tool,
      usage: completion.usage
    });

  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    if (error.status === 429) {
      return NextResponse.json({
        error: 'Rate limit exceeded. Please try again in a moment.'
      }, { status: 429 });
    }
    
    if (error.status === 401) {
      return NextResponse.json({
        error: 'Invalid OpenAI API key'
      }, { status: 401 });
    }

    return NextResponse.json({
      error: 'Failed to generate content: ' + error.message
    }, { status: 500 });
  }
} 