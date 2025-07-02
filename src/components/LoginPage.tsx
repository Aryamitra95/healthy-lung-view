
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { User, Lock, Stethoscope } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-bg to-white flex">
      {/* Left Side - Illustration and Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-medical-green to-medical-green-dark p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <Stethoscope className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to,
          </h1>
          <h2 className="text-6xl font-bold text-white mb-6">
            Lung Lens
          </h2>
          <p className="text-xl text-white/90 mb-4">
            AI Meets Healthcare: Diagnose with Confidence
          </p>
          <p className="text-lg text-white/80">
            Powered by GenAI
          </p>
          
          {/* Decorative Medical Elements */}
          <div className="mt-12 flex justify-center space-x-8 opacity-30">
            <div className="w-12 h-12 bg-white/20 rounded-lg"></div>
            <div className="w-12 h-12 bg-white/20 rounded-lg"></div>
            <div className="w-12 h-12 bg-white/20 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-medical-green p-3 rounded-xl">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-medical-green">Lung Lens</h1>
          </div>

          <Card className="border-2 border-medical-green-light shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-medical-green mb-2">Log In</h2>
                <p className="text-gray-600">AI Meets Healthcare: Diagnose with Confidence</p>
                <p className="text-sm text-gray-500 mt-1">Powered by GenAI</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-12 h-12 border-2 border-medical-green-light focus:border-medical-green transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-12 border-2 border-medical-green-light focus:border-medical-green transition-colors"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold medical-gradient hover:opacity-90 transition-opacity"
                >
                  Log In
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
