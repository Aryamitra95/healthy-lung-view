import React, { useRef } from 'react';
import type { HFSpaceResponse } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import generatePDF from 'react-to-pdf';

interface PredictionDisplayProps {
  prediction: HFSpaceResponse | null;
  onGenerateReport: () => void;
  isGeneratingReport: boolean;
}

// Helper to safely convert to number and clamp between 0 and 100
const safeNumber = (val: any) => {
  const num = Number(val);
  return isNaN(num) ? 0 : Math.max(0, Math.min(100, num));
};

const PredictionDisplay: React.FC<PredictionDisplayProps> = ({
  prediction,
  onGenerateReport,
  isGeneratingReport
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: 'Prediction Report',
  });

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
    { label: 'Healthy', value: safeNumber(prediction.healthy_score), color: 'bg-green-500' },
    { label: 'Tuberculosis', value: safeNumber(prediction.tb_score), color: 'bg-yellow-500' },
    { label: 'Pneumonia', value: safeNumber(prediction.pneumonia_score), color: 'bg-red-500' }
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
        {/* PDF & Print Buttons only when prediction exists */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            onClick={() => generatePDF(contentRef, { filename: 'prediction.pdf' })}
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
              {prediction.word}
            </p>
          </div>

          {prediction.imageUrl && (
            <div className="flex justify-center my-4">
              <img
                src={prediction.imageUrl}
                alt="Uploaded X-ray"
                className="max-h-60 rounded-lg border-2 border-medical-green-light shadow-md"
              />
            </div>
          )}
        </div>
        {/* Generate Report Button */}
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
