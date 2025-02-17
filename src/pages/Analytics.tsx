
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CelebrityReportSelector } from "@/components/analytics/CelebrityReportSelector";
import { useReportsData } from "@/components/analytics/useReportsData";
import { PlatformTabs } from "@/components/analytics/PlatformTabs";
import { UpdateReminder } from "@/components/analytics/UpdateReminder";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { MessageCircle } from "lucide-react";
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

  return (
    <div className="container py-8 animate-fade-in relative min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Analytics Hub
        </h1>
        <div className="flex items-center gap-4">
          <CelebrityReportSelector
            reports={reports}
            selectedReport={selectedReport}
            onSelectReport={setSelectedReport}
          />
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

      {/* AI Action Items Section */}
      <div className="mt-8">
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>AI Action Items</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedReport && selectedReport.report_data.posting_insights ? (
              <div className="space-y-4">
                <h3 className="font-semibold">Engagement Optimization</h3>
                <ul className="list-disc list-inside space-y-2">
                  {selectedReport.report_data.posting_insights.posting_tips.map((tip: string, index: number) => (
                    <li key={index} className="text-muted-foreground">{tip}</li>
                  ))}
                </ul>
                
                <h3 className="font-semibold mt-4">Best Posting Times</h3>
                <p className="text-muted-foreground">
                  Optimal engagement at: {selectedReport.report_data.posting_insights.peak_engagement_times.join(', ')}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Select a celebrity to view AI insights.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sponsor Opportunities Section */}
      {selectedReport?.report_data.sponsor_opportunities && (
        <div className="mt-8">
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Sponsor Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ul className="list-disc list-inside space-y-2">
                  {selectedReport.report_data.sponsor_opportunities.map((opportunity: string, index: number) => (
                    <li key={index} className="text-muted-foreground">{opportunity}</li>
                  ))}
                </ul>
                {selectedReport.report_data.brand_mentions && (
                  <div className="mt-4">
                    <h3 className="font-semibold">Recent Brand Mentions</h3>
                    <p className="text-muted-foreground mt-2">
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

      {/* AI Social Expert Chat Button */}
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
          <ChatContainer />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Analytics;
