# Environment Variables Setup

This application requires several environment variables to be set up properly. Follow these instructions to configure your environment.

## NextAuth Secret

NextAuth.js requires a secret key for secure session handling and JWT token generation. You can generate this key using the provided script:

```bash
node scripts/generate-auth-secret.js
```

This will output a secure random string that you can use as your `NEXTAUTH_SECRET`.

## Required Environment Variables

Create a file named `.env.local` in the root directory with the following variables:

```
# Next Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Twilio API Credentials
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# EspoCRM API Credentials
ESPO_CRM_URL=https://your-espocrm-instance.com
ESPO_CRM_API_KEY=your-espocrm-api-key
```

## Development Mode

For development mode, the application now has a hardcoded fallback secret if the environment variable is missing, but it's still recommended to set up the `.env.local` file for consistency with production.

## Production Deployment

For production deployment, make sure these environment variables are properly set in your hosting environment (Vercel, Netlify, etc.).

### For Vercel:
1. Go to your project settings
2. Navigate to the Environment Variables section
3. Add each variable and its value
4. Deploy your application 