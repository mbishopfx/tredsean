import { Twilio } from 'twilio';
import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Time periods for filtering statistics
type StatsPeriod = '1h' | '6h' | '24h' | '7d' | '30d' | 'all';

// Interface for enhanced message analytics
interface MessageAnalytics {
  sid: string;
  to: string;
  from: string;
  body: string;
  status: string;
  direction: string;
  dateSent: Date | null;
  dateCreated: Date | null;
  dateUpdated: Date | null;
  price: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  numSegments: string | null;
  campaign?: string;
  replyReceived?: boolean;
  deliveryAttempts: number;
}

// Enhanced phone number stats
interface PhoneNumberStats {
  phoneNumber: string;
  totalMessages: number;
  outboundMessages: number;
  inboundMessages: number;
  delivered: number;
  failed: number;
  pending: number;
  sent: number;
  replied: number;
  uniqueMessageCount: number;
  deliveryRate: number;
  replyRate: number;
  cost: number;
  lastMessageDate: Date | null;
  firstMessageDate: Date | null;
  avgResponseTime?: number; // in minutes
  isActiveConversation: boolean;
}

// Store message analytics locally for enhanced tracking
const analyticsFile = join(process.cwd(), 'message-analytics.json');

function getStoredAnalytics(): MessageAnalytics[] {
  try {
    if (existsSync(analyticsFile)) {
      const data = readFileSync(analyticsFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading analytics file:', error);
  }
  return [];
}

function storeAnalytics(analytics: MessageAnalytics[]) {
  try {
    writeFileSync(analyticsFile, JSON.stringify(analytics, null, 2));
  } catch (error) {
    console.error('Error writing analytics file:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1h':
        startDate.setHours(endDate.getHours() - 1);
        break;
      case '6h':
        startDate.setHours(endDate.getHours() - 6);
        break;
      case '24h':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'all':
        startDate.setFullYear(2020); // Go back to 2020
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    // Enhanced mock data with comprehensive Twilio tracking
    const mockStats = {
      overview: {
        totalMessages: 15420,
        outbound: 12336,
        inbound: 3084,
        deliveredCount: 15134,
        failedCount: 286,
        pendingCount: 0,
        totalCost: 115.65,
        deliveryRate: 98.2,
        replyRate: 23.5,
        activeConversations: 84,
        currency: 'USD',
        period: period,
        revenueGenerated: 78500,
        roi: 6700,
        avgResponseTime: 42.5, // minutes
        conversionRate: 8.9,
        costPerConversion: 12.98
      },
      timeRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        lastUpdated: new Date().toISOString()
      },
      statusBreakdown: {
        delivered: 15134,
        failed: 256,
        undelivered: 30,
        sent: 15420,
        queued: 0,
        accepted: 15420
      },
      hourlyBreakdown: period === '24h' || period === '6h' || period === '1h' ? {
        '00:00': 45, '01:00': 32, '02:00': 28, '03:00': 22, '04:00': 18, '05:00': 25,
        '06:00': 78, '07:00': 124, '08:00': 198, '09:00': 245, '10:00': 278, '11:00': 312,
        '12:00': 295, '13:00': 267, '14:00': 234, '15:00': 198, '16:00': 167, '17:00': 145,
        '18:00': 123, '19:00': 98, '20:00': 87, '21:00': 76, '22:00': 65, '23:00': 54
      } : undefined,
      campaignAnalysis: [
        {
          phoneNumber: '+14155552671',
          messagesInCampaign: 45,
          deliveryRate: 97.8,
          replyRate: 31.1,
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          phoneNumber: '+14155552672',
          messagesInCampaign: 38,
          deliveryRate: 100.0,
          replyRate: 26.3,
          lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        }
      ],
      recentMessages: [
        {
          to: '+14155552671',
          from: '+19876543210',
          body: 'Thanks for your interest! Let me know if you have any questions.',
          status: 'delivered',
          dateSent: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          price: '$0.0075'
        },
        {
          to: '+14155552672',
          from: '+19876543210',
          body: 'Hi! I wanted to follow up on our conversation about...',
          status: 'delivered',
          dateSent: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          price: '$0.0075'
        }
      ],
      phoneStats: [
        {
          phoneNumber: '+14155552671',
          totalMessages: 45,
          outbound: 28,
          inbound: 17,
          delivered: 44,
          failed: 1,
          deliveryRate: 97.8,
          replyRate: 37.8,
          cost: 0.34
        },
        {
          phoneNumber: '+14155552672',
          totalMessages: 38,
          outbound: 24,
          inbound: 14,
          delivered: 38,
          failed: 0,
          deliveryRate: 100.0,
          replyRate: 36.8,
          cost: 0.29
        }
      ],
      topPhoneNumbers: [
        { phoneNumber: '+14155552671', totalMessages: 45, delivered: 44, failed: 1, deliveryRate: 97.8, cost: '0.34' },
        { phoneNumber: '+14155552672', totalMessages: 38, delivered: 38, failed: 0, deliveryRate: 100.0, cost: '0.29' },
        { phoneNumber: '+14155552673', totalMessages: 32, delivered: 31, failed: 1, deliveryRate: 96.9, cost: '0.24' },
        { phoneNumber: '+14155552674', totalMessages: 28, delivered: 28, failed: 0, deliveryRate: 100.0, cost: '0.21' },
        { phoneNumber: '+14155552675', totalMessages: 25, delivered: 24, failed: 1, deliveryRate: 96.0, cost: '0.19' }
      ],
      messagesByDay: [
        { date: '2024-01-01', sent: 120, delivered: 118, failed: 2, cost: 0.90 },
        { date: '2024-01-02', sent: 95, delivered: 93, failed: 2, cost: 0.71 },
        { date: '2024-01-03', sent: 180, delivered: 177, failed: 3, cost: 1.35 },
        { date: '2024-01-04', sent: 210, delivered: 206, failed: 4, cost: 1.58 },
        { date: '2024-01-05', sent: 165, delivered: 162, failed: 3, cost: 1.24 },
        { date: '2024-01-06', sent: 140, delivered: 138, failed: 2, cost: 1.05 },
        { date: '2024-01-07', sent: 190, delivered: 187, failed: 3, cost: 1.43 }
      ],
      errorAnalysis: {
        undelivered: 12,
        invalidNumbers: 8,
        carrierBlocked: 3,
        other: 5,
        topErrors: [
          { code: '30008', description: 'Unknown destination handset', count: 45, percentage: 35.4 },
          { code: '30005', description: 'Unknown destination handset', count: 32, percentage: 25.2 },
          { code: '30004', description: 'Message blocked by carrier', count: 28, percentage: 22.0 },
          { code: '30003', description: 'Unreachable destination handset', count: 22, percentage: 17.3 }
        ],
        errorRate: 1.85
      },
      costBreakdown: {
        smsMessages: 98.45,
        phoneNumbers: 15.00,
        other: 2.20
      },
      carrierAnalysis: {
        verizon: { messages: 5456, deliveryRate: 98.9, avgCost: 0.0076 },
        att: { messages: 4832, deliveryRate: 97.8, avgCost: 0.0075 },
        tmobile: { messages: 3211, deliveryRate: 96.5, avgCost: 0.0074 },
        sprint: { messages: 1921, deliveryRate: 95.2, avgCost: 0.0077 }
      },
      geographicInsights: {
        topStates: [
          { state: 'CA', messages: 3456, conversions: 298, revenue: 45600 },
          { state: 'TX', messages: 2890, conversions: 245, revenue: 38200 },
          { state: 'FL', messages: 2234, conversions: 189, revenue: 29800 },
          { state: 'NY', messages: 1987, conversions: 167, revenue: 26700 },
          { state: 'IL', messages: 1654, conversions: 134, revenue: 21200 }
        ],
        topCities: [
          { city: 'Los Angeles', messages: 1234, conversions: 98, revenue: 15600 },
          { city: 'Houston', messages: 987, conversions: 82, revenue: 12800 },
          { city: 'Miami', messages: 876, conversions: 71, revenue: 11200 },
          { city: 'Chicago', messages: 765, conversions: 64, revenue: 9800 },
          { city: 'Phoenix', messages: 654, conversions: 52, revenue: 8400 }
        ]
      },
      deviceAnalysis: {
        iphone: { percentage: 52.3, responseRate: 24.8, conversionRate: 9.2 },
        android: { percentage: 44.1, responseRate: 21.4, conversionRate: 8.1 },
        other: { percentage: 3.6, responseRate: 15.2, conversionRate: 6.8 }
      },
      messageTypes: {
        text: { count: 13456, deliveryRate: 98.5, responseRate: 23.8, cost: 100.92 },
        mms: { count: 1892, deliveryRate: 95.2, responseRate: 18.9, cost: 14.19 },
        shortCode: { count: 72, deliveryRate: 99.1, responseRate: 12.5, cost: 0.54 }
      },
      timeAnalysis: {
        bestHours: ['10:00', '14:00', '15:00'],
        worstHours: ['23:00', '02:00', '04:00'],
        bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
        peakResponseTime: '14:00-15:00',
        avgFirstResponseTime: 23.5 // minutes
      },
      qualityMetrics: {
        spamScore: 0.02,
        blacklistStatus: 'clean',
        reputationScore: 9.4,
        deliverabilityScore: 9.1,
        optOutRate: 1.8,
        complaintRate: 0.04
      },
      campaignPerformance: [
        { 
          name: 'Q4 Restaurant Outreach', 
          messages: 2847, 
          responses: 478, 
          conversions: 89, 
          revenue: 18900, 
          roi: 1247,
          status: 'active'
        },
        { 
          name: 'HVAC Winter Campaign', 
          messages: 1923, 
          responses: 356, 
          conversions: 67, 
          revenue: 24600, 
          roi: 1680,
          status: 'completed'
        },
        { 
          name: 'Dental Practice Follow-up', 
          messages: 1456, 
          responses: 287, 
          conversions: 54, 
          revenue: 16200, 
          roi: 1389,
          status: 'active'
        }
      ],
      integrationHealth: {
        webhookDeliveries: 15420,
        webhookFailures: 23,
        apiCalls: 45678,
        apiErrors: 12,
        rateLimitHits: 0,
        lastWebhookSuccess: new Date(Date.now() - 300000).toISOString(),
        systemUptime: 99.97
      }
    };

    return NextResponse.json(mockStats);
    
  } catch (error: any) {
    console.error('Error fetching Twilio stats:', error);
    return NextResponse.json({
      error: 'Failed to fetch Twilio statistics'
    }, { status: 500 });
  }
} 