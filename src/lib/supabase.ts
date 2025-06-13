import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bnrkzynwwrukchncdzus.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucmt6eW53d3J1a2NobmNkenVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNzQ0MDQsImV4cCI6MjA2NDg1MDQwNH0.mJGHvJQ83-4Sp3-guhv_KteEqMLxd9o59cDb_1Z_ooc';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucmt6eW53d3J1a2NobmNkenVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI3NDQwNCwiZXhwIjoyMDY0ODUwNDA0fQ.cS4fktp35ahxb-y_dw2EIsZO5iBnpmYfGA_cjfuoU2I';

// Client for browser usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Storage bucket name
export const STORAGE_BUCKET = 'sms';

// Helper functions for file operations
export const uploadFile = async (
  filePath: string, 
  fileData: string | Blob | File, 
  contentType?: string
) => {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileData, {
        contentType: contentType || 'application/json',
        upsert: true // Overwrite if exists
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to upload file:', error);
    throw error;
  }
};

export const downloadFile = async (filePath: string) => {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(filePath);

    if (error) {
      console.error('Download error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to download file:', error);
    throw error;
  }
};

export const getPublicUrl = (filePath: string) => {
  const { data } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

export const listFiles = async (folderPath?: string) => {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .list(folderPath || '', {
        limit: 100,
        offset: 0
      });

    if (error) {
      console.error('List files error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to list files:', error);
    throw error;
  }
};

// Utility functions for specific data types
export const saveCampaignResults = async (
  campaignId: string,
  results: any,
  username: string
) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = `campaigns/${username}/${campaignId}_${timestamp}.json`;
  
  const campaignData = {
    campaignId,
    username,
    timestamp: new Date().toISOString(),
    results,
    metadata: {
      totalContacts: results.totalRecipients || 0,
      successful: results.successful || 0,
      failed: results.failed || 0,
      messagePreview: results.messagePreview || ''
    }
  };

  return await uploadFile(filePath, JSON.stringify(campaignData, null, 2));
};

export const saveCleanedCSV = async (
  filename: string,
  csvData: string,
  username: string,
  metadata?: any
) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = `cleaned-csvs/${username}/${timestamp}_${filename}`;
  
  // Save the CSV data
  await uploadFile(filePath, csvData, 'text/csv');
  
  // Save metadata if provided
  if (metadata) {
    const metadataPath = `cleaned-csvs/${username}/${timestamp}_${filename}.meta.json`;
    await uploadFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  return filePath;
};

export const saveActivityLog = async (
  username: string,
  action: string,
  details: any
) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = `activity-logs/${username}/${timestamp}_${action}.json`;
  
  const logData = {
    username,
    action,
    timestamp: new Date().toISOString(),
    details
  };

  return await uploadFile(filePath, JSON.stringify(logData, null, 2));
};

export const savePost = async (
  postId: string,
  postData: any,
  username: string
) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = `posts/${username}/${postId}_${timestamp}.json`;
  
  const fullPostData = {
    postId,
    username,
    timestamp: new Date().toISOString(),
    ...postData
  };

  return await uploadFile(filePath, JSON.stringify(fullPostData, null, 2));
};

// Database types for TypeScript
export interface AuditRecord {
  id: string;
  audit_id: string;
  business_name: string;
  url?: string;
  audit_type: 'basic' | 'detailed';
  overall_score: number;
  listing_completeness_score?: number;
  content_alignment_score?: number;
  local_seo_readiness_score?: number;
  ai_seo_score?: number;
  google_ai_readiness?: number;
  audit_data: any;
  sales_pitch_data?: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
  tags?: string[];
  status: string;
}

export interface ReportRecord {
  id: string;
  audit_id: string;
  report_type: 'basic' | 'detailed' | 'sales_pitch';
  file_name: string;
  file_path?: string;
  file_url?: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
  created_by?: string;
  download_count: number;
  last_downloaded_at?: string;
}

export interface PostRecord {
  id: string;
  post_id: string;
  content: string;
  post_type: 'ai_generated' | 'manual' | 'announcement';
  category?: string;
  author: string;
  engagement_data?: any;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  featured: boolean;
  tags?: string[];
}

export interface AuditHistoryRecord {
  id: string;
  user_id: string;
  audit_id: string;
  business_name: string;
  quick_summary?: string;
  last_accessed_at: string;
  is_favorite: boolean;
  notes?: string;
}

// Utility functions for database operations
export class AuditStorage {
  
