
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Stethoscope } from 'lucide-react';
import FileUpload from './FileUpload';
import PredictionDisplay from './PredictionDisplay';
import ReportDisplay from './ReportDisplay';
import axios from 'axios';

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

  const handlePredictionReceived = (predictionData: PredictionData) => {
    setPrediction(predictionData);
    setReport(null); // Reset report when new prediction is received
  };

  const handleGenerateReport = async () => {
    if (!prediction) return;

    try {
      setIsGeneratingReport(true);
      
      // Simulate API call with mock data for demonstration
      // Replace with actual backend endpoint
      setTimeout(() => {
        const mockReport = {
          summary: `Based on the chest X-ray analysis, the AI model has identified a high probability (${prediction.pneumonia}%) of pneumonia. The imaging shows characteristic patterns consistent with inflammatory lung disease affecting the pulmonary parenchyma.

Key findings include:
• Increased opacity in lung fields
• Possible consolidation patterns
• Signs of inflammatory response

This analysis should be correlated with clinical symptoms and physical examination findings for comprehensive patient assessment.`,
          
          cause: `Pneumonia is typically caused by:

Primary Causes:
• Bacterial infections (most common: Streptococcus pneumoniae)
• Viral infections (influenza, respiratory syncytial virus)
• Fungal infections (in immunocompromised patients)
• Aspiration of foreign material

Risk Factors:
• Age (very young or elderly)
• Compromised immune system
• Chronic lung diseases
• Recent respiratory tract infection
• Smoking or alcohol abuse

The radiological patterns observed suggest an infectious etiology, though clinical correlation is essential for definitive diagnosis.`,
          
          suggestedActions: `Immediate Actions:
1. Clinical correlation with patient symptoms (fever, cough, dyspnea)
2. Laboratory investigations (CBC, CRP, procalcitonin)
3. Sputum culture and sensitivity testing
4. Blood cultures if systemically unwell

Treatment Considerations:
• Empirical antibiotic therapy based on local guidelines
• Supportive care (oxygen therapy if hypoxemic)
• Monitor for complications
• Follow-up imaging in 48-72 hours if not improving

Patient Management:
• Assess severity using CURB-65 or PSI scores
• Consider hospitalization criteria
• Ensure adequate hydration and rest
• Patient education regarding medication compliance

Follow-up:
• Clinical reassessment in 48-72 hours
• Repeat chest X-ray if symptoms persist or worsen
• Complete antibiotic course as prescribed
• Pneumonia vaccination discussion post-recovery`
        };
        setReport(mockReport);
        setIsGeneratingReport(false);
      }, 3000);

      // Uncomment and modify this for actual API integration:
      /*
      const response = await axios.post('YOUR_BACKEND_ENDPOINT/generate-report', {
        prediction: prediction,
        image_data: 'base64_image_data_here'
      });
      setReport(response.data);
      */
    } catch (error) {
      console.error('Report generation error:', error);
      alert('Error generating report');
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
          <ReportDisplay report={report} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
