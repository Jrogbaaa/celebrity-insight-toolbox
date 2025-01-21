import { EngagementChart } from "@/components/EngagementChart";
import { MetricsGrid } from "@/components/MetricsGrid";
import { PostTimingAnalyzer } from "@/components/PostTimingAnalyzer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Search, Loader2, Instagram } from "lucide-react";
import { useInstagramAnalysis } from "@/services/InstagramService";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Analytics = () => {
  const [username, setUsername] = useState("");
  const [searchedUsername, setSearchedUsername] = useState("");
  const { toast } = useToast();
  
  const { data: metrics, isLoading, error } = useInstagramAnalysis(searchedUsername);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter an Instagram username to analyze",
        variant: "destructive",
      });
      return;
    }

    setSearchedUsername(username.trim());
  };

  const handleConnectInstagram = () => {
    // Construct Instagram OAuth URL
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
              To analyze Instagram profiles, you need to connect your Instagram Business account first.
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
      <h1 className="text-3xl font-bold mb-8">Instagram Analytics</h1>
      
      <Card className="mb-8 p-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <Input
            type="text"
            placeholder="Enter Instagram username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="max-w-md"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Analyze Profile
              </>
            )}
          </Button>
        </form>
      </Card>

      {error && error.message !== "Please connect your Instagram account first" && (
        <Alert variant="destructive" className="mb-8">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {metrics && (
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