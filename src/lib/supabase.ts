import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser/frontend use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
}

export class ReportStorage {
  
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
      const { error } = await supabaseAdmin
        .from('reports')
        .update({ 
          download_count: supabaseAdmin.sql`download_count + 1`,
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