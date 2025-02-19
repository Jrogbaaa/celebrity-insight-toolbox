
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CelebrityReportSelector } from "@/components/analytics/CelebrityReportSelector";
import { CelebrityReportUploader } from "@/components/analytics/CelebrityReportUploader";
import { useReportsData } from "@/components/analytics/useReportsData";
import { PlatformTabs } from "@/components/analytics/PlatformTabs";
import { UpdateReminder } from "@/components/analytics/UpdateReminder";
import { DemographicsDisplay } from "@/components/analytics/DemographicsDisplay";
import { PostAnalyzer } from "@/components/analytics/PostAnalyzer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { MessageCircle, Sparkles, Gift, Clock } from "lucide-react";
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

  const getPersonalizedActionItems = () => {
    if (!selectedReport) return [];

    const actionItems = {
      "Cristina Pedroche": {
        items: [
          "Schedule Netflix content releases to align with 12:00 AM ET Wednesday peak engagement time",
          "Create workout routines featuring Puma activewear to boost athletic content engagement",
          "Plan Desigual fashion content during midday hours (10:00 AM) for maximum reach",
          "Cross-promote Vital Proteins content with wellness tips during 7:00 PM engagement spike",
          "Develop Zalando try-on hauls to capitalize on e-commerce audience interest"
        ]
      },
      "Jaime Lorente Lopez": {
        items: [
          "Share behind-the-scenes Armani Beauty content during 6:00 PM peak engagement window",
          "Create luxury lifestyle content featuring Maserati during weekend prime times",
          "Schedule Hugo Boss fashion editorials for 2:00 PM slot targeting working professionals",
          "Develop Oakley sports-lifestyle content that appeals to the 25-34 male demographic",
          "Plan Universal Pictures content to align with streaming releases and red carpet events"
        ]
      },
      "Jorge Cremades": {
        items: [
          "Focus comedy sketches around El Corte Inglés shopping experiences",
          "Create lifestyle content featuring Jimmy Choo during peak engagement times",
          "Develop Red Bull-sponsored active lifestyle content",
          "Schedule Lidl content during afternoon shopping hours",
          "Plan Ted Baker fashion content targeting male audience segments"
        ]
      }
    };

    return actionItems[selectedReport.celebrity_name as keyof typeof actionItems]?.items || [];
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
          <div className="flex flex-col sm:flex-row gap-4">
            <CelebrityReportUploader onUploadSuccess={fetchReports} />
            <PostAnalyzer />
          </div>
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
            {selectedReport ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3">Personalized Action Plan</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {getPersonalizedActionItems().map((item: string, index: number) => (
                      <li key={index} className="text-foreground text-base">{item}</li>
                    ))}
                  </ul>
                </div>
                
                {selectedReport.report_data.posting_insights?.peak_engagement_times && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Best Posting Times
                    </h3>
                    <p className="text-foreground text-base">
                      Optimal engagement at: {selectedReport.report_data.posting_insights.peak_engagement_times.join(', ')}
                    </p>
                  </div>
                )}
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
