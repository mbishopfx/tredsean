'use client';

// Force fresh deployment - CSV Lead Validator v1.0
import React, { useState, useRef } from 'react';
import { Upload, Download, CheckCircle, AlertTriangle, XCircle, FileText, Users, Mail, Phone, Building } from 'lucide-react';

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
}

export function CSVValidator({ onValidationComplete }: CSVValidatorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);
  const [isFixing, setIsFixing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      if (response.ok) {
        setValidationResult(result);
        onValidationComplete?.(result);
      } else {
        console.error('Validation error:', result);
        setValidationResult({
          success: false,
          action: mode,
          validation: {
            isValid: false,
            errors: [result.error || 'Unknown error occurred'],
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
        action: mode,
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
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-tech-foreground">CSV Lead Validator</h3>
          <p className="text-sm text-gray-400">
            Validate and fix your lead CSV files for mass messaging and drip campaigns
          </p>
        </div>
      </div>

      {/* File Upload Area */}
      {!file && (
        <div
          className="border-2 border-dashed border-tech-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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

      {/* File Selected */}
      {file && !validationResult && (
        <div className="bg-tech-input border border-tech-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-primary" />
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
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : validationResult.validation.isValid ? (
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400" />
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
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-tech-foreground">
                {validationResult.validation.stats.totalRows}
              </p>
              <p className="text-sm text-gray-400">Total Leads</p>
            </div>
            
            <div className="bg-tech-input border border-tech-border rounded-lg p-4 text-center">
              <Phone className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-tech-foreground">
                {validationResult.validation.stats.mobileNumbers}
              </p>
              <p className="text-sm text-gray-400">Mobile Numbers</p>
            </div>
            
            <div className="bg-tech-input border border-tech-border rounded-lg p-4 text-center">
              <Building className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-tech-foreground">
                {validationResult.validation.stats.companiesFound}
              </p>
              <p className="text-sm text-gray-400">Companies</p>
            </div>
            
            <div className="bg-tech-input border border-tech-border rounded-lg p-4 text-center">
              <Mail className="w-6 h-6 text-purple-400 mx-auto mb-2" />
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
                <CheckCircle className="w-4 h-4" />
                <span>{isFixing ? 'Fixing...' : 'Fix & Clean CSV'}</span>
              </button>
            )}

            {validationResult.action === 'fixed' && validationResult.cleanedCSV && (
              <button
                onClick={downloadCleanedCSV}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
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