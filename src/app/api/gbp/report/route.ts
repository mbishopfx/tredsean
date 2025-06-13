import { NextRequest, NextResponse } from 'next/server';
import { AuditStorage, ReportStorage } from '@/lib/supabase';
import jsPDF from 'jspdf';

export async function POST(request: NextRequest) {
  try {
    const { auditId } = await request.json();

    if (!auditId) {
      return NextResponse.json(
        { error: 'Audit ID is required' },
        { status: 400 }
      );
    }

    // Get audit data from storage
    const auditData = await AuditStorage.getAuditById(auditId);
    
    if (!auditData) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    // Generate PDF report
    const pdfBuffer = await generatePDFReport(auditData);
    
    // Save to Supabase storage
    const fileName = `TRD-AI-Audit-${auditData.data.businessName}-${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = `reports/${auditId}/${fileName}`;
    
    try {
      // Upload to Supabase storage
      await ReportStorage.uploadReport(filePath, pdfBuffer, 'application/pdf');
      
      // Save report metadata
      await ReportStorage.saveReport(
        auditId,
        auditData.audit_type as 'basic' | 'detailed',
        fileName,
        filePath,
        auditData.created_by
      );
    } catch (storageError) {
      console.error('Failed to save to storage:', storageError);
      // Continue with download even if storage fails
    }

    // Return PDF for download
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

async function generatePDFReport(auditData: any): Promise<Buffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header
  doc.setFillColor(0, 123, 255);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TRUE RANK DIGITAL', 20, 20);
  
  doc.setFontSize(12);
  doc.text('AI-Powered Business Optimization Audit', 20, 25);
  
  // Business Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Business: ${auditData.data.businessName}`, 20, 50);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Audit Date: ${new Date(auditData.created_at).toLocaleDateString()}`, 20, 60);
  doc.text(`Audit ID: ${auditData.id}`, 20, 65);
  
  // Overall Score
  const score = auditData.data.overallScore || auditData.data.auditResult?.overallScore || 0;
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  
  // Score color
  if (score >= 80) doc.setTextColor(0, 150, 0);
  else if (score >= 60) doc.setTextColor(255, 165, 0);
  else doc.setTextColor(255, 0, 0);
  
  doc.text(`Overall Score: ${score}/100`, 20, 85);
  
  // Score breakdown
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Score Breakdown:', 20, 105);
  
  doc.setFont('helvetica', 'normal');
  let yPos = 115;
  
  const auditResult = auditData.data.auditResult || auditData.data;
  
  if (auditResult.listingCompletenessScore !== undefined) {
    doc.text(`• Listing Completeness: ${auditResult.listingCompletenessScore}/100`, 25, yPos);
    yPos += 10;
  }
  
  if (auditResult.contentAlignmentScore !== undefined) {
    doc.text(`• Content Alignment: ${auditResult.contentAlignmentScore}/100`, 25, yPos);
    yPos += 10;
  }
  
  if (auditResult.localSeoReadinessScore !== undefined) {
    doc.text(`• Local SEO Readiness: ${auditResult.localSeoReadinessScore}/100`, 25, yPos);
    yPos += 10;
  }
  
  // Recommendations
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Priority Recommendations:', 20, yPos);
  yPos += 10;
  
  doc.setFont('helvetica', 'normal');
  const recommendations = auditResult.recommendations?.critical || [];
  recommendations.slice(0, 5).forEach((rec: string, index: number) => {
    const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
    lines.forEach((line: string) => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 25, yPos);
      yPos += 7;
    });
  });
  
  // TRD Opportunity
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 123, 255);
  doc.text('True Rank Digital Opportunity:', 20, yPos);
  yPos += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const opportunity = `With True Rank Digital's AI-powered optimization scripts, ${auditData.data.businessName} could improve their digital presence by up to ${Math.min(40, 100 - score)} points, significantly outperforming competitors and capturing more customers.`;
  
  const opportunityLines = doc.splitTextToSize(opportunity, pageWidth - 40);
  opportunityLines.forEach((line: string) => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, 25, yPos);
    yPos += 7;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Generated by True Rank Digital AI Audit System', 20, pageHeight - 10);
  doc.text('Contact: hello@truerankdigital.com | www.truerankdigital.com', pageWidth - 120, pageHeight - 10);
  
  return Buffer.from(doc.output('arraybuffer'));
} 