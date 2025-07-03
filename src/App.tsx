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
import { useState } from 'react';

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={setUser} />} />
            <Route
              path="/doctor"
              element={user?.role === 'doctor' ? <Dashboard /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/registrar"
              element={user?.role === 'registrar' ? <RegistrarForm /> : <Navigate to="/login" replace />}
            />
            <Route path="/" element={<Index />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
