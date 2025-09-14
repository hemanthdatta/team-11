import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Loader2, Save, Upload, User, Building, MapPin, Globe, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../services/api';

interface ProfilePageProps {
  userId: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  user_id: string;
  business_name: string | null;
  business_type: string | null;
  location: string | null;
  bio: string | null;
  website: string | null;
  profile_image: string | null;
  created_at: string;
  updated_at: string | null;
}

interface BusinessType {
  business_types: string[];
}

export function ProfilePage({ userId }: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [activeTab, setActiveTab] = useState('personal');

  // Fetch user profile and business types on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const profileData = await apiService.getProfile(userId);
        setProfile(profileData);
        setFormData({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          business_name: profileData.business_name,
          business_type: profileData.business_type,
          location: profileData.location,
          bio: profileData.bio,
          website: profileData.website
        });

        // Fetch business types
        const { business_types } = await apiService.getBusinessTypes();
        setBusinessTypes(business_types);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProfileImageUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image file');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await apiService.uploadProfileImage(userId, formData);
      
      // Update profile with new image
      setProfile((prev) => prev ? { ...prev, profile_image: response.profile_image } : null);
      toast.success('Profile image updated successfully');
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('profile-image') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const updatedProfile = await apiService.updateProfile(userId, formData);
      setProfile(updatedProfile);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="overflow-hidden mb-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white">
              {profile?.profile_image ? (
                <AvatarImage src={profile.profile_image} alt={profile?.name} />
              ) : (
                <AvatarFallback className="bg-blue-300 text-blue-800 text-2xl">
                  {profile?.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{profile?.name}</h1>
            <p className="text-blue-100">{profile?.business_name || 'Entrepreneur'}</p>
            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
              {profile?.location && (
                <span className="flex items-center text-xs bg-white/20 rounded-full px-3 py-1">
                  <MapPin className="h-3 w-3 mr-1" /> {profile.location}
                </span>
              )}
              {profile?.business_type && (
                <span className="flex items-center text-xs bg-white/20 rounded-full px-3 py-1">
                  <Building className="h-3 w-3 mr-1" /> {profile.business_type}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">Personal Details</TabsTrigger>
              <TabsTrigger value="business">Business Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="flex">
                    <User className="mr-2 h-4 w-4 opacity-50 mt-2" />
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex">
                    <Mail className="mr-2 h-4 w-4 opacity-50 mt-2" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex">
                    <Phone className="mr-2 h-4 w-4 opacity-50 mt-2" />
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Your phone number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="flex">
                    <MapPin className="mr-2 h-4 w-4 opacity-50 mt-2" />
                    <Input
                      id="location"
                      value={formData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Your location"
                    />
                  </div>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="bio">About You</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us a bit about yourself..."
                    className="min-h-[120px]"
                  />
                </div>
                
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="profile-image">Profile Image</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <Button 
                      onClick={handleProfileImageUpload} 
                      disabled={!selectedFile || uploadingImage}
                      size="sm"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="business" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <div className="flex">
                    <Building className="mr-2 h-4 w-4 opacity-50 mt-2" />
                    <Input
                      id="business-name"
                      value={formData.business_name || ''}
                      onChange={(e) => handleInputChange('business_name', e.target.value)}
                      placeholder="Your business name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business-type">Business Type</Label>
                  <Select
                    value={formData.business_type || ''}
                    onValueChange={(value) => handleInputChange('business_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website/Social Media</Label>
                  <div className="flex">
                    <Globe className="mr-2 h-4 w-4 opacity-50 mt-2" />
                    <Input
                      id="website"
                      value={formData.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="Your website or social media profile"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-end border-t p-4 bg-gray-50">
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Basic details about your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">User ID</p>
              <p className="text-sm text-muted-foreground">{profile?.user_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Member Since</p>
              <p className="text-sm text-muted-foreground">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
