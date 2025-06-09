'use client';

import { useState, useEffect } from 'react';

interface Audit {
  id: string;
  type: 'seo' | 'gbp' | 'ai_analysis' | 'activity';
  title: string;
  data: any;
  createdAt: string;
  userId?: string;
  metadata?: {
    phoneNumber?: string;
    businessName?: string;
    website?: string;
    score?: number;
  };
}

interface AuditHistoryTabProps {
  isActive: boolean;
}

export function AuditHistoryTab({ isActive }: AuditHistoryTabProps) {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const auditTypes = [
    { value: 'all', label: 'All Audits', icon: '📊' },
    { value: 'seo', label: 'SEO Audits', icon: '🚀' },
    { value: 'gbp', label: 'GBP Audits', icon: '📍' },
    { value: 'ai_analysis', label: 'AI Analysis', icon: '🤖' },
    { value: 'activity', label: 'Activity Logs', icon: '📝' }
  ];

  const fetchAudits = async () => {
    if (!isActive) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') {
        params.append('type', selectedType);
      }
      params.append('limit', '100');
      
      const response = await fetch(`/api/audits?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch audits');
      }
      
      setAudits(data.audits || []);
    } catch (error) {
      console.error('Error fetching audits:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, [isActive, selectedType]);

  const handleDeleteAudit = async (auditId: string) => {
    if (!confirm('Are you sure you want to delete this audit?')) return;
    
    try {
      const response = await fetch(`/api/audits?id=${auditId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete audit');
      }
      
      setAudits(prev => prev.filter(audit => audit.id !== auditId));
    } catch (error) {
      console.error('Error deleting audit:', error);
      setError('Failed to delete audit');
    }
  };

  const handleExportAudit = (audit: Audit) => {
    const dataStr = JSON.stringify(audit, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-${audit.type}-${audit.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredAudits = audits.filter(audit =>
    audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audit.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (audit.metadata?.phoneNumber?.includes(searchTerm)) ||
    (audit.metadata?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (audit.metadata?.website?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getAuditIcon = (type: string) => {
    switch (type) {
      case 'seo': return '🚀';
      case 'gbp': return '📍';
      case 'ai_analysis': return '🤖';
      case 'activity': return '📝';
      default: return '📊';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatAuditData = (audit: Audit) => {
    if (typeof audit.data === 'string') {
      return audit.data;
    }
    return JSON.stringify(audit.data, null, 2);
  };

  if (!isActive) return null;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h2 className="text-2xl font-bold flex items-center space-x-3">
            <span className="text-3xl">📊</span>
            <span>Audit History</span>
          </h2>
          <p className="text-blue-100 mt-2">Access all your saved audits and analysis reports</p>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-tech-border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              {auditTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    selectedType === type.value
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-tech-secondary text-tech-foreground hover:bg-primary hover:bg-opacity-20'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search audits..."
                className="w-64 px-4 py-2 pl-10 bg-tech-secondary border border-tech-border rounded-lg text-tech-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">❌ {error}</div>
              <button
                onClick={fetchAudits}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : filteredAudits.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-tech-foreground mb-2">No Audits Found</h3>
              <p className="text-gray-400">
                {searchTerm ? 'No audits match your search criteria.' : 'Start generating audits to see them here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAudits.map((audit) => (
                <div key={audit.id} className="bg-tech-secondary rounded-lg border border-tech-border overflow-hidden">
                  {/* Audit Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getAuditIcon(audit.type)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-tech-foreground">{audit.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                          <span className="capitalize">{audit.type.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>{new Date(audit.createdAt).toLocaleString()}</span>
                          {audit.metadata?.score && (
                            <>
                              <span>•</span>
                              <span className={`font-semibold ${getScoreColor(audit.metadata.score)}`}>
                                Score: {audit.metadata.score}%
                              </span>
                            </>
                          )}
                        </div>
                        {audit.metadata && (
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            {audit.metadata.businessName && <span>📊 {audit.metadata.businessName}</span>}
                            {audit.metadata.phoneNumber && <span>📞 {audit.metadata.phoneNumber}</span>}
                            {audit.metadata.website && <span>🌐 {audit.metadata.website}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setExpandedAudit(expandedAudit === audit.id ? null : audit.id)}
                        className="p-2 text-gray-400 hover:text-tech-foreground transition-colors duration-200"
                        title="View Details"
                      >
                        <svg className={`w-5 h-5 transform transition-transform duration-200 ${expandedAudit === audit.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleExportAudit(audit)}
                        className="p-2 text-gray-400 hover:text-tech-foreground transition-colors duration-200"
                        title="Export Audit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteAudit(audit.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
                        title="Delete Audit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedAudit === audit.id && (
                    <div className="border-t border-tech-border p-4 bg-tech-background">
                      <pre className="text-sm text-tech-foreground whitespace-pre-wrap overflow-x-auto bg-black bg-opacity-20 p-4 rounded-lg">
                        {formatAuditData(audit)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 