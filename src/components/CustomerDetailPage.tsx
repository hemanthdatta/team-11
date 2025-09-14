import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  Bot, 
  Calendar, 
  TrendingUp, 
  Loader2, 
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
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

interface CustomerInteraction {
  id: number;
  customer_id: number;
  user_id: number;
  interaction_type: string;
  interaction_date: string;
  title: string;
  notes: string;
  follow_up_needed: boolean;
  follow_up_date?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

interface CustomerInsight {
  engagement_level: string;
  recommended_actions: string[];
  best_contact_time: string;
  preferred_communication: string;
  potential_services: string[];
  risk_assessment: string;
  suggested_follow_up_date?: string;
  follow_up_suggestion_reason?: string;
}

interface CustomerDetailPageProps {
  customerId: number;
  userId: string;
  onBack: () => void;
}

export function CustomerDetailPage({ customerId, userId, onBack }: CustomerDetailPageProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [customerInteractions, setCustomerInteractions] = useState<CustomerInteraction[]>([]);
  const [insights, setInsights] = useState<CustomerInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  
  // Interaction dialog state
  const [interactionDialogOpen, setInteractionDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentInteraction, setCurrentInteraction] = useState<CustomerInteraction | null>(null);
  const [interactionForm, setInteractionForm] = useState({
    interaction_type: 'call',
    interaction_date: new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().split(' ')[0].substring(0, 5),
    title: '',
    notes: '',
    follow_up_needed: false,
    follow_up_date: '',
    status: 'completed'
  });
  const [interactionLoading, setInteractionLoading] = useState(false);

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
        
        // Fetch detailed customer interactions
        try {
          const customerInteractionData = await apiService.getCustomerDetailedInteractions(customerId, uidNum);
          setCustomerInteractions(customerInteractionData);
        } catch (err) {
          console.error('Failed to load detailed interactions:', err);
          // Don't fail the whole page if only this request fails
          setCustomerInteractions([]);
        }
        
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
    
    // Extract phone number from contact_info (which might contain both email and phone)
    const phoneMatch = info.match(/(\+?[\d\s-]{10,})/);
    
    if (phoneMatch && phoneMatch[0]) {
      const phoneNumber = phoneMatch[0].trim();
      window.location.href = `tel:${phoneNumber.replace(/[\s-]/g, '')}`;
    } else if (info.includes('@')) {
      const emailMatch = info.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
      if (emailMatch && emailMatch[0]) {
        window.location.href = `mailto:${emailMatch[0].trim()}`;
      }
    } else {
      navigator.clipboard.writeText(info).catch(() => {});
      alert('Contact copied to clipboard');
    }
  };

