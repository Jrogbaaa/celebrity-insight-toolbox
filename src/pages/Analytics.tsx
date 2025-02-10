
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EngagementChart } from "@/components/EngagementChart";
import { MetricsGrid } from "@/components/MetricsGrid";
import { PostTimingAnalyzer } from "@/components/PostTimingAnalyzer";
import { CelebrityReportUploader } from "@/components/analytics/CelebrityReportUploader";
import { CelebrityReportSelector } from "@/components/analytics/CelebrityReportSelector";
import { useReportsData } from "@/components/analytics/useReportsData";

const Analytics = () => {
  const { reports, selectedReport, setSelectedReport, fetchReports } = useReportsData();

  // Update example data based on selected report
  const getExampleData = () => {
    if (!selectedReport) return null;

    const report = selectedReport.report_data;
    console.log('Selected report data:', report);

    return {
      followers: report.followers.total,
      engagementRate: parseFloat(report.engagement.rate),
      commentsPerPost: report.engagement.average_comments,
      sharesPerPost: Math.round(report.engagement.average_likes / 100), // Using a portion of likes as shares
      mediaUploads: report.media_uploads.total,
      following: report.following.total,
      averageLikes: report.engagement.average_likes,
      recentPosts: report.growth_trends.map((trend: any) => ({
        date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        engagement: trend.followers
      })),
      posts: report.growth_trends.map((trend: any) => ({
        timestamp: new Date(trend.date).toISOString(),
        likes: Math.round(report.engagement.average_likes),
        comments: Math.round(report.engagement.average_comments)
      }))
    };
  };

  const metrics = getExampleData() || {
    followers: 15400,
    engagementRate: 4.2,
    commentsPerPost: 25,
    sharesPerPost: 15,
    mediaUploads: 100,
    following: 500,
    averageLikes: 1200,
    recentPosts: [
      { date: "Jan 1", engagement: 2400 },
      { date: "Jan 15", engagement: 1398 },
      { date: "Feb 1", engagement: 9800 },
      { date: "Feb 15", engagement: 3908 },
      { date: "Mar 1", engagement: 4800 },
      { date: "Mar 15", engagement: 3800 },
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
          <CelebrityReportSelector
            reports={reports}
            selectedReport={selectedReport}
            onSelectReport={setSelectedReport}
          />
          <CelebrityReportUploader onUploadSuccess={fetchReports} />
        </div>
      </div>

      {selectedReport && (
        <Alert className="mb-8">
          <AlertDescription>
            Viewing analytics for {selectedReport.celebrity_name} ({selectedReport.username}) on {selectedReport.platform}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricsGrid data={metrics} />
      </div>
      
      <div className="grid gap-4 mt-8">
        <EngagementChart data={metrics.recentPosts} />
        <PostTimingAnalyzer posts={metrics.posts} />
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
