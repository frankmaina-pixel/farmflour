import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wheat } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const LoginForm: React.FC = () => {
  const { dispatch } = useApp();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple demo authentication - in production, this would connect to a real auth system
    if (credentials.email && credentials.password) {
      dispatch({ type: 'SET_AUTH', payload: true });
      toast({ title: "Welcome!", description: "Successfully logged in to FarmFlour Manager" });
    } else {
      toast({ 
        title: "Error", 
        description: "Please enter both email and password", 
        variant: "destructive" 
      });
    }
  };

  const handleDemoLogin = () => {
    dispatch({ type: 'SET_AUTH', payload: true });
    toast({ title: "Demo Mode", description: "Logged in with demo account" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Wheat className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">FarmFlour Manager</CardTitle>
            <p className="text-muted-foreground">Maize to Flour Business Management</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email or Phone</Label>
              <Input
                id="email"
                type="text"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email or phone"
                autoComplete="username"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
            
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleDemoLogin}
          >
            Try Demo Account
          </Button>

          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              For demo purposes, you can use any email/password combination
            </p>
            <p className="text-xs text-muted-foreground">
              or click "Try Demo Account" for instant access
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};