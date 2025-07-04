import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, Image as ImageIcon } from 'lucide-react';
import { uploadImageToHFSpace, PredictionData, HFSpaceResponse} from '@/services/api';

interface FileUploadProps {
  onPredictionReceived: (prediction:HFSpaceResponse) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onPredictionReceived }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [previewURL, setPreviewURL] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Only image files are allowed.');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File is too large (max 5MB).');
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setPreviewURL(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select an image');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const prediction = await uploadImageToHFSpace(file);
      onPredictionReceived(prediction);
    } catch (err: any) {
      setError(
        err.message.includes('Failed to fetch')
          ? 'Unable to reach the prediction server. Please try again later.'
          : err.message
      );
    } finally {
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
              <div className="bg-gray-100 rounded-lg p-4 mb-3 flex flex-col items-center">
                <img
                  src={previewURL}
                  alt="X-ray Preview"
                  className="w-auto h-40 object-contain mb-2 rounded"
                />
                <p className="text-sm text-gray-600">X-ray Preview</p>
                <p className="text-xs text-gray-500 mt-1">{fileName}</p>
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

      {error && (
        <Card className="border-2 border-red-300 bg-red-50 animate-fade-in">
          <CardContent className="p-4 text-center">
            <p className="text-red-700 font-medium">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
