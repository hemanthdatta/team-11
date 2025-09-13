import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Gift, Share2, Trophy, Users, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';

interface Referral {
  id: number;
  user_id: number;
  customer_id: number;
  referred_by: string;
  status: string;
  reward_points: number;
}

interface ReferralDashboardProps {
  userId: string;
}

export function ReferralDashboard({ userId }: ReferralDashboardProps) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralStatsState, setReferralStatsState] = useState({
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    totalEarnings: 0,
    currentTier: 'Bronze',
    nextTierProgress: 0
  });
  const [loading, setLoading] = useState(false); // Changed to false by default
  const [error, setError] = useState('');
  const [referralLink, setReferralLink] = useState<string>('');
  const [referralCode, setReferralCode] = useState<string>('');
  const [copyMsg, setCopyMsg] = useState<string>('');

  const referralStats = {
    totalReferrals: referralStatsState.totalReferrals,
    successfulReferrals: referralStatsState.successfulReferrals,
    pendingReferrals: referralStatsState.pendingReferrals,
    totalEarnings: referralStatsState.totalEarnings,
    currentTier: referralStatsState.currentTier,
    nextTierProgress: referralStatsState.nextTierProgress
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        // Convert userId to number if it's a string
        const userIdNum = typeof userId === 'string' ? parseInt(userId) || 1 : userId;
        const referralsData = await apiService.getReferrals(userIdNum);
        const statsData = await apiService.getReferralStats(userIdNum);
        setReferrals(referralsData);
        // Map snake_case keys from backend to camelCase used in UI state
        const mappedStats = {
          totalReferrals: statsData.total_referrals ?? 0,
          successfulReferrals: statsData.completed_referrals ?? 0,
          pendingReferrals: statsData.pending_referrals ?? 0,
          totalEarnings: statsData.total_earnings ?? 0,
          currentTier: statsData.current_tier ?? 'Bronze',
          nextTierProgress: statsData.next_tier_progress ?? 0,
        };
        setReferralStatsState(mappedStats);
        // Fetch referral link
        try {
          const linkData = await apiService.getReferralLink(userIdNum);
          setReferralLink(linkData.referral_link);
          setReferralCode(linkData.referral_code);
        } catch (linkErr) {
          console.error('Referral link error:', linkErr);
        }
      } catch (err) {
        setError('Failed to load referral data');
        console.error('Referrals error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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
        <h1 className="text-xl mb-1">Your Referrals</h1>
        <p className="text-muted-foreground text-sm">Track your referral progress and rewards</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Gift className="h-5 w-5 text-green-600" />
                <Badge variant="secondary">+{referralStats.pendingReferrals} pending</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold">{referralStats.totalReferrals}</p>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="h-5 w-5 text-orange-600" />
                <Badge variant="secondary">₹{referralStats.totalEarnings.toLocaleString()}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold">{referralStats.successfulReferrals}</p>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tier Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Referral Tier: {referralStats.currentTier}</span>
              <Badge variant="outline">{referralStats.nextTierProgress}% to Gold</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={referralStats.nextTierProgress} className="mb-3" />
            <p className="text-sm text-muted-foreground">
              Just 8 more successful referrals to reach Gold tier and unlock higher rewards!
            </p>
          </CardContent>
        </Card>

        {/* Referral Link */}
        <Card>
          <CardHeader>
            <CardTitle>Share Your Referral Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm flex-1 truncate">
                  {referralLink || `https://growthpro.app/ref/${userId || 'user123'}`}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(referralLink || '');
                      setCopyMsg('Copied!');
                      setTimeout(() => setCopyMsg(''), 1500);
                    } catch {}
                  }}
                  aria-label="Copy referral link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copyMsg && <p className="text-xs text-muted-foreground">{copyMsg}</p>}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={async () => {
                    if ((navigator as any).share && referralLink) {
                      try {
                        await (navigator as any).share({ title: 'My Referral Link', url: referralLink, text: 'Join via my referral!' });
                      } catch {}
                    } else if (referralLink) {
                      await navigator.clipboard.writeText(referralLink);
                      setCopyMsg('Link copied to share');
                      setTimeout(() => setCopyMsg(''), 1500);
                    }
                  }}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share Now
                </Button>
                <Button size="sm" variant="outline" onClick={() => referralLink && window.open(referralLink, '_blank') } aria-label="Open referral link">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/** Use the most recent 5 referrals from fetched data */}
              {(referrals || []).slice(0, 5).map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">Customer #{referral.customer_id}</h4>
                      <Badge className={`text-xs ${getStatusColor(referral.status)}`}>
                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Referral</span>
                      <span>₹{referral.reward_points}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Reward Points</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referral Tips */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Referral Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Share your success stories with potential customers
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Follow up with referred customers within 24 hours
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Use social media to expand your network
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}