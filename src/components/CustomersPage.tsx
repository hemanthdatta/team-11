import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Search, Filter, Bot, Phone, MessageSquare, Mail, Loader2, Plus } from 'lucide-react';
import { apiService } from '../services/api';

interface Customer {
  id: number;
  name: string;
  contact_info: string;
  notes?: string;
  last_contacted?: string;
  user_id: number;
}

interface CustomersPageProps {
  userId: string;
  onViewCustomer?: (customerId: number) => void;
}

export function CustomersPage({ userId, onViewCustomer }: CustomersPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false); // Changed to false by default
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    contact_info: '',
    notes: ''
  });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiActive, setAiActive] = useState(false);
  
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const uidNum = typeof userId === 'string' ? (parseInt(userId) || 1) : (userId as unknown as number);
        const data = await apiService.getCustomers(uidNum);
        setCustomers(data);
      } catch (err) {
        setError('Failed to load customers');
        console.error('Customers error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [userId]);

  const handleCall = (customer: Customer) => {
    const info = (customer.contact_info || '').trim();
    
    // Extract phone number from contact_info (which might contain both email and phone)
    const phoneMatch = info.match(/(\+?[\d\s-]{10,})/);
    
    if (phoneMatch && phoneMatch[0]) {
      const phoneNumber = phoneMatch[0].trim();
      window.location.href = `tel:${phoneNumber.replace(/[\s-]/g, '')}`;
    } else if (info.includes('@')) {
      // Create email with subject and body
      const subject = `Following up - ${customer.name}`;
      const body = `Dear ${customer.name},\n\nI hope this email finds you well.\n\nI'm reaching out to follow up on our previous conversation.\n\nBest regards,\n[Your Name]`;
      
      // URL encode subject and body
      const encodedSubject = encodeURIComponent(subject);
      const encodedBody = encodeURIComponent(body);
      
      // Open default email client with pre-filled fields
      window.location.href = `mailto:${info}?subject=${encodedSubject}&body=${encodedBody}`;
    } else {
      navigator.clipboard.writeText(info).catch(() => {});
      alert('Contact copied to clipboard');
    }
  };

  const handleWhatsApp = (customer: Customer) => {
    const info = (customer.contact_info || '').trim();
    
    // Extract phone number from contact_info (which might contain both email and phone)
    const phoneMatch = info.match(/(\+?[\d\s-]{10,})/);
    
    if (phoneMatch && phoneMatch[0]) {
      const phoneNumber = phoneMatch[0].trim();
      
      // Format phone number for WhatsApp (remove spaces, dashes, and ensure it starts with +)
      // Strip all non-numeric characters except the + sign at the beginning
      const formattedNumber = phoneNumber.startsWith('+') 
        ? phoneNumber.replace(/[^\d+]/g, '')
        : `+91${phoneNumber.replace(/[^\d]/g, '')}`;
      
      // Generate a greeting message
      const message = `Hello ${customer.name}! I'm reaching out to discuss how we can help with your needs. Would you have some time to chat?`;
      
      // URL encode the message
      const encodedMessage = encodeURIComponent(message);
      
      // Open WhatsApp with pre-filled message
      window.open(`https://wa.me/${formattedNumber}?text=${encodedMessage}`, '_blank');
    } else {
      alert('Invalid phone number for WhatsApp');
    }
  };
  
  const handleEmail = (customer: Customer) => {
    const info = (customer.contact_info || '').trim();
    
    // Try different patterns to extract email
    // First, try to extract a standard email pattern
    let emailMatch = info.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    
    // If no match, try a simpler pattern that might catch more cases
    if (!emailMatch) {
      emailMatch = info.match(/\S+@\S+\.\S+/i);
    }
    
    if (emailMatch && emailMatch[0]) {
      const email = emailMatch[0].trim();
      
      // Create email with subject and body
      const subject = `Hello from [Your Company] - ${customer.name}`;
      const body = `Dear ${customer.name},\n\nI hope this email finds you well.\n\nI wanted to reach out and introduce myself as your dedicated service provider. I'm here to help with any questions or needs you might have.\n\nWould you be available for a brief call this week to discuss how I can best assist you?\n\nBest regards,\n[Your Name]\n[Your Company]`;
      
      // URL encode subject and body
      const encodedSubject = encodeURIComponent(subject);
      const encodedBody = encodeURIComponent(body);
      
      try {
        // Construct the mailto URL
        const mailtoUrl = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
        
        // Try using window.open with _blank
        const emailWindow = window.open(mailtoUrl, '_blank');
        
        // If window.open failed, try location.href as fallback
        if (!emailWindow) {
          window.location.href = mailtoUrl;
        }
      } catch (error) {
        console.error('Error opening email client:', error);
        // As a last resort, show the email so user can copy it
        alert(`Please email ${email} manually. Your email client could not be opened automatically.`);
      }
    } else {
      alert('No email address available in the customer contact information. Please update the customer record with an email address.');
    }
  };

  const handleSMS = (customer: Customer) => {
    const info = (customer.contact_info || '').trim();
    
    // Extract phone number from contact_info (which might contain both email and phone)
    const phoneMatch = info.match(/(\+?[\d\s-]{10,})/);
    
    if (phoneMatch && phoneMatch[0]) {
      const phoneNumber = phoneMatch[0].trim();
      
      // Format phone number for SMS (remove spaces and dashes)
      const formattedNumber = phoneNumber.replace(/[\s-]/g, '');
      
      // Create SMS message
      const message = encodeURIComponent(`Hi ${customer.name}, this is a follow-up regarding our previous conversation. Please let me know a good time to connect. Thanks!`);
      
      // Open SMS
      window.open(`sms:${formattedNumber}?body=${message}`, '_blank');
    } else {
      alert('Invalid phone number for SMS');
    }
  };

  

  const openDetails = async (customer: Customer) => {
    setActiveCustomer(customer);
    setDetailsOpen(true);
    try {
      const data = await apiService.getCustomerInteractions(customer.id);
      setInteractions(data);
    } catch (e) {
      setInteractions([]);
    }
  };

  const handleActivateAI = async () => {
    try {
      setAiError('');
      setAiLoading(true);
      const uid = typeof userId === 'string' ? (parseInt(userId) || 1) : (userId as unknown as number);
      await apiService.setupAutoResponses(uid, {});
      setAiActive(true);
    } catch (e) {
      console.error('AI activation error:', e);
      setAiError('Failed to activate AI');
    } finally {
      setAiLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact_info.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.contact_info) {
      setError('Name and contact info are required');
      return;
    }
    
    try {
      setLoading(true);
      // Convert userId to number if it's a string
      const userIdNum = typeof userId === 'string' ? parseInt(userId) || 1 : userId;
      const customerData = {
        name: newCustomer.name,
        contact_info: newCustomer.contact_info,
        notes: newCustomer.notes,
        user_id: userIdNum
      };
      
      const result = await apiService.createCustomer(customerData);
      setCustomers([...customers, result]);
      setNewCustomer({ name: '', contact_info: '', notes: '' });
      setShowAddForm(false);
      setError('');
    } catch (err) {
      setError('Failed to create customer');
      console.error('Create customer error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Prospect': return 'bg-blue-100 text-blue-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
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
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl mb-1">Customers</h1>
        <p className="text-muted-foreground text-sm">Track customers, contact them, view their details</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Add Customer Button */}
        <div className="flex justify-end">
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
        
        {/* Add Customer Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <Input
                  id="name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  placeholder="Customer name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="contact" className="text-sm font-medium">Contact Info</label>
                <Input
                  id="contact"
                  value={newCustomer.contact_info}
                  onChange={(e) => setNewCustomer({...newCustomer, contact_info: e.target.value})}
                  placeholder="Email or phone number"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                <Input
                  id="notes"
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                  placeholder="Additional notes"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex space-x-2">
                <Button onClick={handleAddCustomer} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Customer'
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Customer List */}
        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium truncate">{customer.name}</h3>
                      <div className="flex space-x-1">
                        <Badge className={`text-xs ${getStatusColor('Active')}`}>
                          Active
                        </Badge>
                        <Badge className={`text-xs ${getEngagementColor('High')}`}>
                          High
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {customer.contact_info}
                      </p>
                      <p>Customer • Last contact: {customer.last_contacted || 'Never'}</p>
                    </div>
                    
                    <div className="flex space-x-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          if (onViewCustomer) {
                            onViewCustomer(customer.id);
                          } else {
                            openDetails(customer);
                          }
                        }}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleCall(customer)}
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleWhatsApp(customer)}
                      >
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEmail(customer)}
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleSMS(customer)}
                      >
                        <MessageSquare className="h-3 w-3 text-gray-700" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
    </div>

    {/* Details Dialog */}
    <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Interactions • {activeCustomer?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-72 overflow-auto">
          {interactions.length === 0 && (
            <p className="text-sm text-muted-foreground">No interactions yet.</p>
          )}
          {interactions.map((it: any) => (
            <div key={it.id} className="p-2 rounded border bg-gray-50">
              <p className="text-sm">{it.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(it.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
);
}