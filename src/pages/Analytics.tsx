
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MetricsGrid } from "@/components/MetricsGrid";
import { CelebrityReportSelector } from "@/components/analytics/CelebrityReportSelector";
import { PostingInsights } from "@/components/analytics/PostingInsights";
import { useReportsData } from "@/components/analytics/useReportsData";
import { CelebrityReportUploader } from "@/components/analytics/CelebrityReportUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Instagram, Youtube, Music2, Facebook } from "lucide-react";

const Analytics = () => {
  const { reports, selectedReport, setSelectedReport, fetchReports } = useReportsData();

  // Get unique platforms for the selected celebrity
  const getUniquePlatforms = () => {
    if (!selectedReport) return [];
    return reports
      .filter(report => report.celebrity_name === selectedReport.celebrity_name)
      .map(report => report.platform);
  };

  // Get report for specific platform
  const getReportForPlatform = (platform: string) => {
    return reports.find(
      report => 
        report.celebrity_name === selectedReport?.celebrity_name && 
        report.platform === platform
    );
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      case 'tiktok':
        return <Music2 className="h-4 w-4" />; // Using Music2 icon since TikTok is music-focused
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Get metrics for the current report
  const getMetricsForReport = (report: typeof selectedReport) => {
    if (!report?.report_data) return null;

    const reportData = report.report_data;
    console.log('Processing report data for platform:', report.platform, reportData);

    // Define platform-specific metric mappings
    const platformMetrics = {
      facebook: {
        followers: reportData.page_likes?.total || reportData.followers?.total,
        engagementRate: parseFloat(reportData.engagement?.rate || "0"),
        commentsPerPost: reportData.engagement?.average_comments,
        sharesPerPost: reportData.engagement?.average_shares,
        mediaUploads: reportData.posts?.total,
        following: reportData.following?.total,
        averageLikes: reportData.engagement?.average_likes,
      },
      instagram: {
        followers: reportData.followers?.total,
        engagementRate: parseFloat(reportData.engagement?.rate || "0"),
        commentsPerPost: reportData.engagement?.average_comments,
        sharesPerPost: reportData.engagement?.average_shares,
        mediaUploads: reportData.media_uploads?.total,
        following: reportData.following?.total,
        averageLikes: reportData.engagement?.average_likes,
      },
      tiktok: {
        followers: reportData.followers?.total,
        engagementRate: parseFloat(reportData.engagement?.rate || "0"),
        commentsPerPost: reportData.engagement?.average_comments,
        sharesPerPost: reportData.engagement?.average_shares,
        mediaUploads: reportData.videos?.total || reportData.media_uploads?.total,
        following: reportData.following?.total,
        averageLikes: reportData.engagement?.average_likes,
      },
      youtube: {
        followers: reportData.subscribers?.total || reportData.followers?.total,
        engagementRate: parseFloat(reportData.engagement?.rate || "0"),
        commentsPerPost: reportData.engagement?.average_comments,
        sharesPerPost: reportData.engagement?.average_shares,
        mediaUploads: reportData.videos?.total,
        following: reportData.following?.total,
        averageLikes: reportData.engagement?.average_likes,
      }
    };

    const metrics = platformMetrics[report.platform.toLowerCase() as keyof typeof platformMetrics] || {
      followers: 0,
      engagementRate: 0,
      commentsPerPost: 0,
      sharesPerPost: 0,
      mediaUploads: 0,
      following: 0,
      averageLikes: 0,
    };

    // Apply default values for any missing metrics
    return {
      followers: metrics.followers || 0,
      engagementRate: metrics.engagementRate || 0,
      commentsPerPost: metrics.commentsPerPost || 0,
      sharesPerPost: metrics.sharesPerPost || 0,
      mediaUploads: metrics.mediaUploads || 0,
      following: metrics.following || 0,
      averageLikes: metrics.averageLikes || 0,
    };
  };

  // Set default metrics only if there's no report data
  const defaultMetrics = {
    followers: 3066019,
    engagementRate: 1.28,
    commentsPerPost: 605.13,
    sharesPerPost: 386,
    mediaUploads: 4310,
    following: 575,
    averageLikes: 38663.80,
  };

  const platforms = getUniquePlatforms();
  const currentPlatform = selectedReport?.platform || platforms[0];

  // Calculate next recommended update date
  const getNextUpdateDate = () => {
    if (!selectedReport?.report_date) return null;
    const reportDate = new Date(selectedReport.report_date);
    const nextUpdate = new Date(reportDate);
    nextUpdate.setMonth(nextUpdate.getMonth() + 2);
    return nextUpdate.toLocaleDateString();
  };

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          AI Talent
        </h1>
        <div className="flex items-center gap-4">
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

      {selectedReport && platforms.length > 1 && (
        <Tabs defaultValue={currentPlatform} className="mb-8">
          <TabsList>
            {platforms.map(platform => (
              <TabsTrigger
                key={platform}
                value={platform}
                onClick={() => {
                  const report = getReportForPlatform(platform);
                  if (report) setSelectedReport(report);
                }}
                className="flex items-center gap-2"
              >
                {getPlatformIcon(platform)}
                {platform}
              </TabsTrigger>
            ))}
          </TabsList>
          {platforms.map(platform => {
            const report = getReportForPlatform(platform);
            const metrics = report ? getMetricsForReport(report) : defaultMetrics;
            
            return (
              <TabsContent key={platform} value={platform}>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <MetricsGrid data={metrics || defaultMetrics} />
                </div>
                
                <div className="grid gap-4 mt-8">
                  {report?.report_data?.posting_insights && (
                    <PostingInsights insights={report.report_data.posting_insights} />
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {selectedReport && platforms.length === 1 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricsGrid data={getMetricsForReport(selectedReport) || defaultMetrics} />
          </div>
          
          <div className="grid gap-4 mt-8">
            {selectedReport?.report_data?.posting_insights && (
              <PostingInsights insights={selectedReport.report_data.posting_insights} />
            )}
          </div>
        </>
      )}

      <div className="mt-8 bg-card rounded-lg p-6 shadow-lg border border-border/50">
        {selectedReport ? (
          <>
            <h2 className="text-lg font-semibold mb-2">📅 Report Update Reminder</h2>
            <p className="text-muted-foreground">
              For the most accurate insights, we recommend uploading a new report for {selectedReport.celebrity_name} by {getNextUpdateDate()}. Regular updates help maintain data accuracy and track growth trends effectively.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-2">👋 Welcome to the Analytics Hub</h2>
            <p className="text-muted-foreground">
              Reports are uploaded through chat for analysis. Select a report from the dropdown to view detailed analytics.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
