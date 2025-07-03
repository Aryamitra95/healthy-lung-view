import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Lock, Stethoscope, AlertCircle, Loader2 } from 'lucide-react';

// DynamoDB Integration - Add these imports and interfaces
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// DynamoDB Client Setup
const client = new DynamoDBClient({
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamoClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = import.meta.env.VITE_DYNAMODB_TABLE_NAME;

// Authentication Function
const authenticateUser = async (userID: String, password: String) => {
  try {
    // Debug: log command parameters
    const key = { userID: userID.trim() /*, createdAt: timestamp if needed */ };
    console.log("GetItem Key:", key, "TableName:", TABLE_NAME);

    const getUserCommand = new GetCommand({ TableName: TABLE_NAME, Key: key });
    const result = await dynamoClient.send(getUserCommand);

    // No item found?
    if (!result.Item) {
      return { success: false, message: "Invalid user ID. User does not exist." };
    }

    // Verify password
    const isPasswordValid = password === result.Item.password;
    if (!isPasswordValid) {
      return { success: false, message: "Invalid password. Please check your credentials." };
    }

    // Omit password in response
    const { password: _, ...userWithoutPassword } = result.Item;
    return { success: true, message: "Login successful", user: userWithoutPassword };
  } catch (error: any) {
    console.error("Login error:", error);
    // Distinguish key/schema mismatch vs missing table vs other AWS errors
    if (error.name === "ValidationException") {
      return { success: false, message: "Key schema mismatch. Check your primary key attributes." };
    }
    if (error.name === "ResourceNotFoundException") {
      return { success: false, message: "Table not found. Verify table name and region." };
    }
    return { success: false, message: "An error occurred during login. Please try again." };
  }
};

interface LoginPageProps {
  onLogin: (user: any) => void; // Changed to accept user object instead of username
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Added state for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation
    if (!username.trim() || !password.trim()) {
      setError('Please enter both User ID and Password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Authenticate with DynamoDB
      const result = await authenticateUser(username, password);
      
      if (result.success) {
        onLogin(result.user); // Pass user object instead of username
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error when user types
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (error) setError('');
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) setError('');
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
                      placeholder="User ID"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className="pl-12 h-12 border-2 border-medical-green-light focus:border-medical-green transition-colors"
                      disabled={isLoading}
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
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className="pl-12 h-12 border-2 border-medical-green-light focus:border-medical-green transition-colors"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* Error Alert - Added */}
                {error && (
                  <Alert variant="destructive" className="border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold medical-gradient hover:opacity-90 transition-opacity"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Log In'
                  )}
                </Button>
              </form>

              {/* Added security note */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Secure authentication powered by AWS DynamoDB</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;