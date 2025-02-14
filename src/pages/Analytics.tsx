
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MetricsGrid } from "@/components/MetricsGrid";
import { CelebrityReportSelector } from "@/components/analytics/CelebrityReportSelector";
import { PostingInsights } from "@/components/analytics/PostingInsights";
import { useReportsData } from "@/components/analytics/useReportsData";
import { CelebrityReportUploader } from "@/components/analytics/CelebrityReportUploader";

const Analytics = () => {
  const { reports, selectedReport, setSelectedReport, fetchReports } = useReportsData();

  // Update example data based on selected report
  const getExampleData = () => {
    if (!selectedReport?.report_data) return null;

    const report = selectedReport.report_data;
    console.log('Processing report data:', report);

    return {
      followers: report.followers?.total || 3066019,
      engagementRate: parseFloat(report.engagement?.rate || "1.28"),
      commentsPerPost: report.engagement?.average_comments || 605.13,
      sharesPerPost: Math.round((report.engagement?.average_likes || 38663.80) / 100),
      mediaUploads: report.media_uploads?.total || 4310,
      following: report.following?.total || 575,
      averageLikes: report.engagement?.average_likes || 38663.80,
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

  const metrics = getExampleData() || defaultMetrics;

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
          Celebrity Analytics Hub
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricsGrid data={metrics} />
      </div>
      
      <div className="grid gap-4 mt-8">
        {selectedReport?.report_data?.posting_insights && (
          <PostingInsights insights={selectedReport.report_data.posting_insights} />
        )}
      </div>

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
