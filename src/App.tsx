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

const queryClient = new QueryClient();

const PrivateRoute = ({ children, allowedTypes }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <Navigate to="/login" replace />;
  if (allowedTypes && !allowedTypes.includes(user.userType)) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const getUsername = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user?.userID || '';
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={() => {}} />} />
          <Route
            path="/doctor"
            element={
              <PrivateRoute allowedTypes={["doctor"]}>
                <Dashboard username={getUsername()} onLogout={() => { localStorage.removeItem('user'); window.location.href = '/login'; }} />
              </PrivateRoute>
            }
          />
          <Route
            path="/registerer"
            element={
              <PrivateRoute allowedTypes={["register"]}>
                <RegistrarForm />
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

export default App;
