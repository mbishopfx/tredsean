# TredSean - Dialer & SMS Platform

A modern communication platform for managing voice calls and SMS messages, featuring:

- SMS messaging with templates and bulk sending
- Voice dialing capabilities
- CRM integration
- Activity logging for administrative tracking
- Modern responsive UI

Built with Next.js, Tailwind CSS, and Twilio integration.

## Features

- **Secure Authentication**: Login system with hardcoded credentials for Bishop, Dan, and Sean
- **Dark Theme with Orange Accent**: Modern UI with an easy-on-the-eyes dark theme
- **Message Editor**: Create and send SMS messages to multiple recipients
- **SMS Chat Interface**: View and reply to incoming SMS messages
- **Voice Dialer**: Make outbound calls using Twilio's Voice API
- **EspoCRM Integration**: 
  - Search for contacts by phone number
  - Log calls with detailed outcomes and notes
  - Associate calls with contacts in your CRM
- **Pipeline Management**: Tag conversations for follow-up

## Tech Stack

- **Framework**: Next.js 15
- **Authentication**: NextAuth.js
- **UI**: TailwindCSS with custom dark theme
- **API Integration**: 
  - Twilio for SMS and Voice
  - EspoCRM for customer relationship management

## Getting Started

### Prerequisites

- Node.js 18 or later
- Twilio account with:
  - Account SID
  - Auth Token
  - A Twilio phone number with SMS capabilities
- EspoCRM instance with API access

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/trd-dialer-sms.git
   cd trd-dialer-sms
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file based on `env.example`:
   ```
   cp env.example .env.local
   ```

4. Fill in your Twilio and EspoCRM credentials in `.env.local`

### Running the Application

1. Start the development server:
   ```
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Login with one of the provided credentials:
   - Username: Bishop, Password: Trd2025!
   - Username: Dan, Password: Trd2024!
   - Username: Sean, Password: Trd2023!

## Voice Dialer & EspoCRM Integration

The Voice Dialer feature allows you to:

1. Enter a phone number to call
2. The system searches for a matching contact in EspoCRM
3. After the call, record the outcome with details like:
   - Call result (Answered, No Answer, Voicemail, etc.)
   - Detailed notes about the conversation
4. Submit the call report to EspoCRM
5. The call will be logged against the contact's record in EspoCRM

## Deployment

The application is designed to be deployed on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in the Vercel project settings
4. Deploy

## Webhook Setup

### Twilio Webhook Setup

To receive SMS status updates:

1. In your Twilio account dashboard, navigate to your active phone number
2. Set the Messaging webhook to: `https://your-deployed-url.com/api/twilio/webhook`
3. Make sure the method is set to POST
