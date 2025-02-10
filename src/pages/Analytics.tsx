
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
    if (!selectedReport?.report_data) return null;

    const report = selectedReport.report_data;
    console.log('Processing report data:', report);

    return {
      followers: report.followers?.total || 3066164,
      engagementRate: parseFloat(report.engagement?.rate || "1.52"),
      commentsPerPost: report.engagement?.average_comments || 781.44,
      sharesPerPost: Math.round((report.engagement?.average_likes || 45755.20) / 100),
      mediaUploads: report.media_uploads?.total || 4309,
      following: report.following?.total || 577,
      averageLikes: report.engagement?.average_likes || 45755.20,
      recentPosts: Array.isArray(report.growth_trends) ? report.growth_trends.map((trend: any) => ({
        date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        engagement: trend.followers || 0
      })) : [],
      posts: Array.isArray(report.growth_trends) ? report.growth_trends.map((trend: any) => ({
        timestamp: new Date(trend.date).toISOString(),
        likes: Math.round(report.engagement?.average_likes || 45755.20),
        comments: Math.round(report.engagement?.average_comments || 781.44)
      })) : []
    };
  };

  const metrics = getExampleData() || {
    followers: 3066164,
    engagementRate: 1.52,
    commentsPerPost: 781.44,
    sharesPerPost: 457,
    mediaUploads: 4309,
    following: 577,
    averageLikes: 45755.20,
    recentPosts: [
      { date: "Jan 1", engagement: 3066164 },
      { date: "Feb 1", engagement: 3066164 },
      { date: "Mar 1", engagement: 3066164 },
    ],
    posts: [
      { timestamp: "2024-01-21T09:00:00Z", likes: 45755, comments: 781 },
      { timestamp: "2024-01-21T15:00:00Z", likes: 45755, comments: 781 },
      { timestamp: "2024-01-21T18:00:00Z", likes: 45755, comments: 781 },
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