  const handleWhatsApp = () => {
    if (!customer) return;
    
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

      // Generate a message template
      const message = `Hello ${customer.name}, I'm reaching out regarding your insurance needs. How may I assist you today?`;
      // URL encode the message
      const encodedMessage = encodeURIComponent(message);

      // Open WhatsApp with pre-filled message
      window.open(`https://wa.me/${formattedNumber}?text=${encodedMessage}`, '_blank');
    } else {
      alert('Invalid phone number for WhatsApp');
    }
  };

  const handleEmail = () => {
    if (!customer) return;
    
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
      const subject = `Follow-up regarding your insurance - ${customer.name}`;
      const body = `Dear ${customer.name},\n\nI hope this email finds you well.\n\nI'm reaching out to follow up on our previous conversation about your insurance needs.\n\nPlease let me know if you have any questions or if you'd like to schedule a call to discuss further.\n\nBest regards,\n[Your Name]`;
      
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
  
  const handleSMS = () => {
    if (!customer) return;
    
    const info = (customer.contact_info || '').trim();
    
    // Extract phone number from contact_info (which might contain both email and phone)
    const phoneMatch = info.match(/(\+?[\d\s-]{10,})/);
    
    if (phoneMatch && phoneMatch[0]) {
      const phoneNumber = phoneMatch[0].trim();
      
      // Format phone number for SMS (remove spaces and dashes)
      const formattedNumber = phoneNumber.replace(/[\s-]/g, '');
      
      // Create SMS message
      const message = encodeURIComponent(`Hi ${customer.name}, this is a follow-up on our conversation. Could we schedule a quick call to discuss your needs in more detail? Thanks!`);
      
      // Open SMS client with pre-filled message
      window.open(`sms:${formattedNumber}?body=${message}`, '_blank');
    } else {
      alert('Invalid phone number for SMS');
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

  const resetInteractionForm = () => {
    setInteractionForm({
      interaction_type: 'call',
      interaction_date: new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().split(' ')[0].substring(0, 5),
      title: '',
      notes: '',
      follow_up_needed: false,
      follow_up_date: '',
      status: 'completed'
    });
  };

  const handleAddInteraction = () => {
    setIsEditMode(false);
    setCurrentInteraction(null);
    resetInteractionForm();
    setInteractionDialogOpen(true);
  };

  const handleEditInteraction = (interaction: CustomerInteraction) => {
    setIsEditMode(true);
    setCurrentInteraction(interaction);

    // Format date properly for the input field
    const date = new Date(interaction.interaction_date);
    const formattedDate = date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM

    // Format follow up date if present
    let formattedFollowUpDate = '';
    if (interaction.follow_up_date) {
      const followUpDate = new Date(interaction.follow_up_date);
      formattedFollowUpDate = followUpDate.toISOString().slice(0, 16);
    }
    
    setInteractionForm({
      interaction_type: interaction.interaction_type,
      interaction_date: formattedDate,
      title: interaction.title,
      notes: interaction.notes,
      follow_up_needed: interaction.follow_up_needed,
      follow_up_date: formattedFollowUpDate,
      status: interaction.status
    });
    
    setInteractionDialogOpen(true);
  };

  const handleDeleteInteraction = async (id: number) => {
    if (!confirm('Are you sure you want to delete this interaction?')) return;
    
    try {
      await apiService.deleteCustomerInteraction(id);
      setCustomerInteractions(customerInteractions.filter(i => i.id !== id));
    } catch (err) {
      console.error('Failed to delete interaction:', err);
      alert('Failed to delete interaction. Please try again.');
    }
  };
  
  const handleScheduleFollowUp = (suggestedDate: string) => {
    // Create a new interaction with the AI's suggested follow-up date
    resetInteractionForm();
    
    // Format the date properly for the form
    const date = new Date(suggestedDate);
    const formattedDate = date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
    
    setInteractionForm({
      interaction_type: 'follow_up',
      interaction_date: new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().split(' ')[0].substring(0, 5),
      title: 'Scheduled Follow-up',
      notes: 'Follow-up scheduled based on AI recommendation.',
      follow_up_needed: true,
      follow_up_date: formattedDate,
      status: 'planned'
    });
    
    setIsEditMode(false);
    setCurrentInteraction(null);
    setInteractionDialogOpen(true);
  };

  const handleInteractionSubmit = async () => {
    if (!customer || !userId) {
      alert('Customer or user information is missing. Please reload the page.');
      return;
    }
    
    try {
      setInteractionLoading(true);
      const uidNum = typeof userId === 'string' ? (parseInt(userId) || 1) : (userId as unknown as number);
      
      // Validate form data
      if (!interactionForm.title.trim()) {
        alert('Please enter a title for the interaction');
        return;
      }
      
      if (!interactionForm.notes.trim()) {
        alert('Please enter notes for the interaction');
        return;
      }
      
      // Create interaction data object with required fields
      const interactionData = {
        ...interactionForm,
        customer_id: customer.id,
        user_id: uidNum,
        // Convert date strings to ISO format
        interaction_date: new Date(interactionForm.interaction_date).toISOString(),
        follow_up_date: interactionForm.follow_up_needed && interactionForm.follow_up_date 
          ? new Date(interactionForm.follow_up_date).toISOString() 
          : null
      };
      
      console.log('Submitting interaction data:', interactionData);
      let result;
      
      if (isEditMode && currentInteraction) {
        // Update existing interaction
        console.log('Updating interaction:', currentInteraction.id);
        result = await apiService.updateCustomerInteraction(currentInteraction.id, interactionData);
        console.log('Update result:', result);
        
        // Update the list
        setCustomerInteractions(customerInteractions.map(i => 
          i.id === currentInteraction.id ? result : i
        ));
      } else {
        // Create new interaction
        console.log('Creating new interaction');
        result = await apiService.createCustomerInteraction(interactionData);
        console.log('Creation result:', result);
        setCustomerInteractions([result, ...customerInteractions]);
      }
      
      setInteractionDialogOpen(false);
      resetInteractionForm();
    } catch (err: any) {
      console.error('Failed to save interaction:', err);
      
      // Enhanced error message
      let errorMessage = 'Failed to save interaction. ';
      if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Please check your connection and try again.';
      }
      
      alert(errorMessage);
    } finally {
      setInteractionLoading(false);
    }
  };

  const getInteractionTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'whatsapp': 
      case 'sms': 
      case 'social_media': return <MessageSquare className="h-4 w-4" />;
      case 'video_call': return <Phone className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'follow-up required':
        return <Badge className="bg-blue-100 text-blue-800"><AlertCircle className="h-3 w-3 mr-1" /> Follow-up Required</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleSMS}
              >
                <MessageSquare className="h-4 w-4 mr-1 text-gray-700" />
                SMS
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
                  {insights.suggested_follow_up_date && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Suggested Follow-up</p>
                      <div className="flex items-center justify-between">
                        <p>{insights.suggested_follow_up_date} {insights.follow_up_suggestion_reason && `- ${insights.follow_up_suggestion_reason}`}</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="ml-2"
                          onClick={() => handleScheduleFollowUp(insights.suggested_follow_up_date!)}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium text-sm mb-1">Potential Services</h3>
                  <div className="flex flex-wrap gap-1">
                    {insights.potential_services.map((service, index) => (
                      <Badge key={index} variant="secondary">{service}</Badge>
                    ))}
                  </div>
                </div>
                
                {insights.insights_summary && (
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <h3 className="font-medium text-sm mb-1 text-blue-800">AI Summary</h3>
                    <p className="text-sm text-blue-700">{insights.insights_summary}</p>
                  </div>
                )}
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

        {/* Customer Interactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Customer Interactions
              </span>
              <Button 
                size="sm"
                onClick={handleAddInteraction}
                className="text-xs"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Interaction
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="detailed">
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="detailed" className="flex-1">Detailed Interactions</TabsTrigger>
                <TabsTrigger value="messages" className="flex-1">Messages</TabsTrigger>
              </TabsList>
              
              <TabsContent value="detailed">
                {customerInteractions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No detailed interactions recorded yet</p>
                    <Button onClick={handleAddInteraction} variant="outline">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Your First Interaction
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {customerInteractions.map((interaction) => (
                      <div 
                        key={interaction.id} 
                        className="border rounded-lg p-3 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              {getInteractionTypeIcon(interaction.interaction_type)}
                            </div>
                            <div>
                              <h3 className="font-medium text-sm">{interaction.title}</h3>
                              <p className="text-xs text-muted-foreground">
                                {new Date(interaction.interaction_date).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditInteraction(interaction)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteInteraction(interaction.id)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-sm whitespace-pre-wrap">{interaction.notes}</p>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center">
                            {getStatusBadge(interaction.status)}
                            
                            {interaction.follow_up_needed && interaction.follow_up_date && (
                              <Badge className="ml-2 bg-gray-100 text-gray-800">
                                <Calendar className="h-3 w-3 mr-1" />
                                Follow-up: {new Date(interaction.follow_up_date).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="messages">
                {interactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No message interactions yet</p>
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Interaction Dialog */}
        <Dialog open={interactionDialogOpen} onOpenChange={setInteractionDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Interaction' : 'Add New Interaction'}</DialogTitle>
              <DialogDescription>
                Record details about your interaction with this customer.
              </DialogDescription>
            </DialogHeader>
            
            <form id="interactionForm" onSubmit={(e) => {
              e.preventDefault();
              handleInteractionSubmit();
            }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="interaction_type">Type</Label>
                  <Select
                    value={interactionForm.interaction_type}
                    onValueChange={(value) => setInteractionForm({...interactionForm, interaction_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="video_call">Video Call</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Label htmlFor="interaction_date">Date & Time</Label>
                  <Input 
                    id="interaction_date" 
                    type="datetime-local" 
                    value={interactionForm.interaction_date}
                    onChange={(e) => setInteractionForm({...interactionForm, interaction_date: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={interactionForm.title}
                  placeholder="Brief summary of the interaction"
                  onChange={(e) => setInteractionForm({...interactionForm, title: e.target.value})}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  rows={4}
                  placeholder="Details about what was discussed"
                  value={interactionForm.notes}
                  onChange={(e) => setInteractionForm({...interactionForm, notes: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={interactionForm.status}
                    onValueChange={(value) => setInteractionForm({...interactionForm, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="follow-up required">Follow-up Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox 
                  id="follow_up_needed" 
                  checked={interactionForm.follow_up_needed}
                  onCheckedChange={(checked) => 
                    setInteractionForm({
                      ...interactionForm, 
                      follow_up_needed: checked === true
                    })
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="follow_up_needed">Follow-up needed</Label>
                  <p className="text-sm text-muted-foreground">
                    Set a date for follow-up with this customer
                  </p>
                </div>
              </div>
              
              {interactionForm.follow_up_needed && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="follow_up_date">Follow-up Date & Time</Label>
                  <Input 
                    id="follow_up_date" 
                    type="datetime-local" 
                    value={interactionForm.follow_up_date}
                    onChange={(e) => setInteractionForm({...interactionForm, follow_up_date: e.target.value})}
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setInteractionDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  if (!interactionLoading && interactionForm.title && interactionForm.notes) {
                    handleInteractionSubmit();
                  }
                }}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={interactionLoading || !interactionForm.title || !interactionForm.notes}
              >
                {interactionLoading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                {isEditMode ? 'Update' : 'Save'}
              </Button>
            </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}