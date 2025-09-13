import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Facebook, Instagram, MessageCircle, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';

interface LoginScreenProps {
  onLogin: (userId: string) => void;
  onSignup: () => void;
}

export function LoginScreen({ onLogin, onSignup }: LoginScreenProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiService.login({ user_id: userId, password });
      // Store the token in localStorage or context
      localStorage.setItem('authToken', response.access_token);
      onLogin(userId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">GrowthPro</CardTitle>
          <CardDescription>
            Empower your micro-business growth across India
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user_id">User ID</Label>
              <Input
                id="user_id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your user ID"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" size="sm" className="flex-col h-16" disabled={isLoading}>
              <MessageCircle className="h-5 w-5 mb-1" />
              <span className="text-xs">WhatsApp</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-col h-16" disabled={isLoading}>
              <Facebook className="h-5 w-5 mb-1" />
              <span className="text-xs">Facebook</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-col h-16" disabled={isLoading}>
              <Instagram className="h-5 w-5 mb-1" />
              <span className="text-xs">Instagram</span>
            </Button>
          </div>
          
          <div className="text-center">
            <Button variant="link" onClick={onSignup} className="text-sm" disabled={isLoading}>
              Don't have an account? Sign up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}