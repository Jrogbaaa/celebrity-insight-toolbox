
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CelebrityReportSelector } from "@/components/analytics/CelebrityReportSelector";
import { CelebrityReportUploader } from "@/components/analytics/CelebrityReportUploader";
import { useReportsData } from "@/components/analytics/useReportsData";
import { PlatformTabs } from "@/components/analytics/PlatformTabs";
import { UpdateReminder } from "@/components/analytics/UpdateReminder";
import { DemographicsDisplay } from "@/components/analytics/DemographicsDisplay";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { MessageCircle, Sparkles, Gift, Clock, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Analytics = () => {
  const { reports, selectedReport, setSelectedReport, fetchReports } = useReportsData();

  const getUniquePlatforms = () => {
    if (!selectedReport) return [];
    return [...new Set(reports
      .filter(report => report.celebrity_name === selectedReport.celebrity_name)
      .map(report => report.platform))];
  };

  const platforms = getUniquePlatforms();
  const currentPlatform = selectedReport?.platform || platforms[0];

  const formatPercentage = (value: unknown): string => {
    if (typeof value === 'string' || typeof value === 'number') {
      return `${value}%`;
    }
    return '0%';
  };

  return (
    <div className="container py-8 animate-fade-in relative min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Analytics Hub
        </h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
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

      {selectedReport && platforms.length > 0 && (
        <PlatformTabs
          platforms={platforms}
          currentPlatform={currentPlatform}
          reports={reports}
          selectedReport={selectedReport}
          setSelectedReport={setSelectedReport}
        />
      )}

      <div className="mt-8">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedReport && selectedReport.report_data.posting_insights ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3">Engagement Optimization</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {selectedReport.report_data.posting_insights.posting_tips.map((tip: string, index: number) => (
                      <li key={index} className="text-foreground text-base">{tip}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Best Posting Times
                  </h3>
                  <p className="text-foreground text-base">
                    Optimal engagement at: {selectedReport.report_data.posting_insights.peak_engagement_times.join(', ')}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-foreground text-base">Select a celebrity to view AI insights.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedReport?.report_data.demographics && (
        <div className="mt-8">
          <DemographicsDisplay demographics={selectedReport.report_data.demographics} />
        </div>
      )}

      {selectedReport?.report_data.sponsor_opportunities && (
        <div className="mt-8">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-xl text-primary flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Sponsor Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <ul className="list-disc list-inside space-y-2">
                    {selectedReport.report_data.sponsor_opportunities.map((opportunity: string, index: number) => (
                      <li key={index} className="text-foreground text-base">{opportunity}</li>
                    ))}
                  </ul>
                </div>
                {selectedReport.report_data.brand_mentions && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-3">Recent Brand Mentions</h3>
                    <p className="text-foreground text-base mt-2">
                      {selectedReport.report_data.brand_mentions.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <UpdateReminder selectedReport={selectedReport} />

      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-8 right-4 rounded-full px-6 shadow-lg flex items-center gap-2"
            size="lg"
          >
            <MessageCircle className="h-5 w-5" />
            AI Social Expert Chat
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[600px] h-[500px] p-0">
          <ChatContainer selectedReport={selectedReport} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Analytics;
