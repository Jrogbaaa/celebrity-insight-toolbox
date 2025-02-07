
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram, Loader2 } from "lucide-react";
import { useInstagramAnalysis } from "@/services/InstagramService";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EngagementChart } from "@/components/EngagementChart";
import { MetricsGrid } from "@/components/MetricsGrid";
import { PostTimingAnalyzer } from "@/components/PostTimingAnalyzer";
import { TikTokLoginButton } from "@/components/tiktok/TikTokLoginButton";
import { useTikTokAuth } from "@/hooks/useTikTokAuth";

const Analytics = () => {
  const { toast } = useToast();
  const { data: metrics, isLoading, error } = useInstagramAnalysis();
  const { handleTikTokLogin, isLoading: isTikTokLoading } = useTikTokAuth();

  const handleConnectInstagram = () => {
    const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
    const redirectUri = `${window.location.origin}/instagram-callback`;
    const scope = 'instagram_basic,instagram_content_publish';
    
    const instagramUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    
    window.location.href = instagramUrl;
  };

  // Example data for demonstration
  const exampleData = {
    followers: 15400,
    engagementRate: 4.2,
    commentsPerPost: 25,
    sharesPerPost: 15,
    recentPosts: [
      { date: "Jan", engagement: 2400 },
      { date: "Feb", engagement: 1398 },
      { date: "Mar", engagement: 9800 },
      { date: "Apr", engagement: 3908 },
      { date: "May", engagement: 4800 },
      { date: "Jun", engagement: 3800 },
    ],
    posts: [
      { timestamp: "2024-01-21T09:00:00Z", likes: 1200, comments: 45 },
      { timestamp: "2024-01-21T15:00:00Z", likes: 2300, comments: 89 },
      { timestamp: "2024-01-21T18:00:00Z", likes: 3100, comments: 120 },
      { timestamp: "2024-01-21T21:00:00Z", likes: 1800, comments: 67 },
      { timestamp: "2024-01-22T12:00:00Z", likes: 2100, comments: 78 },
      { timestamp: "2024-01-22T16:00:00Z", likes: 2800, comments: 95 },
    ],
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Social Media Analytics</h1>
        <div className="flex gap-4">
          <Button onClick={handleConnectInstagram} className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Connect Instagram
          </Button>
          <TikTokLoginButton onClick={handleTikTokLogin} isLoading={isTikTokLoading} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsGrid />
      </div>
      
      <div className="grid gap-4 mt-8">
        <EngagementChart />
        <PostTimingAnalyzer posts={exampleData.posts} />
      </div>

      <div className="mt-8 bg-muted/50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">👋 Welcome to the Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Connect your Instagram and TikTok accounts to see your real social media analytics and insights!
        </p>
      </div>
    </div>
  );
};

export default Analytics;
