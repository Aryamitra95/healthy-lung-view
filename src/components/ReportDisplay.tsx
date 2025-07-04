
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import generatePDF from 'react-to-pdf';

interface ReportData {
  summary: string;
  cause: string;
  suggestedActions: string;
}

interface ReportDisplayProps {
  report: ReportData | null;
  error?: string | null;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, error }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: 'Medical Report',
  });

  if (error) {
    return (
      <Card className="border-2 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Report Generation Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3 p-4 bg-red-100 rounded-lg">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card className="border-2 border-medical-green-light">
        <CardHeader>
          <CardTitle className="text-medical-green">Generated Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Generate a report to view detailed analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-medical-green-light animate-fade-in">
      <CardHeader>
        <CardTitle className="text-medical-green">Generated Report</CardTitle>
      </CardHeader>
      <CardContent>
        {/* PDF & Print Buttons only when report exists */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            onClick={() => generatePDF(contentRef, { filename: 'report.pdf' })}
            size="sm"
          >
            <Download className="w-4 h-4 mr-1" /> Download as PDF
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            size="sm"
          >
            <Printer className="w-4 h-4 mr-1" /> Print
          </Button>
        </div>
        {/* Main content to export/print */}
        <div ref={contentRef}>
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-medical-green-light">
              <TabsTrigger 
                value="summary" 
                className="data-[state=active]:bg-medical-green data-[state=active]:text-white"
              >
                Summary
              </TabsTrigger>
              <TabsTrigger 
                value="cause"
                className="data-[state=active]:bg-medical-green data-[state=active]:text-white"
              >
                Cause
              </TabsTrigger>
              <TabsTrigger 
                value="actions"
                className="data-[state=active]:bg-medical-green data-[state=active]:text-white"
              >
                Suggested actions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="mt-6">
              <div className="bg-gray-50 rounded-lg p-6 min-h-[200px]">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {report.summary}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="cause" className="mt-6">
              <div className="bg-gray-50 rounded-lg p-6 min-h-[200px]">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {report.cause}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="actions" className="mt-6">
              <div className="bg-gray-50 rounded-lg p-6 min-h-[200px]">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {report.suggestedActions}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportDisplay;
