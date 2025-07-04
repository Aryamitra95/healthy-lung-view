
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

  
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

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
      <header className="w-full bg-white shadow-sm border-b-4 border-green-500 flex items-center justify-between px-8 py-4 gap-8">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-xl">
            <Stethoscope className="w-8 h-8 text-green-600" />
          </div>
          <span className="text-2xl font-bold text-green-700 tracking-tight">Lung Lens</span>
        </div>
        <Button
          variant="outline"
          className="border-green-500 text-green-700 hover:bg-green-50 hover:border-green-700 font-semibold"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" /> Logout
        </Button>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
      <div className="flex justify-center mt-8">
        <div className="w-full max-w-2xl bg-gradient-to-r from-green-400 to-green-600 border-2 border-white rounded-2xl shadow-lg p-8 flex items-center gap-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white border-4 border-green-200">
            <span className="text-3xl font-bold text-green-600">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">Welcome, Dr. {username}</div>
            <div className="text-white/90 text-lg">Ready to analyze chest X-rays with AI-powered diagnostics</div>
          </div>
        </div>
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
