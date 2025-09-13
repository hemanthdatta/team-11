import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Users, TrendingUp, MessageSquare, Star, Plus, Bell, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { apiService } from '../services/api';

interface DashboardScreenProps {
  userId: string;
  onNavigate?: (screen: string) => void;
}

export function DashboardScreen({ userId }: DashboardScreenProps) {
  type Customer = { id: number; name: string; contact_info: string };
  const [metrics, setMetrics] = useState({
    total_customers: 0,
    total_referrals: 0,
    completed_referrals: 0,
    engagement_rate: 0
  });
  const [loading, setLoading] = useState(false); // Changed to false by default
  const [error, setError] = useState('');

  // Quick Send Message dialog state
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [quickCustomers, setQuickCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [quickMessage, setQuickMessage] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError, setQuickError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        // Convert userId to number if it's a string
        const userIdNum = typeof userId === 'string' ? parseInt(userId) || 1 : userId;
        const data = await apiService.getDashboardMetrics(userIdNum);
        setMetrics(data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  const openSendMessage = async () => {
    setQuickError('');
    setQuickMessage('');
    setSelectedCustomerId(null);
    setSendDialogOpen(true);
    try {
      const uid = typeof userId === 'string' ? parseInt(userId) || 1 : userId;
      const customers: Customer[] = await apiService.getCustomers(uid as number);
      setQuickCustomers(customers);
      if (customers.length > 0) setSelectedCustomerId(customers[0].id);
    } catch (e) {
      setQuickError('Failed to load customers');
      console.error('Quick customers fetch error:', e);
    }
  };

  const sendQuickMessage = async () => {
    if (!selectedCustomerId || !quickMessage.trim()) {
      setQuickError('Please select a customer and enter a message');
      return;
    }
    try {
      setQuickLoading(true);
      const uid = typeof userId === 'string' ? parseInt(userId) || 1 : userId;
      await apiService.sendMessage({
        customer_id: selectedCustomerId,
        message: quickMessage,
        platform: 'whatsapp',
        user_id: uid,
      });
      setSendDialogOpen(false);
    } catch (e) {
      setQuickError('Failed to send message');
      console.error('Quick send message error:', e);
    } finally {
      setQuickLoading(false);
    }
  };

  const metricCards = [
    { 
      title: 'Active Customers', 
      value: metrics.total_customers.toString(), 
      change: '+0', 
      icon: Users, 
      color: 'text-blue-600' 
    },
    { 
      title: 'Monthly Growth', 
      value: `${metrics.engagement_rate}%`, 
      change: '+0%', 
      icon: TrendingUp, 
      color: 'text-green-600' 
    },
    { 
      title: 'Engagements', 
      value: '0', 
      change: '+0', 
      icon: MessageSquare, 
      color: 'text-purple-600' 
    },
    { 
      title: 'Referrals', 
      value: metrics.total_referrals.toString(), 
      change: '+0', 
      icon: Star, 
      color: 'text-orange-600' 
    }
  ];

  const recentActivities = [
    { action: 'New customer inquiry', time: '5 mins ago', type: 'inquiry' },
    { action: 'Referral reward earned', time: '1 hour ago', type: 'reward' },
    { action: 'Profile view from Mumbai', time: '2 hours ago', type: 'view' },
    { action: 'WhatsApp message sent', time: '3 hours ago', type: 'message' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl">Good morning!</h1>
            <p className="text-muted-foreground">Here's your business overview</p>
          </div>
          <Button size="sm" variant="outline">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {metricCards.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                    <Badge variant="secondary" className="text-xs">
                      {metric.change}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold">{metric.value}</p>
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'inquiry' ? 'bg-blue-500' :
                      activity.type === 'reward' ? 'bg-green-500' :
                      activity.type === 'view' ? 'bg-purple-500' : 'bg-orange-500'
                    }`} />
                    <p className="text-sm">{activity.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Send Message Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Quick Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm">Select Customer</label>
              <Select value={selectedCustomerId ? String(selectedCustomerId) : undefined} onValueChange={(val) => setSelectedCustomerId(parseInt(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer" />
                </SelectTrigger>
                <SelectContent>
                  {quickCustomers.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name} • {c.contact_info}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm">Message</label>
              <Input value={quickMessage} onChange={(e) => setQuickMessage(e.target.value)} placeholder="Type your message" />
            </div>
            {quickError && <p className="text-sm text-red-500">{quickError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialogOpen(false)}>Cancel</Button>
            <Button onClick={sendQuickMessage} disabled={quickLoading}>
              {quickLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}