# TRD Permanent Storage Setup

This system now includes permanent storage for all audits, reports, and posts using Supabase.

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## Database Setup

1. Create a new Supabase project at https://supabase.com
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL script from `supabase-schema.sql` to create all necessary tables and functions

## Features Enabled

### ✅ Permanent Audit Storage
- All basic and detailed audits are saved forever
- User-specific audit history tracking
- Audit analytics and reporting

### ✅ Sales Pitch Storage
- Custom sales pitches for each audit are saved
- Access sales talking points anytime
- Track which pitches work best

### ✅ Post Persistence
- All AI-generated posts are saved permanently
- Post engagement tracking
- Content analytics and insights

### ✅ Report Management
- PDF reports stored in Supabase storage
- Download tracking and analytics
- Permanent client report access

## Sales Features

### 🎯 Non-Tech Sales Guide
The sales pitch system provides:
- **Pain Points**: Specific issues found in each audit
- **Value Proposition**: Custom TRD AI script benefits
- **Objection Handlers**: Ready responses for common concerns
- **Closing Questions**: Proven questions to close deals
- **ROI Information**: Investment vs return data
- **AI Script Benefits**: Technical advantages in simple terms

### 💼 Agent Talking Points
- Emphasizes TRD's proprietary AI scripts
- Focuses on competitive advantages
- Provides specific improvement percentages
- Includes investment and ROI information
- Makes technical concepts accessible

## Backend AI Scripts Advantages

The system highlights TRD's key differentiators:

### 🤖 Custom AI Scripts
- Tailored to each specific business
- 24/7 automated optimization
- Adapts to Google algorithm changes
- Outpaces generic SEO methods

### 📈 Competitive Edge
- Voice search optimization (55% of adults use voice search)
- Featured snippet targeting (position zero)
- Entity optimization for AI search
- Schema markup automation

### 🎯 Business Impact
- Real-time competitor monitoring
- Semantic keyword clustering
- Core Web Vitals optimization
- E-A-T signal enhancement

## Database Schema

### Tables Created:
- `audits`: Complete audit data with scores and analysis
- `reports`: PDF report metadata and download tracking
- `posts`: AI-generated content with engagement metrics
- `audit_history`: User-specific audit access tracking

### Storage Buckets:
- `audit-reports`: PDF report file storage

### Analytics Views:
- `audit_analytics`: Aggregated audit statistics
- Performance tracking and insights

## Usage Examples

### For Sales Agents:
1. Run audit on prospect's business
2. Review generated sales pitch in the "Sales Pitch" tab
3. Use talking points to present TRD's AI advantages
4. Generate professional PDF report for client
5. Close deal using provided objection handlers

### For Management:
- Track all audits across the team
- Monitor which businesses are being audited
- Access historical data for follow-ups
- Analyze pitch effectiveness

## Security Features

- Row Level Security (RLS) enabled
- User-based access control
- Secure storage policies
- Activity page restricted to Matt and Jon only

## Storage Limits

- **Audits**: Kept for 2 years (configurable)
- **Posts**: AI-generated posts kept for 1 year (configurable)
- **Reports**: Permanent storage
- **Cleanup**: Automated via scheduled function

## Next Steps

1. Get Supabase credentials from Matt or Jon
2. Run the database schema setup
3. Test audit system with real businesses
4. Train sales team on new pitch features
5. Monitor storage usage and analytics

The system is now ready to capture every audit, save every sales pitch, and store every report permanently! 