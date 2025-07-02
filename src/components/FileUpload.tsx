
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

interface FileUploadProps {
  onPredictionReceived: (prediction: any) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onPredictionReceived }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [previewURL, setPreviewURL] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setPreviewURL(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsProcessing(true);
      
      // Simulate API call with mock data for demonstration
      // Replace with actual backend endpoint
      setTimeout(() => {
        const mockPrediction = {
          healthy: 5,
          tuberculosis: 20,
          pneumonia: 75,
          prediction: 'Pneumonia'
        };
        onPredictionReceived(mockPrediction);
        setIsProcessing(false);
      }, 2000);

      // Uncomment and modify this for actual API integration:
      /*
      const response = await axios.post('YOUR_BACKEND_ENDPOINT/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onPredictionReceived(response.data);
      */
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*,.pdf"
            onChange={handleChange}
          />
          <label htmlFor="file-upload">
            <Button
              type="button"
              variant="outline"
              className="w-full border-2 border-medical-green-light hover:bg-medical-green-light transition-colors"
              asChild
            >
              <span className="cursor-pointer">
                <File className="w-4 h-4 mr-2" />
                Choose File
              </span>
            </Button>
          </label>
        </div>
        
        <Button
          onClick={handleUpload}
          disabled={!file || isProcessing}
          className="medical-gradient hover:opacity-90 transition-opacity"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </>
          )}
        </Button>
      </div>

      {fileName && (
        <Card className="border-2 border-medical-green-light animate-slide-in">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <File className="w-8 h-8 text-medical-green" />
              <div>
                <p className="font-medium text-sm">{fileName}</p>
                <p className="text-xs text-gray-500">Ready to upload</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {previewURL && (
        <Card className="border-2 border-medical-green-light animate-fade-in">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-4 mb-3">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">X-ray Preview</p>
                <p className="text-xs text-gray-500 mt-1">
                  {fileName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <Card className="border-2 border-medical-green-light bg-medical-bg animate-fade-in">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-medical-green border-t-transparent mx-auto mb-4"></div>
            <p className="text-medical-green font-medium">Analyzing X-ray image...</p>
            <p className="text-sm text-gray-600 mt-1">Please wait while our AI processes your image</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
