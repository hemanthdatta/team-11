import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Phone, MessageSquare, Mail, Bot, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';

interface Customer {
  id: number;
  name: string;
  contact_info: string;
  notes?: string;
  last_contacted?: string;
  user_id: number;
}

interface Interaction {
  id: number;
  message: string;
  timestamp: string;
  sent_by: string;
}

interface CustomerInsight {
  engagement_level: string;
  recommended_actions: string[];
  best_contact_time: string;
  preferred_communication: string;
  potential_services: string[];
  risk_assessment: string;
}

interface CustomerDetailPageProps {
  customerId: number;
  userId: string;
  onBack: () => void;
}

export function CustomerDetailPage({ customerId, userId, onBack }: CustomerDetailPageProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [insights, setInsights] = useState<CustomerInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!customerId || !userId) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch customer details
        const uidNum = typeof userId === 'string' ? (parseInt(userId) || 1) : (userId as unknown as number);
        const customerData = await apiService.getCustomer(customerId);
        setCustomer(customerData);
        
        // Fetch interactions
        const interactionData = await apiService.getCustomerInteractions(customerId);
        setInteractions(interactionData);
        
      } catch (err) {
        setError('Failed to load customer data');
        console.error('Customer detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId, userId]);

  const handleCall = () => {
    if (!customer) return;
    
    const info = (customer.contact_info || '').trim();
    if (/^[\+]?[0-9][\d\s-]*$/.test(info)) {
      window.location.href = `tel:${info.replace(/[\s-]/g, '')}`;
    } else if (info.includes('@')) {
      window.location.href = `mailto:${info}`;
    } else {
      navigator.clipboard.writeText(info).catch(() => {});
      alert('Contact copied to clipboard');
    }
  };

  const handleWhatsApp = () => {
    if (!customer) return;
    
    const info = (customer.contact_info || '').trim();
    if (/^[\+]?[0-9][\d\s-]*$/.test(info)) {
      // Format phone number for WhatsApp (remove spaces, dashes, and ensure it starts with +)
      const formattedNumber = info.startsWith('+') ? info.replace(/[\s-]/g, '') : `+91${info.replace(/[\s-]/g, '')}`;
      window.open(`https://wa.me/${formattedNumber}`, '_blank');
    } else {
      alert('Invalid phone number for WhatsApp');
    }
  };

  const handleEmail = () => {
    if (!customer) return;
    
    const info = (customer.contact_info || '').trim();
    if (info.includes('@')) {
      window.location.href = `mailto:${info}`;
    } else {
      alert('No email address available');
    }
  };

  const fetchAIInsights = async () => {
    if (!customer || !userId) return;
    
    try {
      setAiLoading(true);
      setAiError('');
      
      const uidNum = typeof userId === 'string' ? (parseInt(userId) || 1) : (userId as unknown as number);
      const insightData = await apiService.getCustomerInsights(customerId, uidNum);
      setInsights(insightData.insights);
    } catch (err) {
      setAiError('Failed to load AI insights');
      console.error('AI insights error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getEngagementColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="text-xl font-semibold">Customer Details</h1>
          <div></div> {/* Spacer for alignment */}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Customer Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {customer?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-semibold text-lg truncate">{customer?.name}</h2>
                  <Badge className={getEngagementColor(insights?.engagement_level || 'Medium')}>
                    {insights?.engagement_level || 'Medium'} Engagement
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {customer?.contact_info || 'No contact info'}
                  </p>
                  <p className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Last contacted: {formatDate(customer?.last_contacted)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Contact Buttons */}
            <div className="flex space-x-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleCall}
              >
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleWhatsApp}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                WhatsApp
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleEmail}
              >
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                AI Insights
              </span>
              <Button 
                size="sm" 
                onClick={fetchAIInsights}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiError && <p className="text-sm text-red-500 mb-2">{aiError}</p>}
            
            {insights ? (
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-sm mb-1">Recommended Actions</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {insights.recommended_actions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Best Contact Time</p>
                    <p>{insights.best_contact_time}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Preferred Channel</p>
                    <p>{insights.preferred_communication}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Risk Assessment</p>
                    <p>{insights.risk_assessment}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm mb-1">Potential Services</h3>
                  <div className="flex flex-wrap gap-1">
                    {insights.potential_services.map((service, index) => (
                      <Badge key={index} variant="secondary">{service}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Bot className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm mb-2">Get AI-powered insights about this customer</p>
                <Button size="sm" onClick={fetchAIInsights} disabled={aiLoading}>
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Bot className="h-4 w-4 mr-1" />
                  )}
                  Generate Insights
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Interaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {interactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No interactions yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {interactions.map((interaction) => (
                  <div key={interaction.id} className="border-l-2 border-blue-200 pl-3 py-1">
                    <p className="text-sm">{interaction.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(interaction.timestamp)} • {interaction.sent_by}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}