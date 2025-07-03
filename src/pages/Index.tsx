import React, { useState } from 'react';
import LoginPage from '@/components/LoginPage';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');

  const handleLogin = (user: any) => {
    setCurrentUser(user.userID);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
  };

  if (isLoggedIn) {
    return <Dashboard username={currentUser} onLogout={handleLogout} />;
  }

  return <LoginPage onLogin={handleLogin} />;
};

export default Index;
