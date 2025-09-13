import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Facebook, Instagram, MessageCircle, ArrowRight, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';

interface ProfileSetupScreenProps {
  onComplete: () => void;
}

export function ProfileSetupScreen({ onComplete }: ProfileSetupScreenProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    userId: '',
    password: '',
    confirmPassword: ''
  });

  const [connectedAccounts, setConnectedAccounts] = useState({
    whatsapp: false,
    facebook: false,
    instagram: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleConnection = (platform: keyof typeof connectedAccounts) => {
    setConnectedAccounts(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Signup form submitted');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate required fields
    if (!formData.name || !formData.userId || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting signup with data:', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        user_id: formData.userId,
        password: formData.password
      });
      
      const response = await apiService.signup({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        user_id: formData.userId,
        password: formData.password
      });
      
      console.log('Signup successful, response:', response);
      
      // On successful signup, complete the profile setup
      console.log('Calling onComplete callback');
      onComplete();
      console.log('onComplete callback finished');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed. Please try again.';
      setError(errorMessage);
      console.error('Signup error:', err);
    } finally {
      console.log('Setting loading to false in finally block');
      setLoading(false);
    }
  };

  console.log('ProfileSetupScreen rendering with state:', { loading, error });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Setup Your Profile</CardTitle>
            <CardDescription>
              Create your professional presence easily
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  disabled={loading}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  disabled={loading}
                />
              </div>
              
              <div>
                <Label htmlFor="userId">User ID *</Label>
                <Input
                  id="userId"
                  value={formData.userId}
                  onChange={(e) => handleInputChange('userId', e.target.value)}
                  placeholder="Choose a unique user ID"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a strong password"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
              </div>
              
              {error && <p className="text-sm text-red-500">{error}</p>}
              
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
            
            <div>
              <Label className="text-base mb-3 block">Connect Social Media</Label>
              <div className="space-y-2">
                <Button
                  variant={connectedAccounts.whatsapp ? "default" : "outline"}
                  className="w-full justify-between"
                  onClick={() => toggleConnection('whatsapp')}
                  disabled={loading}
                >
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp Business
                  </div>
                  {connectedAccounts.whatsapp && <span className="text-xs">Connected</span>}
                </Button>
                
                <Button
                  variant={connectedAccounts.facebook ? "default" : "outline"}
                  className="w-full justify-between"
                  onClick={() => toggleConnection('facebook')}
                  disabled={loading}
                >
                  <div className="flex items-center">
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </div>
                  {connectedAccounts.facebook && <span className="text-xs">Connected</span>}
                </Button>
                
                <Button
                  variant={connectedAccounts.instagram ? "default" : "outline"}
                  className="w-full justify-between"
                  onClick={() => toggleConnection('instagram')}
                  disabled={loading}
                >
                  <div className="flex items-center">
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                  </div>
                  {connectedAccounts.instagram && <span className="text-xs">Connected</span>}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}