// src/services/api.ts
const API_BASE_URL = 'http://localhost:8000';

interface LoginData {
  user_id: string;
  password: string;
}

interface SignupData {
  name: string;
  email?: string;
  phone?: string;
  user_id: string;
  password: string;
  business_name?: string;
  business_type?: string;
  location?: string;
  bio?: string;
  website?: string;
}

interface CustomerData {
  name: string;
  contact_info: string;
  notes?: string;
  user_id: number;
}

class ApiService {
  // Auth endpoints
  async login(data: LoginData) {
    console.log('API: Sending login request', data);
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    console.log('API: Login response status', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Login failed with error:', errorText);
      throw new Error(`Login failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Login successful, response:', result);
    return result;
  }

  async getCustomerInteractions(customer_id: number) {
    console.log('API: Fetching interactions for customer', customer_id);
    const response = await fetch(`${API_BASE_URL}/customers/${customer_id}/interactions`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Interactions fetch failed with error:', errorText);
      throw new Error(`Failed to fetch interactions: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const result = await response.json();
    console.log('API: Interactions fetch successful, response:', result);
    return result;
  }
  
  async getCustomerDetailedInteractions(customer_id: number, user_id: number) {
    console.log('API: Fetching detailed interactions for customer', customer_id);
    const response = await fetch(`${API_BASE_URL}/interactions/?customer_id=${customer_id}&user_id=${user_id}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Detailed interactions fetch failed with error:', errorText);
      throw new Error(`Failed to fetch detailed interactions: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const result = await response.json();
    console.log('API: Detailed interactions fetch successful, response:', result);
    return result;
  }
  
  async createCustomerInteraction(data: any) {
    console.log('API: Creating customer interaction', data);
    const response = await fetch(`${API_BASE_URL}/interactions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Interaction creation failed with error:', errorText);
      throw new Error(`Failed to create interaction: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Interaction creation successful, response:', result);
    return result;
  }
  
  async updateCustomerInteraction(interaction_id: number, data: any) {
    console.log('API: Updating customer interaction', interaction_id, data);
    const response = await fetch(`${API_BASE_URL}/interactions/${interaction_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Interaction update failed with error:', errorText);
      throw new Error(`Failed to update interaction: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Interaction update successful, response:', result);
    return result;
  }
  
  async deleteCustomerInteraction(interaction_id: number) {
    console.log('API: Deleting customer interaction', interaction_id);
    const response = await fetch(`${API_BASE_URL}/interactions/${interaction_id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Interaction deletion failed with error:', errorText);
      throw new Error(`Failed to delete interaction: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Interaction deletion successful, response:', result);
    return result;
  }
  
  async getUpcomingFollowups(user_id: number, days: number = 7) {
    console.log('API: Fetching upcoming followups for user', user_id);
    const response = await fetch(`${API_BASE_URL}/interactions/upcoming-followups?user_id=${user_id}&days=${days}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Followups fetch failed with error:', errorText);
      throw new Error(`Failed to fetch followups: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Followups fetch successful, response:', result);
    return result;
  }

  async getCustomer(customer_id: number) {
    console.log('API: Fetching customer', customer_id);
    const response = await fetch(`${API_BASE_URL}/customers/${customer_id}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Customer fetch failed with error:', errorText);
      throw new Error(`Failed to fetch customer: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const result = await response.json();
    console.log('API: Customer fetch successful, response:', result);
    return result;
  }

  async contactCustomer(customer_id: number, data: any) {
    console.log('API: Recording contact for customer', customer_id, data);
    const response = await fetch(`${API_BASE_URL}/customers/${customer_id}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Contact customer failed with error:', errorText);
      throw new Error(`Failed to contact customer: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const result = await response.json();
    console.log('API: Contact recorded successfully, response:', result);
    return result;
  }

  async getReferralLink(user_id: number) {
    console.log('API: Fetching referral link for user', user_id);
    const response = await fetch(`${API_BASE_URL}/referrals/link/${user_id}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Referral link fetch failed with error:', errorText);
      throw new Error(`Failed to fetch referral link: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const result = await response.json();
    console.log('API: Referral link fetch successful, response:', result);
    return result;
  }

  async signup(data: SignupData) {
    console.log('API: Sending signup request', data);
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    console.log('API: Signup response status', response.status);
    console.log('API: Signup response headers', response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Signup failed with error:', errorText);
      throw new Error(`Signup failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Signup successful, response:', result);
    return result;
  }

  async getProfile(user_id: string) {
    console.log('API: Fetching profile for user', user_id);
    const response = await fetch(`${API_BASE_URL}/auth/profile?current_user_id=${user_id}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Profile fetch failed with error:', errorText);
      throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Profile fetch successful, response:', result);
    return result;
  }

  async updateProfile(user_id: string, profileData: any) {
    console.log('API: Updating profile for user', user_id, 'with data', profileData);
    const response = await fetch(`${API_BASE_URL}/auth/profile?current_user_id=${user_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Profile update failed with error:', errorText);
      throw new Error(`Failed to update profile: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Profile update successful, response:', result);
    return result;
  }

  async uploadProfileImage(user_id: string, formData: FormData) {
    console.log('API: Uploading profile image for user', user_id);
    const response = await fetch(`${API_BASE_URL}/auth/profile/upload-image?current_user_id=${user_id}`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Image upload failed with error:', errorText);
      throw new Error(`Failed to upload image: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Image upload successful, response:', result);
    return result;
  }

  async getBusinessTypes() {
    console.log('API: Fetching business types');
    const response = await fetch(`${API_BASE_URL}/auth/business-types`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Business types fetch failed with error:', errorText);
      throw new Error(`Failed to fetch business types: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Business types fetch successful, response:', result);
    return result;
  }

  // Customer endpoints
  async createCustomer(data: CustomerData) {
    console.log('API: Creating customer', data);
    const response = await fetch(`${API_BASE_URL}/customers/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Customer creation failed with error:', errorText);
      throw new Error(`Failed to create customer: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Customer creation successful, response:', result);
    return result;
  }

  async getCustomers(user_id: number) {
    console.log('API: Fetching customers for user', user_id);
    const response = await fetch(`${API_BASE_URL}/customers/?user_id=${user_id}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Customers fetch failed with error:', errorText);
      throw new Error(`Failed to fetch customers: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Customers fetch successful, response:', result);
    return result;
  }

  async searchCustomers(user_id: number, query: string) {
    console.log('API: Searching customers for user', user_id, 'with query', query);
    const response = await fetch(`${API_BASE_URL}/customers/search?user_id=${user_id}&query=${query}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Customer search failed with error:', errorText);
      throw new Error(`Failed to search customers: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Customer search successful, response:', result);
    return result;
  }

  // Referral endpoints
  async getReferrals(user_id: number) {
    console.log('API: Fetching referrals for user', user_id);
    const response = await fetch(`${API_BASE_URL}/referrals/?user_id=${user_id}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Referrals fetch failed with error:', errorText);
      throw new Error(`Failed to fetch referrals: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Referrals fetch successful, response:', result);
    return result;
  }

  async getReferralStats(user_id: number) {
    console.log('API: Fetching referral stats for user', user_id);
    const response = await fetch(`${API_BASE_URL}/referrals/stats?user_id=${user_id}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Referral stats fetch failed with error:', errorText);
      throw new Error(`Failed to fetch referral stats: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Referral stats fetch successful, response:', result);
    return result;
  }

  async getRewards(user_id: number) {
    console.log('API: Fetching rewards for user', user_id);
    const response = await fetch(`${API_BASE_URL}/referrals/rewards?user_id=${user_id}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Rewards fetch failed with error:', errorText);
      throw new Error(`Failed to fetch rewards: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Rewards fetch successful, response:', result);
    return result;
  }

  // Dashboard endpoints
  async getDashboardMetrics(user_id: number) {
    console.log('API: Fetching dashboard metrics for user', user_id);
    const response = await fetch(`${API_BASE_URL}/dashboard?user_id=${user_id}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Dashboard metrics fetch failed with error:', errorText);
      throw new Error(`Failed to fetch dashboard metrics: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Dashboard metrics fetch successful, response:', result);
    return result;
  }

  async getReports(user_id: number) {
    console.log('API: Fetching reports for user', user_id);
    const response = await fetch(`${API_BASE_URL}/dashboard/reports?user_id=${user_id}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Reports fetch failed with error:', errorText);
      throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Reports fetch successful, response:', result);
    return result;
  }

  // Messaging endpoints
  async sendMessage(messageData: any) {
    console.log('API: Sending message', messageData);
    const response = await fetch(`${API_BASE_URL}/messaging/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Send message failed with error:', errorText);
      throw new Error(`Failed to send message: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Message sent successfully, response:', result);
    return result;
  }

  async getMessageTemplates() {
    console.log('API: Fetching message templates');
    const response = await fetch(`${API_BASE_URL}/messaging/message-templates`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Message templates fetch failed with error:', errorText);
      throw new Error(`Failed to fetch message templates: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Message templates fetch successful, response:', result);
    return result;
  }

  async getConversation(customer_id: number, user_id: number) {
    console.log('API: Fetching conversation for customer', customer_id);
    const response = await fetch(`${API_BASE_URL}/messaging/conversations/${customer_id}?user_id=${user_id}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Conversation fetch failed with error:', errorText);
      throw new Error(`Failed to fetch conversation: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Conversation fetch successful, response:', result);
    return result;
  }

  // AI Assistant endpoints
  async getAIAssist(prompt: string, context?: any) {
    console.log('API: Getting AI assistance', prompt);
    const response = await fetch(`${API_BASE_URL}/ai/assist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, context }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: AI assist failed with error:', errorText);
      throw new Error(`Failed to get AI assistance: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: AI assist successful, response:', result);
    return result;
  }

  async generatePersonalizedMessage(customer_id: number, user_id: number, message_type: string) {
    console.log('API: Generating personalized message for customer', customer_id);
    const response = await fetch(`${API_BASE_URL}/ai/generate-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customer_id, user_id, message_type }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Generate message failed with error:', errorText);
      throw new Error(`Failed to generate message: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Message generation successful, response:', result);
    return result;
  }

  async getCustomerInsights(customer_id: number, user_id: number) {
    console.log('API: Getting customer insights for customer', customer_id);
    const response = await fetch(`${API_BASE_URL}/ai/customer-insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customer_id, user_id }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Customer insights failed with error:', errorText);
      throw new Error(`Failed to get customer insights: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Customer insights successful, response:', result);
    return result;
  }

  async setupAutoResponses(user_id: number, responses: Record<string, string> = {}) {
    console.log('API: Setting up auto-responses for user', user_id);
    const response = await fetch(`${API_BASE_URL}/ai/auto-responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id, responses }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Auto-responses setup failed with error:', errorText);
      throw new Error(`Failed to setup auto-responses: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Auto-responses setup successful, response:', result);
    return result;
  }

  // Marketing content generation
  async generateMarketingContent(data: any) {
    console.log('API: Generating marketing content', data);
    const response = await fetch(`${API_BASE_URL}/ai/marketing-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Marketing content generation failed with error:', errorText);
      throw new Error(`Failed to generate marketing content: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Marketing content generation successful, response:', result);
    return result;
  }
  
  // Generate AI image
  async generateAIImage(prompt: string) {
    console.log('API: Generating AI image', prompt);
    const response = await fetch(`${API_BASE_URL}/ai/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        prompt,
        model: "gemini-2.5-flash-image-preview"
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Image generation failed with error:', errorText);
      throw new Error(`Failed to generate image: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Image generation successful, response:', result);
    return result;
  }

  // Digital Presence endpoints
  async getWebsiteInfo(user_id: number) {
    console.log('API: Fetching website info for user', user_id);
    const response = await fetch(`${API_BASE_URL}/digital-presence/website/${user_id}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Website info fetch failed with error:', errorText);
      throw new Error(`Failed to fetch website info: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Website info fetch successful, response:', result);
    return result;
  }

  async getWebsiteTemplates() {
    console.log('API: Fetching website templates');
    const response = await fetch(`${API_BASE_URL}/digital-presence/templates`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Website templates fetch failed with error:', errorText);
      throw new Error(`Failed to fetch website templates: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Website templates fetch successful, response:', result);
    return result;
  }

  async applyWebsiteTemplate(user_id: number, template_id: string) {
    console.log('API: Applying website template', user_id, template_id);
    const response = await fetch(`${API_BASE_URL}/digital-presence/website/${user_id}/template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ template_id }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Template application failed with error:', errorText);
      throw new Error(`Failed to apply template: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Template application successful, response:', result);
    return result;
  }

  async generateWebsiteHtml(user_id: number, template_id: string) {
    console.log('API: Generating website HTML', user_id, template_id);
    const response = await fetch(`${API_BASE_URL}/digital-presence/website/${user_id}/generate/${template_id}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Website HTML generation failed with error:', errorText);
      throw new Error(`Failed to generate website HTML: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Website HTML generation successful, response:', result);
    return result;
  }

  async previewWebsite(user_id: number, template_id: string): Promise<string> {
    console.log('API: Fetching website preview', user_id, template_id);
    const response = await fetch(`${API_BASE_URL}/digital-presence/website/${user_id}/preview/${template_id}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Website preview failed with error:', errorText);
      throw new Error(`Failed to fetch website preview: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const htmlContent = await response.text();
    console.log('API: Website preview fetch successful');
    return htmlContent;
  }

  async getSocialProfiles(user_id: number) {
    console.log('API: Fetching social profiles for user', user_id);
    const response = await fetch(`${API_BASE_URL}/digital-presence/social-profiles/${user_id}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Social profiles fetch failed with error:', errorText);
      throw new Error(`Failed to fetch social profiles: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Social profiles fetch successful, response:', result);
    return result;
  }

  async getDigitalPresenceAnalytics(user_id: number) {
    console.log('API: Fetching digital presence analytics for user', user_id);
    const response = await fetch(`${API_BASE_URL}/digital-presence/analytics/${user_id}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Digital presence analytics fetch failed with error:', errorText);
      throw new Error(`Failed to fetch digital presence analytics: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Digital presence analytics fetch successful, response:', result);
    return result;
  }
}

export const apiService = new ApiService();