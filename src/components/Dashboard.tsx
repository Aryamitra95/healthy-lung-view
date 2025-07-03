
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Stethoscope } from 'lucide-react';
import FileUpload from './FileUpload';
import PredictionDisplay from './PredictionDisplay';
import ReportDisplay from './ReportDisplay';
import { generateMedicalReport } from '@/services/medicalReportService';

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

interface PredictionData {
  healthy: number;
  tuberculosis: number;
  pneumonia: number;
  prediction: string;
}

interface ReportData {
  summary: string;
  cause: string;
  suggestedActions: string;
}

const Dashboard: React.FC<DashboardProps> = ({ username, onLogout }) => {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const handlePredictionReceived = (predictionData: PredictionData) => {
    setPrediction(predictionData);
    setReport(null); // Reset report when new prediction is received
    setReportError(null); // Reset error when new prediction is received
  };

  const handleGenerateReport = async () => {
    if (!prediction) return;

    try {
      setIsGeneratingReport(true);
      setReportError(null); // Clear any previous errors
      
      const generatedReport = await generateMedicalReport(prediction);
      
      if (generatedReport) {
        setReport(generatedReport);
      } else {
        setReportError('Failed to generate medical report. Please check your API configuration and try again.');
        setReport(null);
      }
      
    } catch (error) {
      console.error('Report generation error:', error);
      setReportError('An error occurred while generating the report. Please try again.');
      setReport(null);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="min-h-screen medical-bg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-medical-green-light">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-medical-green p-2 rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-medical-green">Lung Lens</h1>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-medical-green-light hover:bg-medical-green-light"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="border-2 border-medical-green-light medical-gradient">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 border-4 border-white">
                  <AvatarFallback className="bg-white text-medical-green text-xl font-bold">
                    {username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Welcome, Dr. {username}
                  </h2>
                  <p className="text-white/90">
                    Ready to analyze chest X-rays with AI-powered diagnostics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* File Upload Section */}
          <div>
            <Card className="border-2 border-medical-green-light">
              <CardHeader>
                <CardTitle className="text-medical-green">Upload X-ray Image</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload onPredictionReceived={handlePredictionReceived} />
              </CardContent>
            </Card>
          </div>

          {/* Prediction Section */}
          <div>
            <PredictionDisplay
              prediction={prediction}
              onGenerateReport={handleGenerateReport}
              isGeneratingReport={isGeneratingReport}
            />
          </div>
        </div>

        {/* Report Section */}
        <div>
          <ReportDisplay report={report} error={reportError} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
