import React, { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { ProfileSetupScreen } from './components/ProfileSetupScreen';
import { ProfilePage } from './components/ProfilePage';
import { DashboardScreen } from './components/DashboardScreen';
import { CustomersPage } from './components/CustomersPage';
import { CustomerDetailPage } from './components/CustomerDetailPage';
import { ReferralDashboard } from './components/ReferralDashboard';
import { DigitalPresenceBuilder } from './components/DigitalPresenceBuilder';
import { MarketingAssistant } from './components/MarketingAssistant';
import { Navigation } from './components/Navigation';
import { apiService } from './services/api';

type AppState = 'login' | 'profile-setup' | 'app';
type AppScreen = 'dashboard' | 'customers' | 'customer-detail' | 'referrals' | 'builder' | 'analytics' | 'marketing' | 'profile';

export default function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('dashboard');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const handleLogin = async (userId: string) => {
    console.log('Login successful for user:', userId);
    // Use the original user_id string for API calls
    setCurrentUserId(userId);
    setAppState('app');
    setCurrentScreen('dashboard');
  };

  const handleSignup = () => {
    console.log('Navigating to profile setup');
    setAppState('profile-setup');
  };

  const handleProfileComplete = () => {
    console.log('Profile setup complete');
    setAppState('app');
    setCurrentScreen('dashboard');
  };

  const handleNavigate = (screen: string) => {
    console.log('Navigating to screen:', screen);
    setCurrentScreen(screen as AppScreen);
  };

  const handleViewCustomer = (customerId: number) => {
    console.log('Viewing customer:', customerId);
    setSelectedCustomerId(customerId);
    setCurrentScreen('customer-detail');
  };

  console.log('App state:', { appState, currentScreen, currentUserId });

  if (appState === 'login') {
    return <LoginScreen onLogin={handleLogin} onSignup={handleSignup} />;
  }

  if (appState === 'profile-setup') {
    return <ProfileSetupScreen onComplete={handleProfileComplete} />;
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen userId={currentUserId} onNavigate={handleNavigate} />;
      case 'customers':
        return <CustomersPage userId={currentUserId} onViewCustomer={handleViewCustomer} />;
      case 'customer-detail':
        return selectedCustomerId ? (
          <CustomerDetailPage 
            customerId={selectedCustomerId} 
            userId={currentUserId} 
            onBack={() => setCurrentScreen('customers')} 
          />
        ) : (
          <CustomersPage userId={currentUserId} onViewCustomer={handleViewCustomer} />
        );
      case 'referrals':
        return <ReferralDashboard userId={currentUserId} />;
      case 'builder':
        return <DigitalPresenceBuilder />;
      case 'analytics':
        return <DashboardScreen userId={currentUserId} onNavigate={handleNavigate} />; // Using dashboard as placeholder for analytics
      case 'marketing':
        return <MarketingAssistant userId={currentUserId} />;
      case 'profile':
        return <ProfilePage userId={currentUserId} />;
      default:
        return <DashboardScreen userId={currentUserId} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="size-full flex flex-col">
      <div className="flex-1 overflow-auto">
        {renderCurrentScreen()}
      </div>
      <Navigation currentScreen={currentScreen} onNavigate={handleNavigate} />
    </div>
  );
}