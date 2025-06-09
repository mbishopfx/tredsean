interface AuditData {
  type: 'seo' | 'gbp' | 'ai_analysis' | 'activity';
  title: string;
  data: any;
  userId?: string;
  metadata?: {
    phoneNumber?: string;
    businessName?: string;
    website?: string;
    score?: number;
  };
}

export const saveAudit = async (auditData: AuditData) => {
  try {
    const response = await fetch('/api/audits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auditData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to save audit');
    }

    console.log('Audit saved successfully:', result.audit.id);
    return result.audit;
  } catch (error) {
    console.error('Error saving audit:', error);
    throw error;
  }
};

// Helper functions for specific audit types
export const saveAiAnalysis = async (
  phoneNumber: string,
  conversationData: any,
  analysisResult: string,
  userId?: string
) => {
  return saveAudit({
    type: 'ai_analysis',
    title: `AI Analysis - ${phoneNumber}`,
    data: {
      phoneNumber,
      conversationData,
      analysisResult,
      timestamp: new Date().toISOString()
    },
    userId,
    metadata: {
      phoneNumber
    }
  });
};

export const saveSeoAudit = async (
  businessName: string,
  website: string,
  auditResult: string,
  score?: number,
  userId?: string
) => {
  return saveAudit({
    type: 'seo',
    title: `SEO Audit - ${businessName}`,
    data: {
      businessName,
      website,
      auditResult,
      timestamp: new Date().toISOString()
    },
    userId,
    metadata: {
      businessName,
      website,
      score
    }
  });
};

export const saveGbpAudit = async (
  businessName: string,
  auditResult: any,
  score?: number,
  userId?: string
) => {
  return saveAudit({
    type: 'gbp',
    title: `GBP Audit - ${businessName}`,
    data: {
      businessName,
      auditResult,
      timestamp: new Date().toISOString()
    },
    userId,
    metadata: {
      businessName,
      score
    }
  });
};

export const saveActivityLog = async (
  action: string,
  details: any,
  userId?: string
) => {
  return saveAudit({
    type: 'activity',
    title: `Activity - ${action}`,
    data: {
      action,
      details,
      timestamp: new Date().toISOString()
    },
    userId,
    metadata: {
      businessName: details?.businessName,
      phoneNumber: details?.phoneNumber
    }
  });
}; 