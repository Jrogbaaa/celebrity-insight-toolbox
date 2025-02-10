
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EngagementChart } from "@/components/EngagementChart";
import { MetricsGrid } from "@/components/MetricsGrid";
import { PostTimingAnalyzer } from "@/components/PostTimingAnalyzer";

const Analytics = () => {
  const { toast } = useToast();

  const handleUploadReport = () => {
    // This will be implemented in the next step
    toast({
      title: "Coming Soon",
      description: "Report upload functionality will be available shortly.",
    });
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
    <div className="container py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Celebrity Analytics Hub
        </h1>
        <Button onClick={handleUploadReport} className="flex items-center gap-2 bg-primary hover:bg-primary/90 transition-all">
          <Upload className="h-5 w-5" />
          Upload Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsGrid />
      </div>
      
      <div className="grid gap-4 mt-8">
        <EngagementChart />
        <PostTimingAnalyzer posts={exampleData.posts} />
      </div>

      <div className="mt-8 bg-card rounded-lg p-6 shadow-lg border border-border/50">
        <h2 className="text-lg font-semibold mb-2">👋 Welcome to the Analytics Hub</h2>
        <p className="text-muted-foreground">
          Upload celebrity social media reports to analyze metrics, engagement rates, and discover valuable insights across platforms.
        </p>
      </div>
    </div>
  );
};

export default Analytics;
