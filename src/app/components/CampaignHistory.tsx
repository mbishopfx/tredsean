'use client';

import { useState, useEffect } from 'react';

interface Campaign {
  campaignId: string;
  type: string;
  status: string;
  totalRecipients: number;
  successful: number;
  failed: number;
  startTime: string;
  endTime?: string;
  actualCost: string;
  successRate: string;
}

interface CampaignHistoryProps {
  isActive: boolean;
}

export function CampaignHistory({ isActive }: CampaignHistoryProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalMessages: 0,
    overallSuccessRate: 0,
    totalCost: 0
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/campaigns/track');
      const data = await response.json();
      
      if (response.ok) {
        setCampaigns(data.campaigns || []);
        
        // Calculate overall stats
        const totalMessages = data.campaigns.reduce((sum: number, c: Campaign) => sum + c.totalRecipients, 0);
        const totalSuccessful = data.campaigns.reduce((sum: number, c: Campaign) => sum + c.successful, 0);
        const totalCost = data.campaigns.reduce((sum: number, c: Campaign) => sum + parseFloat(c.actualCost), 0);
        
        setStats({
          totalCampaigns: data.campaigns.length,
          totalMessages,
          overallSuccessRate: totalMessages > 0 ? (totalSuccessful / totalMessages) * 100 : 0,
          totalCost
        });
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignDetails = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/track?campaignId=${campaignId}`);
      const data = await response.json();
      
      if (response.ok) {
        setSelectedCampaign(data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Failed to fetch campaign details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900';
      case 'in_progress': return 'text-yellow-400 bg-yellow-900';
      case 'started': return 'text-blue-400 bg-blue-900';
      case 'failed': return 'text-red-400 bg-red-900';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-400';
    if (rate >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  useEffect(() => {
    if (isActive) {
      fetchCampaigns();
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold">Campaign History</h2>
          <div className="ml-4 px-3 py-1 bg-tech-card text-xs rounded-full text-primary flex items-center">
            <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse-slow"></span>
            Mass Messaging Analytics
          </div>
        </div>
        <button
          onClick={fetchCampaigns}
          disabled={loading}
          className="px-4 py-2 bg-tech-secondary hover:bg-tech-border text-white rounded transition-colors duration-200"
        >
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <div className="p-6">
            <div className="text-gray-400 text-sm">Total Campaigns</div>
            <div className="text-2xl font-bold text-tech-foreground">{stats.totalCampaigns}</div>
          </div>
        </div>
        
        <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
          <div className="p-6">
            <div className="text-gray-400 text-sm">Total Messages</div>
            <div className="text-2xl font-bold text-tech-foreground">{stats.totalMessages.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-yellow-500 to-green-500"></div>
          <div className="p-6">
            <div className="text-gray-400 text-sm">Success Rate</div>
            <div className={`text-2xl font-bold ${getSuccessRateColor(stats.overallSuccessRate)}`}>
              {stats.overallSuccessRate.toFixed(1)}%
            </div>
          </div>
        </div>
        
        <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <div className="p-6">
            <div className="text-gray-400 text-sm">Total Cost</div>
            <div className="text-2xl font-bold text-tech-foreground">${stats.totalCost.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
        <div className="h-1 bg-gradient"></div>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Campaigns</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No campaigns found. Start your first mass messaging campaign!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-tech-border">
                    <th className="text-left py-3 px-4 text-gray-400">Campaign ID</th>
                    <th className="text-left py-3 px-4 text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400">Recipients</th>
                    <th className="text-left py-3 px-4 text-gray-400">Success Rate</th>
                    <th className="text-left py-3 px-4 text-gray-400">Cost</th>
                    <th className="text-left py-3 px-4 text-gray-400">Started</th>
                    <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign, index) => (
                    <tr key={campaign.campaignId} className="border-b border-tech-border hover:bg-tech-secondary transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono text-xs text-primary">
                          {campaign.campaignId.split('_')[1]?.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-tech-foreground">{campaign.totalRecipients}</div>
                        <div className="text-xs text-gray-400">
                          {campaign.successful} sent, {campaign.failed} failed
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`font-bold ${getSuccessRateColor(parseFloat(campaign.successRate))}`}>
                          {campaign.successRate}%
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-tech-foreground">${campaign.actualCost}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-tech-foreground">
                          {new Date(campaign.startTime).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(campaign.startTime).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => fetchCampaignDetails(campaign.campaignId)}
                          className="text-primary hover:text-primary-light text-xs bg-tech-secondary hover:bg-tech-border px-2 py-1 rounded transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Details Modal */}
      {showDetails && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-tech-card rounded-lg shadow-tech max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="h-1 bg-gradient"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Campaign Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-300 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-gray-400 text-sm">Campaign ID</div>
                    <div className="font-mono text-primary">{selectedCampaign.campaignId}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Status</div>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedCampaign.status)}`}>
                      {selectedCampaign.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Duration</div>
                    <div className="text-tech-foreground">
                      {new Date(selectedCampaign.startTime).toLocaleString()}
                      {selectedCampaign.endTime && (
                        <> - {new Date(selectedCampaign.endTime).toLocaleString()}</>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-gray-400 text-sm">Message Template</div>
                    <div className="bg-tech-secondary p-3 rounded text-sm max-h-32 overflow-y-auto">
                      {selectedCampaign.messageTemplate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-tech-secondary p-4 rounded">
                  <div className="text-gray-400 text-sm">Total Recipients</div>
                  <div className="text-xl font-bold text-tech-foreground">{selectedCampaign.totalRecipients}</div>
                </div>
                <div className="bg-tech-secondary p-4 rounded">
                  <div className="text-gray-400 text-sm">Successful</div>
                  <div className="text-xl font-bold text-green-400">{selectedCampaign.successful}</div>
                </div>
                <div className="bg-tech-secondary p-4 rounded">
                  <div className="text-gray-400 text-sm">Failed</div>
                  <div className="text-xl font-bold text-red-400">{selectedCampaign.failed}</div>
                </div>
                <div className="bg-tech-secondary p-4 rounded">
                  <div className="text-gray-400 text-sm">Success Rate</div>
                  <div className={`text-xl font-bold ${getSuccessRateColor(
                    selectedCampaign.totalRecipients > 0 
                      ? (selectedCampaign.successful / selectedCampaign.totalRecipients) * 100 
                      : 0
                  )}`}>
                    {selectedCampaign.totalRecipients > 0 
                      ? ((selectedCampaign.successful / selectedCampaign.totalRecipients) * 100).toFixed(1)
                      : '0.0'
                    }%
                  </div>
                </div>
              </div>

              {/* Message Details */}
              {selectedCampaign.details && selectedCampaign.details.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Message Details</h4>
                  <div className="bg-tech-secondary rounded max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-tech-secondary">
                        <tr className="border-b border-tech-border">
                          <th className="text-left py-2 px-3 text-gray-400">Phone</th>
                          <th className="text-left py-2 px-3 text-gray-400">Status</th>
                          <th className="text-left py-2 px-3 text-gray-400">Time</th>
                          <th className="text-left py-2 px-3 text-gray-400">Contact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCampaign.details.map((detail: any, index: number) => (
                          <tr key={index} className="border-b border-tech-border">
                            <td className="py-2 px-3 font-mono text-xs">{detail.phone}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                detail.status === 'sent' 
                                  ? 'bg-green-900 text-green-400' 
                                  : 'bg-red-900 text-red-400'
                              }`}>
                                {detail.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-xs">
                              {new Date(detail.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="py-2 px-3 text-xs">
                              {detail.contact?.name || detail.contact?.company || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 