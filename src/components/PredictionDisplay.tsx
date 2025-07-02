
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText } from 'lucide-react';

interface PredictionData {
  healthy: number;
  tuberculosis: number;
  pneumonia: number;
  prediction: string;
}

interface PredictionDisplayProps {
  prediction: PredictionData | null;
  onGenerateReport: () => void;
  isGeneratingReport: boolean;
}

const PredictionDisplay: React.FC<PredictionDisplayProps> = ({
  prediction,
  onGenerateReport,
  isGeneratingReport
}) => {
  if (!prediction) {
    return (
      <Card className="border-2 border-medical-green-light">
        <CardHeader>
          <CardTitle className="text-medical-green">Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Upload an X-ray image to see AI predictions
          </p>
        </CardContent>
      </Card>
    );
  }

  const predictions = [
    { label: 'Healthy', value: prediction.healthy, color: 'bg-green-500' },
    { label: 'Tuberculosis', value: prediction.tuberculosis, color: 'bg-yellow-500' },
    { label: 'Pneumonia', value: prediction.pneumonia, color: 'bg-red-500' }
  ];

  const maxPrediction = predictions.reduce((max, curr) => 
    curr.value > max.value ? curr : max
  );

  return (
    <Card className="border-2 border-medical-green-light animate-fade-in">
      <CardHeader>
        <CardTitle className="text-medical-green">Prediction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {predictions.map((pred) => (
          <div key={pred.label} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{pred.label}:</span>
              <span className="text-sm font-semibold">{pred.value}%</span>
            </div>
            <Progress 
              value={pred.value} 
              className="h-2"
            />
          </div>
        ))}

        <div className="mt-6 p-4 medical-gradient rounded-lg">
          <p className="text-white text-sm font-medium mb-2">
            Probable Disease According to AI Diagnosis:
          </p>
          <p className="text-white text-2xl font-bold">
            {prediction.prediction}
          </p>
        </div>

        <Button
          onClick={onGenerateReport}
          disabled={isGeneratingReport}
          className="w-full medical-gradient hover:opacity-90 transition-opacity"
          size="lg"
        >
          {isGeneratingReport ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Generating Report...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PredictionDisplay;
