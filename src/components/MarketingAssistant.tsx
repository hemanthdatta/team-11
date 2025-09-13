import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Copy, Share2, Loader2, Check, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../services/api';

interface MarketingAssistantProps {
  userId: string;
}

interface FormattedContent {
  title: string;
  body: string;
  hashtags?: string[];
  callToAction?: string;
  imagePrompt?: string;
  generatedImageUrl?: string;
}

export function MarketingAssistant({ userId }: MarketingAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');
  const [formattedContent, setFormattedContent] = useState<FormattedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contentType, setContentType] = useState('social-media');
  const [tone, setTone] = useState('professional');
  const [platform, setPlatform] = useState('whatsapp');
  const [customerName, setCustomerName] = useState('');
  const [profileDetails, setProfileDetails] = useState<any>(null);
  const [imageGenerating, setImageGenerating] = useState(false);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (!userId) return;
      
      try {
        const profile = await apiService.getProfile(userId);
        setProfileDetails(profile);
      } catch (error) {
        console.error('Error fetching profile details:', error);
        toast.error('Failed to fetch your profile details');
      }
    };

    fetchProfileDetails();
  }, [userId]);

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setLoading(true);
    setContent('');
    setFormattedContent(null);
    
    try {
      // Create a more specific prompt based on content type
      let fullPrompt = prompt;
      
      // Include profile details if available
      const businessName = profileDetails?.business_name || 'your business';
      const businessType = profileDetails?.business_type || 'micro-business';
      const userLocation = profileDetails?.location || 'India';
      const userName = profileDetails?.name || 'entrepreneur';
      
      if (contentType === 'social-media') {
        fullPrompt = `Create engaging social media content for ${userName}, a micro-entrepreneur in ${userLocation} running ${businessName} (${businessType}).
        Platform: ${platform}
        Tone: ${tone}
        Content: ${prompt}
        
        IMPORTANT: You must respond with a VALID JSON object only, no markdown formatting or backticks.
        The response should be a single JSON object with this exact structure:
        {
          "title": "A catchy headline or title",
          "body": "The main content of the post",
          "hashtags": ["list", "of", "relevant", "hashtags"],
          "callToAction": "A compelling call to action",
          "imagePrompt": "A detailed prompt for generating an image related to this content"
        }`;
      } else if (contentType === 'email') {
        fullPrompt = `Create a professional email campaign for ${userName}, a micro-entrepreneur in ${userLocation} running ${businessName} (${businessType}).
        Tone: ${tone}
        Purpose: ${prompt}
        
        IMPORTANT: You must respond with a VALID JSON object only, no markdown formatting or backticks.
        The response should be a single JSON object with this exact structure:
        {
          "title": "Email subject line",
          "body": "The main content of the email",
          "callToAction": "A compelling call to action",
          "imagePrompt": "A detailed prompt for generating an image related to this content"
        }`;
      } else if (contentType === 'customer-outreach') {
        fullPrompt = `Create a personalized customer outreach message for ${userName}, a micro-entrepreneur in ${userLocation} running ${businessName} (${businessType}).
        Customer Name: ${customerName || 'Valued Customer'}
        Tone: ${tone}
        Purpose: ${prompt}
        
        IMPORTANT: You must respond with a VALID JSON object only, no markdown formatting or backticks.
        The response should be a single JSON object with this exact structure:
        {
          "title": "A personalized greeting",
          "body": "The main content of the message",
          "callToAction": "A compelling call to action",
          "imagePrompt": "A detailed prompt for generating an image related to this content"
        }`;
      }

      const response = await apiService.getAIAssist(fullPrompt);
      const responseText = response.response || '{"title": "Content generation failed", "body": "Please try again."}';
      
      setContent(responseText);
      
      try {
        // Clean the response text for JSON parsing
        // Handle triple quotes and other edge cases
        let cleanedResponseText = responseText;
        
        // Handle triple quotes at the beginning and end
        cleanedResponseText = cleanedResponseText.replace(/^```json\s*/, '');
        cleanedResponseText = cleanedResponseText.replace(/^"""\s*/, '');
        cleanedResponseText = cleanedResponseText.replace(/\s*"""$/, '');
        cleanedResponseText = cleanedResponseText.replace(/\s*```$/, '');
        
        // Remove any markdown-style backticks or quotes surrounding the JSON
        cleanedResponseText = cleanedResponseText.replace(/^['"`]|['"`]$/g, '');
        
        // Handle escaped quotes inside JSON
        cleanedResponseText = cleanedResponseText.replace(/\\"/g, '"');
        
        // Find the JSON object in the string
        const jsonMatch = cleanedResponseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedResponseText = jsonMatch[0];
        }
        
        console.log('Attempting to parse:', cleanedResponseText);
        
        // Try to parse the cleaned response as JSON
        const parsedContent = JSON.parse(cleanedResponseText);
        setFormattedContent(parsedContent);
        
        // Generate image if there's an image prompt
        if (parsedContent.imagePrompt) {
          generateImage(parsedContent.imagePrompt);
        }
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        
        // If parsing fails, try to extract structured information from the text
        try {
          // Create a basic formatted content object from the raw text
          const titleMatch = responseText.match(/title["\s:]+([^"]+)/i) || responseText.match(/subject["\s:]+([^"]+)/i);
          const bodyMatch = responseText.match(/body["\s:]+([^"]+)/i) || responseText.match(/content["\s:]+([^"]+)/i);
          const hashtagsMatch = responseText.match(/hashtags["\s:]+([^"]+)/i);
          const ctaMatch = responseText.match(/callToAction["\s:]+([^"]+)/i) || responseText.match(/call to action["\s:]+([^"]+)/i);
          
          const extractedContent = {
            title: titleMatch ? titleMatch[1].trim() : "Generated Content",
            body: bodyMatch ? bodyMatch[1].trim() : responseText,
            hashtags: hashtagsMatch ? hashtagsMatch[1].split(',').map(tag => tag.trim()) : [],
            callToAction: ctaMatch ? ctaMatch[1].trim() : ""
          };
          
          setFormattedContent(extractedContent);
          toast.info('Content was generated but format was adjusted');
        } catch (extractError) {
          // If all else fails, just display the raw text
          console.error('Failed to extract content:', extractError);
          toast.error('Content format could not be parsed properly');
          // Set formatted content to null so it falls back to displaying raw text
          setFormattedContent(null);
        }
      }
      
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
      setContent('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to generate an image based on a prompt
  const generateImage = async (imagePrompt: string) => {
    setImageGenerating(true);
    
    try {
      toast.info('Generating image...');
      
      // Call the backend API to generate an image
      const response = await apiService.generateAIImage(imagePrompt);
      
      if (response.imageUrl) {
        // Update the formatted content with the generated image URL
        setFormattedContent(prevContent => {
          if (prevContent) {
            return { ...prevContent, generatedImageUrl: response.imageUrl };
          }
          return prevContent;
        });
        toast.success('Image generated successfully!');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image');
    } finally {
      setImageGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (formattedContent) {
      const textToCopy = formattedContent.body || content;
      navigator.clipboard.writeText(textToCopy);
    } else {
      navigator.clipboard.writeText(content);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  const shareContent = () => {
    const textToShare = formattedContent ? 
      `${formattedContent.title}\n\n${formattedContent.body}` : 
      content;
    
    if (navigator.share) {
      navigator.share({
        title: formattedContent?.title || 'Generated Content',
        text: textToShare,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            AI Marketing Assistant
          </CardTitle>
          <p className="text-muted-foreground">
            Generate engaging content for social media, email campaigns, and customer outreach
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={contentType} onValueChange={setContentType}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="social-media">Social Media</TabsTrigger>
              <TabsTrigger value="email">Email Campaign</TabsTrigger>
              <TabsTrigger value="customer-outreach">Customer Outreach</TabsTrigger>
            </TabsList>
            
            <TabsContent value="social-media" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="email" className="space-y-4">
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                    <SelectItem value="informative">Informative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="customer-outreach" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name (Optional)</Label>
                  <Input 
                    value={customerName} 
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="appreciative">Appreciative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-2">
            <Label>Your Prompt</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to create... e.g., 'Create a promotional post for our new insurance plan for small businesses'"
              className="min-h-[120px]"
            />
          </div>
          
          <Button 
            onClick={generateContent} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Content...
              </>
            ) : (
              'Generate Content'
            )}
          </Button>
          
          {(content || formattedContent) && (
            <Card className="border-2 border-blue-100">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Generated Content</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={shareContent}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {formattedContent ? (
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <h3 className="font-bold text-lg">{formattedContent.title || 'Generated Content'}</h3>
                    </div>
                    
                    {/* Main Content */}
                    <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                      {typeof formattedContent.body === 'string' ? formattedContent.body : 
                        JSON.stringify(formattedContent.body, null, 2)}
                    </div>
                    
                    {/* Generated Image */}
                    {formattedContent.generatedImageUrl && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Generated Image:</p>
                        <img 
                          src={formattedContent.generatedImageUrl} 
                          alt="AI Generated" 
                          className="w-full h-auto rounded-lg border" 
                        />
                      </div>
                    )}
                    
                    {/* Image Generation Loading */}
                    {imageGenerating && !formattedContent.generatedImageUrl && (
                      <div className="flex items-center justify-center py-8 border rounded-lg bg-muted">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                          <p className="text-sm text-muted-foreground">Generating image...</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Hashtags */}
                    {formattedContent.hashtags && formattedContent.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formattedContent.hashtags.map((tag, i) => (
                          <div key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            #{tag}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Call to Action */}
                    {formattedContent.callToAction && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mt-3">
                        <p className="text-sm font-medium">{formattedContent.callToAction}</p>
                      </div>
                    )}
                    
                    {/* Manual Image Generation */}
                    {formattedContent.imagePrompt && !formattedContent.generatedImageUrl && !imageGenerating && (
                      <div className="mt-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">Image Prompt:</p>
                          <Button 
                            size="sm" 
                            onClick={() => generateImage(formattedContent.imagePrompt || '')}
                            disabled={imageGenerating}
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Generate Image
                          </Button>
                        </div>
                        <p className="text-xs mt-1 text-muted-foreground italic">{formattedContent.imagePrompt}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {content}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}