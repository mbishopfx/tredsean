'use client';

// Force fresh deployment - CSV Lead Validator v1.0
import React, { useState, useRef } from 'react';

// Simple SVG Icons
const UploadIcon = () => (
  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const FileTextIcon = () => (
  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6 text-primary mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-6 h-6 text-green-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-6 h-6 text-blue-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-6 h-6 text-purple-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

interface ValidationStats {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicatePhones: number;
  mobileNumbers: number;
  landlines: number;
  emailsFound: number;
  companiesFound: number;
  namesFound: number;
  availableVariables: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  stats: ValidationStats;
}

interface ValidationResponse {
  success: boolean;
  action: 'validated' | 'fixed';
  validation: ValidationResult;
  cleanedCSV?: string;
  fileName?: string;
  readyForCampaign: boolean;
  summary?: {
    originalCount: number;
    afterCleaning: number;
    removed: number;
    duplicatesRemoved: number;
    readyForCampaign: boolean;
  };
}

interface CSVValidatorProps {
  onValidationComplete?: (result: ValidationResponse) => void;
  onAutoStage?: (csvData: string, fileName: string) => void;
}

export function CSVValidator({ onValidationComplete, onAutoStage }: CSVValidatorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);
  const [isFixing, setIsFixing] = useState(false);
  const [autoStaged, setAutoStaged] = useState(false);
  const [showAutoStageAlert, setShowAutoStageAlert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dncFile, setDncFile] = useState<File | null>(null);
  const [dncNumbers, setDncNumbers] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('dncNumbers');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });
  const dncInputRef = useRef<HTMLInputElement>(null);
  const [dncFileName, setDncFileName] = useState<string>('');

  // Helper to normalize phone numbers for matching
  const normalizePhone = (phone: string) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1); // US with country code
    if (digits.length >= 10) return digits.slice(-10); // last 10 digits for comparison
    return digits;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidationResult(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.toLowerCase().endsWith('.csv')) {
      setFile(droppedFile);
      setValidationResult(null);
    }
  };

  const handleDncSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    try {
      const text = await selected.text();
      const lines = text.split('\n').filter(Boolean);
      let headerTokens: string[] = [];
      const extracted: string[] = [];

      if (lines.length > 0) {
        headerTokens = lines[0].split(',').map(h => h.trim().toLowerCase());
      }
      const phoneColIndex = headerTokens.findIndex(h => h.includes('phone'));

      for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
        let raw = '';
        if (phoneColIndex !== -1 && cols[phoneColIndex]) {
          raw = cols[phoneColIndex];
        } else if (i !== 0 || phoneColIndex === -1) {
          // Assume whole line is a phone number when no headers
          raw = cols[0];
        }
        if (raw) {
          const norm = normalizePhone(raw);
          if (norm && !extracted.includes(norm)) extracted.push(norm);
        }
      }

      setDncFile(selected);
      setDncFileName(selected.name);
      setDncNumbers(extracted);
      if (typeof window !== 'undefined') {
        localStorage.setItem('dncNumbers', JSON.stringify(extracted));
      }
    } catch (err) {
      console.error('Failed to parse DNC file', err);
    }
  };

  const validateCSV = async (mode: 'validate' | 'fix' = 'validate') => {
    if (!file) return;

    const loadingState = mode === 'validate' ? setIsValidating : setIsFixing;
    loadingState(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);

      const response = await fetch('/api/csv-validator', {
        method: 'POST',
        body: formData,
      });

      const result: ValidationResponse = await response.json();
      
      // If we have a cleanedCSV and DNC numbers, filter out any matches
      if (result.cleanedCSV && dncNumbers.length > 0) {
        const lines = result.cleanedCSV.split('\n');
        if (lines.length > 1) {
          const headers = lines[0].split(',');
          const phoneIdx = headers.findIndex(h => h.toLowerCase().includes('phone'));
          if (phoneIdx !== -1) {
            const filtered = [lines[0],
              ...lines.slice(1).filter(line => {
                const cols = line.split(',');
                const phoneRaw = cols[phoneIdx]?.replace(/"/g, '').trim();
                const norm = normalizePhone(phoneRaw);
                return norm && !dncNumbers.includes(norm);
              })
            ];
            const removedByDnc = lines.length - filtered.length;
            result.cleanedCSV = filtered.join('\n');
            // Update summary if available
            if (result.summary) {
              result.summary.afterCleaning = filtered.length - 1; // minus header
              result.summary.removed += removedByDnc;
            }
          }
        }
      }

      if (response.ok) {
        setValidationResult(result);
        onValidationComplete?.(result);
        
        // Auto-stage if cleaned CSV is available and ready for campaign
        if (result.cleanedCSV && result.readyForCampaign && onAutoStage && !autoStaged) {
          onAutoStage(result.cleanedCSV, result.fileName || file?.name || 'cleaned_leads.csv');
          setAutoStaged(true);
          setShowAutoStageAlert(true);
          
          // Hide alert after 5 seconds
          setTimeout(() => {
            setShowAutoStageAlert(false);
          }, 5000);
        }
      } else {
        console.error('Validation error:', result);
        setValidationResult({
          success: false,
          action: mode === 'validate' ? 'validated' : 'fixed',
          validation: {
            isValid: false,
            errors: [(result as any).error || 'Unknown error occurred'],
            warnings: [],
            suggestions: [],
            stats: {
              totalRows: 0,
              validRows: 0,
              invalidRows: 0,
              duplicatePhones: 0,
              mobileNumbers: 0,
              landlines: 0,
              emailsFound: 0,
              companiesFound: 0,
              namesFound: 0,
              availableVariables: []
            }
          },
          readyForCampaign: false
        });
      }
    } catch (error) {
      console.error('Error validating CSV:', error);
      setValidationResult({
        success: false,
        action: mode === 'validate' ? 'validated' : 'fixed',
        validation: {
          isValid: false,
          errors: ['Failed to validate CSV file'],
          warnings: [],
          suggestions: [],
          stats: {
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
            duplicatePhones: 0,
            mobileNumbers: 0,
            landlines: 0,
            emailsFound: 0,
            companiesFound: 0,
            namesFound: 0,
            availableVariables: []
          }
        },
        readyForCampaign: false
      });
    } finally {
      loadingState(false);
    }
  };

  const downloadCleanedCSV = () => {
    if (!validationResult?.cleanedCSV) return;

    const blob = new Blob([validationResult.cleanedCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = validationResult.fileName || 'cleaned_leads.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetValidator = () => {
    setFile(null);
    setValidationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-tech-card border border-tech-border rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary bg-opacity-20 rounded-lg">
          <FileTextIcon />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-tech-foreground">CSV Lead Validator</h3>
          <p className="text-sm text-gray-400">
            Validate and clean your lead CSV files with automatic campaign staging
          </p>
        </div>
      </div>

      {/* Auto-Stage Success Alert */}
      {showAutoStageAlert && (
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg p-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-green-400 font-semibold">🎉 CSV Auto-Staged Successfully!</p>
              <p className="text-sm text-gray-300 mt-1">
                Your cleaned CSV has been automatically loaded into the mass messaging system. You can still download it below if needed.
              </p>
            </div>
            <button
              onClick={() => setShowAutoStageAlert(false)}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* File Upload Area */}
      {!file && (
        <div
          className="border-2 border-dashed border-tech-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon />
          <p className="text-tech-foreground font-medium mb-2">
            Drop your CSV file here or click to browse
          </p>
          <p className="text-sm text-gray-400">
            Supports .csv files with lead data (name, phone, company, etc.)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* NEW: Do Not Contact Upload */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Do-Not-Contact List (optional)</h4>
        {!dncFile && (
          <div
            className="border-2 border-dashed border-tech-border rounded-lg p-6 text-center hover:border-yellow-500 transition-colors cursor-pointer"
            onClick={() => dncInputRef.current?.click()}
          >
            <p className="text-gray-400">Upload CSV of numbers to exclude from future sends</p>
            <input
              ref={dncInputRef}
              type="file"
              accept=".csv"
              onChange={handleDncSelect}
              className="hidden"
            />
          </div>
        )}
        {dncFile && (
          <div className="bg-tech-input border border-tech-border rounded-lg p-4 flex items-center justify-between mt-2">
            <div className="text-tech-foreground text-sm flex-1 truncate">
              {dncFileName} ({dncNumbers.length} numbers)
            </div>
            <button
              onClick={() => {
                setDncFile(null);
                setDncFileName('');
                setDncNumbers([]);
                if (typeof window !== 'undefined') localStorage.removeItem('dncNumbers');
              }}
              className="text-red-400 text-xs ml-4 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* File Selected */}
      {file && !validationResult && (
        <div className="bg-tech-input border border-tech-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileTextIcon />
              <div>
                <p className="text-tech-foreground font-medium">{file.name}</p>
                <p className="text-sm text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => validateCSV('validate')}
                disabled={isValidating}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isValidating ? 'Validating...' : 'Validate CSV'}
              </button>
              <button
                onClick={resetValidator}
                className="px-4 py-2 bg-tech-secondary text-tech-foreground rounded-md hover:bg-opacity-80 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Results */}
      {validationResult && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg border ${
            validationResult.readyForCampaign
              ? 'bg-green-500 bg-opacity-10 border-green-500 border-opacity-30'
              : validationResult.validation.isValid
              ? 'bg-yellow-500 bg-opacity-10 border-yellow-500 border-opacity-30'
              : 'bg-red-500 bg-opacity-10 border-red-500 border-opacity-30'
          }`}>
            <div className="flex items-center space-x-3">
              {validationResult.readyForCampaign ? (
                <CheckCircleIcon />
              ) : validationResult.validation.isValid ? (
                <AlertTriangleIcon />
              ) : (
                <XCircleIcon />
              )}
              <div>
                <p className="font-semibold text-tech-foreground">
                  {validationResult.readyForCampaign
                    ? '✅ Ready for Campaigns!'
                    : validationResult.validation.isValid
                    ? '⚠️ Needs Attention'
                    : '❌ Validation Failed'
                  }
                </p>
                <p className="text-sm text-gray-300">
                  {validationResult.readyForCampaign
                    ? 'Your CSV is properly formatted and ready for mass messaging and drip campaigns'
                    : validationResult.validation.isValid
                    ? 'CSV is valid but could be improved for better results'
                    : 'CSV has critical issues that need to be fixed'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-tech-input border border-tech-border rounded-lg p-4 text-center">
              <UsersIcon />
              <p className="text-2xl font-bold text-tech-foreground">
                {validationResult.validation.stats.totalRows}
              </p>
              <p className="text-sm text-gray-400">Total Leads</p>
            </div>
            
            <div className="bg-tech-input border border-tech-border rounded-lg p-4 text-center">
              <PhoneIcon />
              <p className="text-2xl font-bold text-tech-foreground">
                {validationResult.validation.stats.mobileNumbers}
              </p>
              <p className="text-sm text-gray-400">Mobile Numbers</p>
            </div>
            
            <div className="bg-tech-input border border-tech-border rounded-lg p-4 text-center">
              <BuildingIcon />
              <p className="text-2xl font-bold text-tech-foreground">
                {validationResult.validation.stats.companiesFound}
              </p>
              <p className="text-sm text-gray-400">Companies</p>
            </div>
            
            <div className="bg-tech-input border border-tech-border rounded-lg p-4 text-center">
              <MailIcon />
              <p className="text-2xl font-bold text-tech-foreground">
                {validationResult.validation.stats.emailsFound}
              </p>
              <p className="text-sm text-gray-400">Emails</p>
            </div>
          </div>

          {/* Available Variables */}
          {validationResult.validation.stats.availableVariables.length > 0 && (
            <div className="bg-tech-input border border-tech-border rounded-lg p-4">
              <h4 className="font-semibold text-tech-foreground mb-3">
                📧 Available Message Variables
              </h4>
              <p className="text-sm text-gray-400 mb-3">
                Use these variables in your messages for personalization:
              </p>
              <div className="flex flex-wrap gap-2">
                {validationResult.validation.stats.availableVariables.map((variable) => (
                  <span
                    key={variable}
                    className="bg-primary bg-opacity-20 text-primary px-3 py-1 rounded-full text-sm font-mono"
                  >
                    {`{${variable}}`}
                  </span>
                ))}
              </div>
              <div className="mt-3 p-3 bg-tech-secondary bg-opacity-30 rounded-md">
                <p className="text-sm text-gray-300">
                  <strong>Example message:</strong> "Hi {'{name}'}, I noticed {'{company}'} could benefit from our services. 
                  We help {'{industry}'} businesses in {'{city}'} increase their revenue. Quick call this {'{current_month}'}?"
                </p>
              </div>
            </div>
          )}

          {/* Issues and Suggestions */}
          {(validationResult.validation.errors.length > 0 || 
            validationResult.validation.warnings.length > 0 || 
            validationResult.validation.suggestions.length > 0) && (
            <div className="space-y-4">
              {/* Errors */}
              {validationResult.validation.errors.length > 0 && (
                <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-4">
                  <h4 className="font-semibold text-red-400 mb-2">🚨 Errors</h4>
                  <ul className="space-y-1">
                    {validationResult.validation.errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-300">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {validationResult.validation.warnings.length > 0 && (
                <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-400 mb-2">⚠️ Warnings</h4>
                  <ul className="space-y-1">
                    {validationResult.validation.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-yellow-300">• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {validationResult.validation.suggestions.length > 0 && (
                <div className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-400 mb-2">💡 Suggestions</h4>
                  <ul className="space-y-1">
                    {validationResult.validation.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-blue-300">• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {validationResult.action === 'validated' && validationResult.validation.stats.mobileNumbers > 0 && (
              <button
                onClick={() => validateCSV('fix')}
                disabled={isFixing}
                className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CheckCircleIcon />
                <span>{isFixing ? 'Fixing...' : 'Fix & Clean CSV'}</span>
              </button>
            )}

            {validationResult.action === 'fixed' && validationResult.cleanedCSV && (
              <button
                onClick={downloadCleanedCSV}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <DownloadIcon />
                <span>Download Cleaned CSV</span>
              </button>
            )}

            <button
              onClick={resetValidator}
              className="px-6 py-3 bg-tech-secondary text-tech-foreground rounded-md hover:bg-opacity-80 transition-colors"
            >
              Validate Another File
            </button>
          </div>

          {/* Summary for Fixed CSV */}
          {validationResult.summary && (
            <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-3">📊 Cleaning Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Original</p>
                  <p className="text-tech-foreground font-semibold">
                    {validationResult.summary.originalCount} leads
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">After Cleaning</p>
                  <p className="text-tech-foreground font-semibold">
                    {validationResult.summary.afterCleaning} leads
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Removed</p>
                  <p className="text-red-400 font-semibold">
                    {validationResult.summary.removed} leads
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Ready for SMS</p>
                  <p className="text-green-400 font-semibold">
                    {validationResult.summary.afterCleaning} leads
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 