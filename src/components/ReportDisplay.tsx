
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
      </CardContent>
    </Card>
  );
};

export default ReportDisplay;
