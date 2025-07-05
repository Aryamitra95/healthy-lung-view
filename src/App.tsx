import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from '@/components/LoginPage';
import Dashboard from '@/components/Dashboard';
import RegistrarForm from '@/pages/RegistrarForm';
import PatientForm from '@/pages/PatientForm';
import { useState } from 'react';

const queryClient = new QueryClient();

const PrivateRoute = ({ children, userId, allowedTypes }) => {
  if (!userId) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PatientFormModal = ({ isOpen, onClose, ...props }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <PatientForm {...props} onCancel={onClose} />
      </div>
    </div>
  );
};

const App = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [showPatientForm, setShowPatientForm] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={setUserId} />} />
            <Route
              path="/doctor"
              element={
                <PrivateRoute userId={userId} allowedTypes={["doctor"]}>
                  <Dashboard
                    username={userId || ''}
                    onLogout={() => setUserId(null)}
                    onAddPatient={() => setShowPatientForm(true)}
                  />
                </PrivateRoute>
              }
            />
            <Route
              path="/registerer"
              element={
                <PrivateRoute userId={userId} allowedTypes={["register"]}>
                  <RegistrarForm
                    userId={userId}
                    onLogout={() => setUserId(null)}
                    onAddPatient={() => setShowPatientForm(true)}
                  />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <PatientFormModal
            isOpen={showPatientForm}
            onClose={() => setShowPatientForm(false)}
            onSuccess={() => setShowPatientForm(false)}
          />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
