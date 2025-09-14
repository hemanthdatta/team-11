import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Globe, Eye, Smartphone, Share2, Edit, Layout, Star, Loader2, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

export function DigitalPresenceBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [websiteInfo, setWebsiteInfo] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Load website info on mount
  useEffect(() => {
    loadWebsiteInfo();
  }, []);

  const loadWebsiteInfo = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const userStr = localStorage.getItem('user');
      console.log('Raw user data from localStorage:', userStr);
      
      if (!userStr) {
        setError('No user data found. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      const user = JSON.parse(userStr);
      console.log('Parsed user data:', user);
      
      if (!user.id) {
        setError('Invalid user data. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      const info = await apiService.getWebsiteInfo(user.id);
      setWebsiteInfo(info);
    } catch (err) {
      console.error('Error loading website info:', err);
      setError('Failed to load website information: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateWebsite = async () => {
    try {
      setIsGenerating(true);
      setError('');
      
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setError('No user data found. Please log in again.');
        return;
      }
      
      const user = JSON.parse(userStr);
      if (!user.id) {
        setError('Invalid user data. Please log in again.');
        return;
      }

      console.log('Generating website for user:', user.id, 'template:', selectedTemplate);
      const result = await apiService.generateWebsiteHtml(user.id, selectedTemplate);
      
      if (result.html_content) {
        setPreviewHtml(result.html_content);
        await loadWebsiteInfo(); // Refresh website info
      }
    } catch (err) {
      console.error('Error generating website:', err);
      setError('Failed to generate website: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewWebsite = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setError('No user data found. Please log in again.');
        return;
      }
      
      const user = JSON.parse(userStr);
      if (!user.id) {
        setError('Invalid user data. Please log in again.');
        return;
      }

      console.log('Previewing website for user:', user.id, 'template:', selectedTemplate);
      const html = await apiService.previewWebsite(user.id, selectedTemplate);
      
      if (html) {
        // Open preview in new window
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(html);
          newWindow.document.close();
        }
      }
    } catch (err) {
      console.error('Error previewing website:', err);
      setError('Failed to preview website: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleApplyTemplate = async () => {
    try {
      setIsGenerating(true);
      setError('');
      
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setError('No user data found. Please log in again.');
        return;
      }
      
      const user = JSON.parse(userStr);
      if (!user.id) {
        setError('Invalid user data. Please log in again.');
        return;
      }

      console.log('Applying template for user:', user.id, 'template:', selectedTemplate);
      await apiService.applyWebsiteTemplate(user.id, selectedTemplate);
      await loadWebsiteInfo(); // Refresh website info
    } catch (err) {
      console.error('Error applying template:', err);
      setError('Failed to apply template: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const templates = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean and corporate design',
      image: '🏢',
      features: ['Contact Form', 'Service List', 'Testimonials']
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary and stylish',
      image: '✨',
      features: ['Portfolio Gallery', 'Blog Section', 'Social Links']
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple and elegant',
      image: '🎯',
      features: ['About Section', 'Contact Details']
    }
  ];

  const profileExamples = [
    {
      platform: 'WhatsApp Business',
      status: 'Active',
      features: ['Business Profile', 'Catalog', 'Quick Replies'],
      engagement: 'High'
    },
    {
      platform: 'Facebook Page',
      status: 'Needs Update',
      features: ['Business Info', 'Reviews', 'Messaging'],
      engagement: 'Medium'
    },
    {
      platform: 'Instagram Business',
      status: 'Active',
      features: ['Bio Link', 'Stories Highlights', 'Contact Button'],
      engagement: 'High'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Needs Update': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'High': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl mb-1">Your Builder</h1>
        <p className="text-muted-foreground text-sm">Create and manage your digital presence</p>
      </div>

      <div className="p-4">
        <Tabs defaultValue="website" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="website">Website Builder</TabsTrigger>
            <TabsTrigger value="profiles">Social Profiles</TabsTrigger>
          </TabsList>

          <TabsContent value="website" className="space-y-4">
            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="text-red-800 text-sm">{error}</div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setError('')}
                  >
                    Dismiss
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {isLoading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading website information...</p>
                </CardContent>
              </Card>
            )}

            {/* Current Website Status */}
            {!isLoading && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Globe className="h-5 w-5 mr-2" />
                      Your Website
                    </span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {websiteInfo?.status || 'Not Created'}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={loadWebsiteInfo}
                        disabled={isLoading}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <div className="text-4xl mb-2">
                      {websiteInfo?.template_id === 'professional' ? '🏢' : 
                       websiteInfo?.template_id === 'modern' ? '✨' : '🎯'}
                    </div>
                    <h3 className="font-medium">
                      {websiteInfo?.business_name || 'Your Business'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {websiteInfo?.website_url || 'Website URL will be generated'}
                    </p>
                    {websiteInfo?.last_updated && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last updated: {new Date(websiteInfo.last_updated).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={handlePreviewWebsite}
                      disabled={!websiteInfo?.html_content}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleGenerateWebsite}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Edit className="h-4 w-4 mr-1" />
                      )}
                      {isGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                    <Button size="sm" variant="outline" disabled>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Website Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layout className="h-5 w-5 mr-2" />
                  Choose Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{template.image}</div>
                        <div className="flex-1">
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {template.features.map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full mt-4"
                  onClick={handleApplyTemplate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Applying Template...
                    </>
                  ) : (
                    'Apply Template'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Mobile Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Smartphone className="h-5 w-5 mr-2" />
                    Mobile Preview
                  </span>
                  {previewHtml && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const newWindow = window.open('', '_blank');
                        if (newWindow) {
                          newWindow.document.write(previewHtml);
                          newWindow.document.close();
                        }
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Full Preview
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-4 max-w-sm mx-auto">
                  <div className="bg-white rounded-lg p-4 space-y-3">
                    {previewHtml ? (
                      <div 
                        className="text-xs overflow-hidden h-40"
                        dangerouslySetInnerHTML={{ 
                          __html: previewHtml.substring(0, 200) + '...' 
                        }}
                      />
                    ) : (
                      <>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                            <span className="text-xl">👨‍💼</span>
                          </div>
                          <h3 className="font-medium">
                            {websiteInfo?.business_name || 'Your Business'}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {websiteInfo?.business_type || 'Business Professional'}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-200 rounded"></div>
                          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <div className="h-8 bg-blue-500 rounded flex-1"></div>
                          <div className="h-8 bg-gray-200 rounded flex-1"></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {!websiteInfo?.html_content && (
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Generate your website to see the mobile preview
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profiles" className="space-y-4">
            {/* Profile Overview */}
            <div className="space-y-3">
              {profileExamples.map((profile, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{profile.platform}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${getStatusColor(profile.status)}`}>
                          {profile.status}
                        </Badge>
                        <div className="flex items-center">
                          <Star className={`h-3 w-3 mr-1 ${getEngagementColor(profile.engagement)}`} />
                          <span className={`text-xs ${getEngagementColor(profile.engagement)}`}>
                            {profile.engagement}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {profile.features.map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Update
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Profile Tips */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Profile Optimization Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-blue-800">
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span>Use a professional photo as your profile picture</span>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span>Include your location and contact information</span>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span>Post regular updates about your services</span>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span>Respond quickly to customer inquiries</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}