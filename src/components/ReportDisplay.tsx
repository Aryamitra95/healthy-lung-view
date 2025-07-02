
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
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ report }) => {
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
