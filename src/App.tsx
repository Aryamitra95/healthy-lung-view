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

const PrivateRoute = ({ children, userId, allowedTypes }) => {
  // Only check for userId, not full user object
  if (!userId) return <Navigate to="/login" replace />;
  // allowedTypes check will be handled in the page fetch logic
  return <>{children}</>;
};

const App = () => {
  const [userId, setUserId] = useState<string | null>(null);

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
                  <Dashboard userId={userId} onLogout={() => setUserId(null)} />
                </PrivateRoute>
              }
            />
            <Route
              path="/registerer"
              element={
                <PrivateRoute userId={userId} allowedTypes={["register"]}>
                  <RegistrarForm userId={userId} onLogout={() => setUserId(null)} />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
