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
import { MessageCircle, Sparkles, Gift, Clock, Camera, Users, Target } from "lucide-react";
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
          "Create behind-the-scenes content of Puma activewear photoshoots during peak hours (10:00 AM)",
          "Share 3-5 story updates from Netflix productions with exclusive footage",
          "Document real-time wellness routines featuring Vital Proteins during morning hours",
          "Film natural try-on sessions with Desigual collections (15-30 second clips)",
          "Collaborate with Zalando influencer network during prime engagement windows",
          "Share unscripted moments with Netflix co-stars to boost cross-promotion"
        ]
      },
      "Jaime Lorente Lopez": {
        items: [
          "Film premium behind-the-scenes content at Armani Beauty events (6:00 PM window)",
          "Create high-quality action shots with Maserati during golden hour",
          "Share natural lifestyle moments wearing Hugo Boss during workday peaks (2:00 PM)",
          "Document authentic training sessions with Oakley gear for sports audience",
          "Coordinate Universal Pictures red carpet moments with co-stars",
          "Plan collaborative content with luxury brand ambassadors during prime times"
        ]
      },
      "Jorge Cremades": {
        items: [
          "Create comedy sketches featuring El Corte Inglés products during peak hours",
          "Produce lifestyle content with Jimmy Choo during prime shopping times",
          "Share authentic Red Bull-powered moments during active hours",
          "Document real shopping experiences at Lidl for relatable content",
          "Collaborate with Ted Baker ambassadors for fashion-focused content",
          "Plan group activities with fellow influencers at sponsored events"
        ]
      }
    };

    return actionItems[selectedReport.celebrity_name as keyof typeof actionItems]?.items || [];
  };

  const getContentPillars = () => {
    return [
      {
        title: "Performance Excellence",
        percentage: "40%",
        description: "Professional content, behind-the-scenes, and milestones"
      },
      {
        title: "Authentic Moments",
        percentage: "30%",
        description: "Natural lifestyle content and personal stories"
      },
      {
        title: "Team Interactions",
        percentage: "30%",
        description: "Collaborations and peer engagement"
      }
    ];
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
                  <h3 className="text-lg font-semibold text-primary mb-3">Content Strategy Pillars</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {getContentPillars().map((pillar, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{pillar.title}</span>
                          <span className="text-primary">{pillar.percentage}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{pillar.description}</p>
                      </div>
                    ))}
                  </div>
                  
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
                      Optimal Posting Windows
                    </h3>
                    <p className="text-foreground text-base">
                      Peak engagement times: {selectedReport.report_data.posting_insights.peak_engagement_times.join(', ')}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>• Post 1 hour before peak platform times</li>
                      <li>• Share stories during commute hours (7-9am, 5-7pm)</li>
                      <li>• Maintain 1 high-quality post per day</li>
                      <li>• Share 3-5 authentic stories daily</li>
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Content Format Guidelines
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Use high-quality action shots</li>
                    <li>• Create 15-30 second video clips</li>
                    <li>• Share multi-image carousels (3-5 images)</li>
                    <li>• Include raw, unfiltered moments</li>
                  </ul>
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
