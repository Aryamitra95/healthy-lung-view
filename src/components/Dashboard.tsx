import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Stethoscope } from 'lucide-react';
import FileUpload from './FileUpload';
import PredictionDisplay from './PredictionDisplay';
import ReportDisplay from './ReportDisplay';
import { generateMedicalReport } from '@/services/medicalReportService';
import { docClient } from '@/services/dynamodb';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { useNavigate } from 'react-router-dom';
import FloatingSearchBar from './FloatingSearchBar';
import PatientDetailsModal from './PatientDetailsModal';
import { Dialog } from '@headlessui/react';
import RegistrarForm from '../pages/RegistrarForm';
import PatientForm from '../pages/PatientForm';
import type { HFSpaceResponse } from '@/services/api';

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

interface ReportData {
  summary: string;
  cause: string;
  suggestedActions: string;
}

interface Patient {
  patientId: string;
  name: string;
  age: number;
  sex?: string;
  symptoms?: string[];
  email?: string;
  phone?: string;
  address?: string;
  images?: string[];
  dateOfBirth?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
  createdAt?: string;
  updatedAt?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ username, onLogout }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState<HFSpaceResponse | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    const fetchName = async () => {
      setLoading(true);
      setError('');
      const trimmedUserId = username.trim();
      console.log('Fetching user profile:', { userID: trimmedUserId, table: import.meta.env.VITE_DYNAMODB_TABLE_NAME });
      try {
        const result = await docClient.send(new GetCommand({ TableName: import.meta.env.VITE_DYNAMODB_TABLE_NAME, Key: { userID: trimmedUserId } }));
        if (!result.Item || !result.Item.userName) {
          setError('User not found.');
          setTimeout(() => navigate('/login', { replace: true }), 1500);
          return;
        }
        setName(result.Item.userName);
      } catch (err) {
        setError('Failed to fetch user profile.');
        setTimeout(() => navigate('/login', { replace: true }), 1500);
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchName();
  }, [username, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handlePredictionReceived = (predictionData: HFSpaceResponse) => {
    setPrediction(predictionData);
    setReport(null); // Reset report when new prediction is received
    setReportError(null); // Reset error when new prediction is received
  };

  const handleGenerateReport = async () => {
    if (!prediction) return;

    try {
      setIsGeneratingReport(true);
      setReportError(null); // Clear any previous errors
      
      const generatedReport = await generateMedicalReport({
        healthy: Number(prediction.healthy_score) || 0,
        tuberculosis: Number(prediction.tb_score) || 0,
        pneumonia: Number(prediction.pneumonia_score) || 0,
        prediction: prediction.word || "",
      });
      
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

  const handlePatientSelect = async (patientId: string) => {
    setSearchError('');
    try {
      const res = await fetch(`/api/patient/${encodeURIComponent(patientId)}`);
      if (!res.ok) throw new Error('Failed to fetch patient details');
      const fullData = await res.json();
      setSelectedPatient(fullData);
      setPatientModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch patient details:', err);
      setSearchError('Failed to fetch patient details.');
    }
  };

  const handlePatientUpdated = (updatedPatient: Patient) => {
    setSelectedPatient(updatedPatient);
    console.log('Patient updated:', updatedPatient);
  };

  return (
    <div className="min-h-screen medical-bg">
      
      
      {/* Patient Details Modal */}
      <PatientDetailsModal
        isOpen={patientModalOpen}
        onClose={() => setPatientModalOpen(false)}
        patient={selectedPatient}
        onPatientUpdated={handlePatientUpdated}
      />

      {/* Create New Patient Modal */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
          <div className="relative bg-white rounded-xl shadow-xl p-8 w-full max-w-3xl z-10">
            <Dialog.Title className="text-2xl font-bold mb-4">Create New Patient</Dialog.Title>
            <PatientForm onCancel={() => setCreateModalOpen(false)} />
          </div>
        </div>
      </Dialog>

      {/* Header */}
      <header className="w-full bg-white shadow-sm border-b-4 border-green-500 flex items-center justify-between px-8 py-4 gap-8">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-xl">
            <Stethoscope className="w-8 h-8 text-green-600" />
          </div>
          <span className="text-2xl font-bold text-green-700 tracking-tight">Lung Lens</span>
        </div>
        <div className="flex justify-center gap-3">
          <FloatingSearchBar onPatientSelect={handlePatientSelect} />
        </div>
        <div className="flex gap-4">
          <Button
            className="bg-green-600 text-white font-semibold px-6 py-2 rounded shadow hover:bg-green-700"
            onClick={() => setCreateModalOpen(true)}
          >
            + Create New Patient
          </Button>
          <Button
            variant="outline"
            className="border-green-500 text-green-700 hover:bg-green-50 hover:border-green-700 font-semibold"
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5 mr-2" /> Logout
          </Button>
        </div>
      </header>
      {searchError && <div className="text-red-600 text-center mt-2">{searchError}</div>}
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="flex justify-center my-8">
          <div className="w-full max-w-2xl bg-gradient-to-r from-green-400 to-green-600 border-2 border-white rounded-2xl shadow-lg p-8 flex items-center gap-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white border-4 border-green-200">
              <span className="text-3xl font-bold text-green-600">
                {loading ? '...' : name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">
                {loading ? 'Loading...' : `Welcome, Dr. ${name}`}
              </div>
              <div className="text-white/90 text-lg">
                {loading ? 'Fetching your profile...' : 'Ready to analyze chest X-rays with AI-powered diagnostics'}
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
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

        {/* Display uploaded image if available
        {prediction?.imageUrl && (
          <div className="flex justify-center my-4">
            <img
              src={prediction.imageUrl}
              alt="Uploaded X-ray"
              className="max-h-80 rounded-lg border-2 border-medical-green-light shadow-md"
            />
          </div>
        )} */}

        {/* Report Section */}
        <div>
          <ReportDisplay report={report} error={reportError} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
