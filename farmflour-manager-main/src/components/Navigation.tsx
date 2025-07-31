import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  BarChart3, 
  Settings, 
  LogOut,
  Wheat,
  AlertTriangle,
  Truck
} from 'lucide-react';

interface NavigationProps {
  currentSection: string;
  onNavigate: (section: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentSection, onNavigate }) => {
  const { signOut, profile } = useAuth();
  const { state } = useApp();

  // Check for low stock alerts
  const lowMaizeStock = state.inventory.maizeStockKg < state.settings.lowStockThreshold;
  const lowFlourStock = state.inventory.flourStockKg < state.settings.lowStockThreshold;
  const hasAlerts = lowMaizeStock || lowFlourStock;

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      signOut();
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
    { id: 'grinding', label: 'Grinding', icon: Package },
    { id: 'sales', label: 'Sales', icon: DollarSign },
    { id: 'transport', label: 'Transport', icon: Truck },
    { id: 'delivery', label: 'Delivery', icon: Package },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <Card className="p-2 sm:p-4 space-y-2 h-full">
      {/* Header - Responsive */}
      <div className="flex items-center justify-center mb-4 sm:mb-6">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center">
            <Wheat className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm sm:text-lg lg:text-xl">FarmFlour</span>
        </div>
      </div>

      {/* Stock Status */}
      <div className="mb-4 p-3 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground mb-2">Current Stock</p>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm">Maize</span>
            <span className={`text-sm font-medium ${lowMaizeStock ? 'text-destructive' : ''}`}>
              {state.inventory.maizeStockKg}kg
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Flour</span>
            <span className={`text-sm font-medium ${lowFlourStock ? 'text-destructive' : ''}`}>
              {state.inventory.flourStockKg}kg
            </span>
          </div>
        </div>
        {hasAlerts && (
          <div className="flex items-center mt-2 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Low stock alert
          </div>
        )}
      </div>

      {/* Navigation Items - Responsive buttons */}
      <div className="space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={currentSection === item.id ? 'default' : 'ghost'}
            className="w-full justify-start text-xs sm:text-sm lg:text-base p-2 sm:p-3 h-auto"
            onClick={() => onNavigate(item.id)}
          >
            <item.icon className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 shrink-0" />
            <span className="truncate">{item.label}</span>
            {item.id === 'dashboard' && hasAlerts && (
              <Badge variant="destructive" className="ml-auto text-xs h-4 w-4 p-0 flex items-center justify-center">
                !
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="border-t pt-4 mt-6 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => onNavigate('settings')}
        >
          <Settings className="h-4 w-4 mr-3" />
          Settings
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </Button>
      </div>

      {/* User Info */}
      <div className="text-center pt-4 border-t">
        <p className="text-xs text-muted-foreground">Logged in as</p>
        <p className="text-sm font-medium">{profile?.owner_name || profile?.business_name || 'Farm Owner'}</p>
      </div>
    </Card>
  );
};