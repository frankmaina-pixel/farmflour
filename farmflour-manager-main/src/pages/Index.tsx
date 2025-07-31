import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { PurchaseModule } from '@/components/PurchaseModule';
import { GrindingModule } from '@/components/GrindingModule';
import { SalesModule } from '@/components/SalesModule';
import { TransportModule } from '@/components/TransportModule';
import { DeliveryModule } from '@/components/DeliveryModule';
import { ReportsModule } from '@/components/ReportsModule';
import { SettingsModule } from '@/components/SettingsModule';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Footer } from '@/components/Footer';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentSection, setCurrentSection] = useState('dashboard');

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading your farm data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentSection} />;
      case 'purchases':
        return <PurchaseModule />;
      case 'grinding':
        return <GrindingModule />;
      case 'sales':
        return <SalesModule />;
      case 'transport':
        return <TransportModule />;
      case 'delivery':
        return <DeliveryModule />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <Dashboard onNavigate={setCurrentSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex flex-1 lg:flex-row flex-col">
        {/* Sidebar Navigation - Responsive */}
        <div className="w-full lg:w-64 xl:w-72 2xl:w-80 p-2 sm:p-4 border-b lg:border-r lg:border-b-0 bg-card shrink-0">
          <Navigation 
            currentSection={currentSection} 
            onNavigate={setCurrentSection} 
          />
        </div>
        
        {/* Main Content - Ultra responsive with proper constraints */}
        <div className="flex-1 p-3 sm:p-4 md:p-6 xl:p-8 2xl:p-10 overflow-auto">
          <div className="max-w-full xl:max-w-7xl 2xl:max-w-8xl mx-auto">
            {renderCurrentSection()}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const Index = () => {
  return <AppContent />;
};

export default Index;
