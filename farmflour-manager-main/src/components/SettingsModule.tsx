import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const SettingsModule: React.FC = () => {
  const { state, dispatch } = useApp();
  const [settings, setSettings] = useState(state.settings);

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    toast({ title: "Success", description: "Settings saved successfully" });
  };

  const handleReset = () => {
    const defaultSettings = {
      lowStockThreshold: 50,
      defaultFlourPrice: 100,
      businessName: 'FarmFlour Mill',
      ownerName: 'Farm Owner',
      notifications: true
    };
    setSettings(defaultSettings);
    dispatch({ type: 'UPDATE_SETTINGS', payload: defaultSettings });
    toast({ title: "Reset", description: "Settings reset to defaults" });
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('farmflour-data');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center">
          <Settings className="h-6 w-6 mr-2" />
          Settings
        </h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={settings.businessName}
              onChange={(e) => setSettings(prev => ({ ...prev, businessName: e.target.value }))}
              placeholder="Enter business name"
            />
          </div>
          
          <div>
            <Label htmlFor="ownerName">Owner Name</Label>
            <Input
              id="ownerName"
              value={settings.ownerName}
              onChange={(e) => setSettings(prev => ({ ...prev, ownerName: e.target.value }))}
              placeholder="Enter owner name"
            />
          </div>
        </CardContent>
      </Card>

      {/* Operational Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Operational Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="threshold">Low Stock Threshold (kg)</Label>
            <Input
              id="threshold"
              type="number"
              value={settings.lowStockThreshold}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                lowStockThreshold: parseInt(e.target.value) || 0 
              }))}
              placeholder="50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Alert when stock falls below this amount
            </p>
          </div>
          
          <div>
            <Label htmlFor="flourPrice">Default Flour Price (KES per kg)</Label>
            <Input
              id="flourPrice"
              type="number"
              step="0.01"
              value={settings.defaultFlourPrice}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                defaultFlourPrice: parseFloat(e.target.value) || 0 
              }))}
              placeholder="100"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Default price used in sales forms
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Enable Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive alerts for low stock and important events
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => setSettings(prev => ({ 
                ...prev, 
                notifications: checked 
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Inventory Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Maize Stock</p>
              <p className="text-2xl font-bold">{state.inventory.maizeStockKg}kg</p>
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(state.inventory.lastUpdated).toLocaleDateString()}
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Flour Stock</p>
              <p className="text-2xl font-bold">{state.inventory.flourStockKg}kg</p>
              <p className="text-xs text-muted-foreground">
                Status: {state.inventory.flourStockKg < settings.lowStockThreshold ? 'Low Stock' : 'Normal'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Application Data</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Suppliers: {state.suppliers.length}</p>
              <p>• Purchases: {state.purchases.length}</p>
              <p>• Grinding Records: {state.grindings.length}</p>
              <p>• Customers: {state.customers.length}</p>
              <p>• Sales: {state.sales.length}</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <Button 
              variant="destructive" 
              onClick={handleClearData}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This will permanently delete all your data. This action cannot be undone.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card>
        <CardHeader>
          <CardTitle>App Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform:</span>
              <span>Web Application</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Storage:</span>
              <span>Local Browser Storage</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};