  // Save audit to permanent storage
  static async saveAudit(auditData: any, auditType: 'basic' | 'detailed', username?: string): Promise<string> {
    try {
      const auditRecord: Partial<AuditRecord> = {
        audit_id: auditData.auditId || `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        business_name: auditData.businessName,
        url: auditData.url,
        audit_type: auditType,
        overall_score: auditData.overallScore,
        listing_completeness_score: auditData.listingCompletenessScore,
        content_alignment_score: auditData.contentAlignmentScore,
        local_seo_readiness_score: auditData.localSeoReadinessScore,
        ai_seo_score: auditData.aiSeoScore,
        google_ai_readiness: auditData.googleAiReadiness,
        audit_data: auditData,
        created_by: username,
        tags: [auditType, 'trd-audit'],
        status: 'completed'
      };

      const { data, error } = await supabaseAdmin
        .from('audits')
        .insert(auditRecord)
        .select('audit_id')
        .single();

      if (error) throw error;
      return data.audit_id;
    } catch (error) {
      console.error('Error saving audit:', error);
      throw error;
    }
  }

  // Save sales pitch data
  static async saveSalesPitch(auditId: string, salesPitchData: any): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('audits')
        .update({ sales_pitch_data: salesPitchData })
        .eq('audit_id', auditId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving sales pitch:', error);
      throw error;
    }
  }

  // Get audit history for user
  static async getUserAuditHistory(username: string, limit: number = 20): Promise<AuditRecord[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('audits')
        .select('*')
        .eq('created_by', username)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audit history:', error);
      return [];
    }
  }

  // Get all audits with pagination
  static async getAllAudits(page: number = 1, limit: number = 50): Promise<{ data: AuditRecord[], count: number }> {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabaseAdmin
        .from('audits')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error fetching all audits:', error);
      return { data: [], count: 0 };
    }
  }

  // Save audit to user history
  static async saveToUserHistory(username: string, auditId: string, businessName: string, summary?: string): Promise<void> {
    try {
      const historyRecord: Partial<AuditHistoryRecord> = {
        user_id: username,
        audit_id: auditId,
        business_name: businessName,
        quick_summary: summary,
        last_accessed_at: new Date().toISOString(),
        is_favorite: false
      };

      // Upsert to handle duplicates
      const { error } = await supabaseAdmin
        .from('audit_history')
        .upsert(historyRecord, { 
          onConflict: 'user_id,audit_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving to user history:', error);
    }
  }

  // Get audit by ID
  static async getAuditById(auditId: string): Promise<AuditRecord | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('audits')
        .select('*')
        .eq('audit_id', auditId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching audit:', error);
      return null;
    }
  }
}

export class ReportStorage {
  
  // Upload report file to storage
  static async uploadReport(filePath: string, fileData: Buffer, contentType: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin.storage
        .from('audit-reports')
        .upload(filePath, fileData, {
          contentType,
          upsert: true
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error uploading report:', error);
      throw error;
    }
  }

  // Save report metadata
  static async saveReport(auditId: string, reportType: 'basic' | 'detailed' | 'sales_pitch', fileName: string, filePath: string, username?: string): Promise<void> {
    try {
      const reportRecord: Partial<ReportRecord> = {
        audit_id: auditId,
        report_type: reportType,
        file_name: fileName,
        file_path: filePath,
        file_url: `${supabaseUrl}/storage/v1/object/public/audit-reports/${filePath}`,
        mime_type: 'application/pdf',
        created_by: username,
        download_count: 0
      };

      const { error } = await supabaseAdmin
        .from('reports')
        .insert(reportRecord);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving report:', error);
      throw error;
    }
  }

  // Get reports for audit
  static async getReportsForAudit(auditId: string): Promise<ReportRecord[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('reports')
        .select('*')
        .eq('audit_id', auditId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }

  // Update download count
  static async updateDownloadCount(reportId: string): Promise<void> {
    try {
      // First get current count
      const { data: currentData, error: fetchError } = await supabaseAdmin
        .from('reports')
        .select('download_count')
        .eq('id', reportId)
        .single();

      if (fetchError) throw fetchError;

      const newCount = (currentData?.download_count || 0) + 1;

      const { error } = await supabaseAdmin
        .from('reports')
        .update({ 
          download_count: newCount,
          last_downloaded_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating download count:', error);
    }
  }
}

export class PostStorage {
  
  // Save post to permanent storage
  static async savePost(postData: any): Promise<void> {
    try {
      const postRecord: Partial<PostRecord> = {
        post_id: postData.id || `post_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        content: postData.content,
        post_type: postData.type || 'ai_generated',
        category: postData.category,
        author: postData.author || 'AI Assistant',
        engagement_data: { likes: 0, shares: 0, views: 0 },
        is_active: true,
        featured: postData.featured || false,
        tags: postData.tags || ['ai-generated', 'seo-tip']
      };

      const { error } = await supabaseAdmin
        .from('posts')
        .insert(postRecord);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving post:', error);
      throw error;
    }
  }

  // Get recent posts
  static async getRecentPosts(limit: number = 20): Promise<PostRecord[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('posts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  // Update post engagement
  static async updateEngagement(postId: string, engagementType: 'likes' | 'shares' | 'views', increment: number = 1): Promise<void> {
    try {
      // First get current engagement data
      const { data: currentPost, error: fetchError } = await supabaseAdmin
        .from('posts')
        .select('engagement_data')
        .eq('post_id', postId)
        .single();

      if (fetchError) throw fetchError;

      const currentEngagement = currentPost?.engagement_data || { likes: 0, shares: 0, views: 0 };
      currentEngagement[engagementType] = (currentEngagement[engagementType] || 0) + increment;

      const { error } = await supabaseAdmin
        .from('posts')
        .update({ engagement_data: currentEngagement })
        .eq('post_id', postId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating engagement:', error);
    }
  }
}

// Analytics utilities
export class Analytics {
  
  // Get audit statistics
  static async getAuditStats(): Promise<any> {
    try {
      const { data, error } = await supabaseAdmin
        .from('audit_analytics')
        .select('*')
        .order('audit_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      return [];
    }
  }

  // Get user engagement stats
  static async getUserStats(username: string): Promise<any> {
    try {
      const { data: auditCount, error: auditError } = await supabaseAdmin
        .from('audits')
        .select('id', { count: 'exact' })
        .eq('created_by', username);

      const { data: reportCount, error: reportError } = await supabaseAdmin
        .from('reports')
        .select('id', { count: 'exact' })
        .eq('created_by', username);

      if (auditError || reportError) throw auditError || reportError;

      return {
        totalAudits: auditCount?.length || 0,
        totalReports: reportCount?.length || 0
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { totalAudits: 0, totalReports: 0 };
    }
  }
} 