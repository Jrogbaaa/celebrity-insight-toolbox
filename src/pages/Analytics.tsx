import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram, Loader2 } from "lucide-react";
import { useInstagramAnalysis } from "@/services/InstagramService";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EngagementChart } from "@/components/EngagementChart";
import { MetricsGrid } from "@/components/MetricsGrid";
import { PostTimingAnalyzer } from "@/components/PostTimingAnalyzer";

const Analytics = () => {
  const { toast } = useToast();
  const { data: metrics, isLoading, error } = useInstagramAnalysis();

  const handleConnectInstagram = () => {
    const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
    const redirectUri = `${window.location.origin}/instagram-callback`;
    const scope = 'instagram_basic,instagram_content_publish';
    
    const instagramUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    
    window.location.href = instagramUrl;
  };

  if (error?.message === "Please connect your Instagram account first") {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Instagram Analytics</h1>
        <Card className="p-6">
          <div className="text-center">
            <Instagram className="mx-auto h-12 w-12 mb-4 text-pink-500" />
            <h2 className="text-2xl font-semibold mb-4">Connect Your Instagram Account</h2>
            <p className="text-muted-foreground mb-6">
              Connect your Instagram Business account to view detailed analytics and insights about your profile.
            </p>
            <Button onClick={handleConnectInstagram}>
              Connect Instagram
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Your Instagram Analytics</h1>

      {error && error.message !== "Please connect your Instagram account first" && (
        <Alert variant="destructive" className="mb-8">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Card className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your Instagram metrics...</p>
        </Card>
      ) : metrics && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricsGrid />
          </div>
          <div className="grid gap-4 mt-8">
            <EngagementChart />
            {metrics.posts && <PostTimingAnalyzer posts={metrics.posts} />}
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;