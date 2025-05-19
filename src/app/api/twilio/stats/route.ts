import { Twilio } from 'twilio';
import { NextRequest, NextResponse } from 'next/server';

// Time periods for filtering statistics
type StatsPeriod = '24h' | '7d' | '30d' | 'all';

export async function GET(request: NextRequest) {
  // Check authentication (using localStorage in client, simplified for demo)
  // In a real app, you would validate a proper session token here

  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') as StatsPeriod) || '7d';
    
    // Initialize Twilio client with environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      return NextResponse.json({ error: 'Twilio credentials not configured' }, { status: 500 });
    }

    const client = new Twilio(accountSid, authToken);
    
    // Calculate date range for filtering
    const endDate = new Date();
    let startDate = new Date();
    
    switch(period) {
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
        // Use a very old date for "all time" stats
        startDate = new Date(2000, 0, 1);
        break;
    }
    
    // Convert to Twilio's required ISO format
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Get SMS messages
    const messages = await client.messages.list({
      dateSentAfter: new Date(startDateStr),
      dateSentBefore: new Date(endDateStr),
      limit: 1000 // Adjust as needed
    });
    
    // Analyze message status distribution
    const statusCounts: Record<string, number> = {};
    const directions: Record<string, number> = { inbound: 0, outbound: 0 };
    
    // Track metrics per phone number to identify campaigns
    const phoneNumberStats: Record<string, {
      sentCount: number;
      deliveredCount: number;
      failedCount: number;
      messageIds: Set<string>;
      cost: number;
    }> = {};
    
    // Extract key metrics
    let totalCost = 0;
    let totalMessages = messages.length;
    
    messages.forEach(message => {
      // Count by status
      const status = message.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      
      // Count by direction
      const direction = message.direction || 'outbound';
      directions[direction] = (directions[direction] || 0) + 1;
      
      // Aggregate by phone number (for campaign analysis)
      const phoneNumber = message.to || 'unknown';
      
      if (!phoneNumberStats[phoneNumber]) {
        phoneNumberStats[phoneNumber] = {
          sentCount: 0,
          deliveredCount: 0,
          failedCount: 0,
          messageIds: new Set(),
          cost: 0
        };
      }
      
      // Track unique message IDs
      phoneNumberStats[phoneNumber].messageIds.add(message.sid);
      
      // Count by status
      if (message.status === 'delivered') {
        phoneNumberStats[phoneNumber].deliveredCount++;
      } else if (['failed', 'undelivered'].includes(message.status || '')) {
        phoneNumberStats[phoneNumber].failedCount++;
      }
      
      phoneNumberStats[phoneNumber].sentCount++;
      
      // Sum up costs if available
      if (message.price) {
        const price = parseFloat(message.price);
        if (!isNaN(price)) {
          totalCost += price;
          phoneNumberStats[phoneNumber].cost += price;
        }
      }
    });
    
    // Calculate delivery rate
    const deliveredCount = statusCounts['delivered'] || 0;
    const deliveryRate = totalMessages > 0 ? (deliveredCount / totalMessages) * 100 : 0;
    
    // Format phone number stats for response
    const phoneStats = Object.entries(phoneNumberStats).map(([phoneNumber, stats]) => ({
      phoneNumber,
      totalMessages: stats.sentCount,
      delivered: stats.deliveredCount,
      failed: stats.failedCount,
      uniqueMessageCount: stats.messageIds.size,
      deliveryRate: stats.sentCount > 0 ? (stats.deliveredCount / stats.sentCount) * 100 : 0,
      cost: stats.cost.toFixed(2)
    }));
    
    // Get top 3 most messaged numbers
    const topPhoneNumbers = [...phoneStats]
      .sort((a, b) => b.totalMessages - a.totalMessages)
      .slice(0, 3);
    
    // Prepare response data
    const statsData = {
      period,
      timeRange: {
        start: startDateStr,
        end: endDateStr
      },
      overview: {
        totalMessages,
        inbound: directions.inbound || 0,
        outbound: directions.outbound || 0,
        deliveredCount,
        deliveryRate: deliveryRate.toFixed(1),
        totalCost: totalCost.toFixed(2),
        currency: 'USD'  // Twilio typically uses USD
      },
      statusBreakdown: statusCounts,
      topPhoneNumbers,
      // Include recent messages for display
      recentMessages: messages.slice(0, 20).map(message => ({
        sid: message.sid,
        to: message.to,
        from: message.from,
        body: message.body?.substring(0, 50) + (message.body && message.body.length > 50 ? '...' : '') || '',
        status: message.status,
        direction: message.direction,
        dateSent: message.dateSent,
        price: message.price
      }))
    };

    return NextResponse.json(statsData);
  } catch (error) {
    console.error('Error fetching Twilio stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred while fetching statistics' },
      { status: 500 }
    );
  }
} 