import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EngagementChart } from "@/components/EngagementChart";
import { MetricsGrid } from "@/components/MetricsGrid";
import { PostTimingAnalyzer } from "@/components/PostTimingAnalyzer";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CelebrityReport {
  id: string;
  celebrity_name: string;
  username: string;
  platform: string;
  report_data: any;
  report_date: string;
}

const Analytics = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<CelebrityReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CelebrityReport | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('celebrity_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch celebrity reports",
        variant: "destructive",
      });
      return;
    }

    setReports(data || []);
    if (data && data.length > 0 && !selectedReport) {
      setSelectedReport(data[0]);
    }
  };

  const handleUploadReport = async () => {
    setLoading(true);
    try {
      // Example data for Cristina Pedroche
      const reportData = {
        celebrity_name: "Cristina Pedroche",
        username: "cristipedroche",
        platform: "Instagram",
        report_data: {
          followers: {
            total: 3066164,
            last_30_days: -3660,
            daily_average: -122
          },
          following: {
            total: 577,
            last_30_days: -30,
            daily_average: -1
          },
          media_uploads: {
            total: 4309,
            last_30_days: 30,
            daily_average: 1
          },
          engagement: {
            rate: "1.52%",
            average_likes: 45755.20,
            average_comments: 781.44
          },
          ranks: {
            total_grade: "B+",
            followers_rank: 10770,
            engagement_rank: 340023
          },
          growth_trends: [
            {"date": "2025-01-28", "followers": 3067295, "following": 590, "media": 4301},
            {"date": "2025-02-10", "followers": 3066164, "following": 577, "media": 4309}
          ]
        },
        report_date: new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('celebrity_reports')
        .insert([reportData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report uploaded successfully!",
      });

      await fetchReports();
    } catch (error) {
      console.error('Error uploading report:', error);
      toast({
        title: "Error",
        description: "Failed to upload report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update example data based on selected report
  const getExampleData = () => {
    if (!selectedReport) return null;

    const report = selectedReport.report_data;
    return {
      followers: report.followers.total,
      engagementRate: parseFloat(report.engagement.rate),
      commentsPerPost: Math.round(report.engagement.average_comments),
      sharesPerPost: Math.round(report.engagement.average_likes / 100), // Estimated
      recentPosts: report.growth_trends.map((trend: any) => ({
        date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short' }),
        engagement: trend.followers
      })),
      posts: report.growth_trends.map((trend: any) => ({
        timestamp: new Date(trend.date).toISOString(),
        likes: Math.round(report.engagement.average_likes),
        comments: Math.round(report.engagement.average_comments)
      }))
    };
  };

  const exampleData = getExampleData() || {
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
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {selectedReport ? selectedReport.celebrity_name : "Select Celebrity"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {reports.map((report) => (
                <DropdownMenuItem
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                >
                  {report.celebrity_name} ({report.platform})
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            onClick={handleUploadReport} 
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 transition-all"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload Report
          </Button>
        </div>
      </div>

      {selectedReport && (
        <Alert className="mb-8">
          <AlertDescription>
            Viewing analytics for {selectedReport.celebrity_name} ({selectedReport.username}) on {selectedReport.platform}
          </AlertDescription>
        </Alert>
      )}

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
