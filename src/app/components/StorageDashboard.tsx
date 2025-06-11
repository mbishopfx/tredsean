'use client';

import { useState, useEffect } from 'react';
import { listFiles, getPublicUrl, downloadFile } from '../../lib/supabase';

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: any;
}

interface StorageDashboardProps {
  isActive: boolean;
}

export function StorageDashboard({ isActive }: StorageDashboardProps) {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('campaigns');
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUsername(localStorage.getItem('username') || '');
    }
  }, []);

  useEffect(() => {
    if (isActive && username) {
      loadFiles();
    }
  }, [isActive, selectedFolder, username]);

  const loadFiles = async () => {
    if (!username) return;
    
    setLoading(true);
    try {
      const folderPath = `${selectedFolder}/${username}`;
      const fileList = await listFiles(folderPath);
      setFiles(fileList || []);
    } catch (error) {
      console.error('Failed to load files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadFileHandler = async (fileName: string) => {
    try {
      const folderPath = `${selectedFolder}/${username}/${fileName}`;
      const fileBlob = await downloadFile(folderPath);
      
      // Create download link
      const url = URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
      alert('Failed to download file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isActive) return null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold">Storage Dashboard</h2>
          <div className="ml-4 px-3 py-1 bg-tech-card text-xs rounded-full text-primary flex items-center">
            <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse-slow"></span>
            Supabase Cloud Storage
          </div>
        </div>
        
        <button
          onClick={loadFiles}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors duration-200"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Folder Selection */}
      <div className="mb-6">
        <div className="flex bg-tech-card rounded-lg p-1">
          {['campaigns', 'cleaned-csvs', 'activity-logs', 'posts'].map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedFolder === folder
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {folder.charAt(0).toUpperCase() + folder.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* User Info */}
      {username && (
        <div className="mb-4 p-3 bg-tech-card rounded-lg">
          <div className="text-sm text-gray-400">
            Viewing files for: <span className="text-primary font-medium">{username}</span>
          </div>
        </div>
      )}

      {/* Files List */}
      <div className="bg-tech-card rounded-lg shadow-tech overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No files found in {selectedFolder}</p>
              <p className="text-sm mt-2">Files will appear here after you create campaigns, upload CSVs, or perform activities.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-tech-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Last Modified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tech-border">
                {files.map((file, index) => (
                  <tr key={file.id || index} className="hover:bg-tech-secondary/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          {file.name.endsWith('.json') ? (
                            <div className="h-8 w-8 bg-blue-500/20 rounded flex items-center justify-center">
                              <span className="text-blue-400 text-xs font-bold">JSON</span>
                            </div>
                          ) : file.name.endsWith('.csv') ? (
                            <div className="h-8 w-8 bg-green-500/20 rounded flex items-center justify-center">
                              <span className="text-green-400 text-xs font-bold">CSV</span>
                            </div>
                          ) : (
                            <div className="h-8 w-8 bg-gray-500/20 rounded flex items-center justify-center">
                              <span className="text-gray-400 text-xs font-bold">FILE</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-tech-foreground">
                            {file.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(file.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(file.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => downloadFileHandler(file.name)}
                        className="text-primary hover:text-primary/80 mr-4"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => {
                          const url = getPublicUrl(`${selectedFolder}/${username}/${file.name}`);
                          window.open(url, '_blank');
                        }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Storage Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-tech-card rounded-lg p-4">
          <div className="text-sm text-gray-400">Total Files</div>
          <div className="text-2xl font-bold text-primary">{files.length}</div>
        </div>
        <div className="bg-tech-card rounded-lg p-4">
          <div className="text-sm text-gray-400">Current Folder</div>
          <div className="text-lg font-medium text-tech-foreground capitalize">
            {selectedFolder.replace('-', ' ')}
          </div>
        </div>
        <div className="bg-tech-card rounded-lg p-4">
          <div className="text-sm text-gray-400">Storage Location</div>
          <div className="text-lg font-medium text-green-400">Supabase Cloud</div>
        </div>
      </div>
    </div>
  );
} 