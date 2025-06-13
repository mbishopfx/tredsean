# AI Tools Setup Guide

## Overview
The AI Tools feature provides content generation capabilities for sales and marketing using GPT-4o. This includes:

- **Email Generator**: Professional sales emails
- **Proposal Writer**: Business proposals and pitches
- **Objection Handler**: Responses to customer objections
- **Follow-up Sequence**: Automated follow-up messages
- **Cold Outreach**: Cold contact messages
- **Social Media**: Social media posts and content

## Requirements

### 1. OpenAI API Key
You need an OpenAI API key with access to GPT-4o.

**Getting an OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an OpenAI account
3. Click "Create new secret key"
4. Name your key (e.g., "TredSean AI Tools")
5. Copy the key (starts with `sk-`)

### 2. Environment Configuration

**Create `.env.local` file:**
```bash
# In your project root directory
cp env.example .env.local
```

**Add your OpenAI API key:**
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

**Important:** 
- Never commit `.env.local` to version control
- The key should start with `sk-`
- Keep your API key secure and private

## Testing the Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to AI Tools:**
   - Open http://localhost:3000
   - Log in to the application
   - Click on the "AI Tools" tab
   - Select any tool (e.g., Email Generator)

3. **Test generation:**
   - Enter some input text
   - Click "Generate Content"
   - You should see AI-generated content

## Troubleshooting

### Error: "OpenAI API key not configured"
- Check that `OPENAI_API_KEY` is set in `.env.local`
- Restart the development server after adding the key
- Verify the key starts with `sk-`

### Error: "Invalid OpenAI API key"
- Your API key may be incorrect or expired
- Generate a new key from OpenAI dashboard
- Verify you have credits/billing set up in OpenAI

### Error: "Rate limit exceeded"
- You've hit OpenAI's rate limits
- Wait a moment and try again
- Consider upgrading your OpenAI plan for higher limits

### Error: "Failed to generate content"
- Check your internet connection
- Verify OpenAI service status
- Check browser console for detailed error messages

## API Costs

**GPT-4o Pricing (as of 2024):**
- Input tokens: $5.00 / 1M tokens
- Output tokens: $15.00 / 1M tokens

**Typical usage:**
- Email generation: ~500 tokens = $0.01
- Proposal writing: ~1,500 tokens = $0.02
- Daily usage estimate: $0.50-$2.00

## Features by Tool

### Email Generator
- Professional sales emails
- Personalized for prospects
- Clear call-to-actions
- ROI-focused messaging

### Proposal Writer
- Business proposal structure
- Value proposition highlighting
- ROI projections
- Professional formatting

### Objection Handler
- Psychology-based responses
- Reframes customer concerns
- Social proof integration
- Conversion-focused

### Follow-up Sequence
- Multi-touch campaigns
- Value-driven messaging
- Urgency and FOMO
- Relationship building

### Cold Outreach
- Attention-grabbing hooks
- Industry personalization
- Low-pressure approaches
- Response-optimized

### Social Media
- Educational content
- Authority building
- Engagement optimization
- Brand positioning

## Security Best Practices

1. **API Key Security:**
   - Never share your API key
   - Use environment variables only
   - Rotate keys regularly
   - Monitor usage in OpenAI dashboard

2. **Content Guidelines:**
   - Review generated content before use
   - Personalize AI outputs
   - Maintain brand voice consistency
   - Follow email marketing regulations

## Support

If you encounter issues:
1. Check this documentation
2. Verify environment setup
3. Test with minimal examples
4. Check OpenAI service status
5. Review application logs for errors

The AI tools are designed to enhance productivity while maintaining professional quality and brand consistency. 