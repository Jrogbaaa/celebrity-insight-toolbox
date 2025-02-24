
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CelebrityReportSelector } from "@/components/analytics/CelebrityReportSelector";
import { CelebrityReportUploader } from "@/components/analytics/CelebrityReportUploader";
import { useReportsData } from "@/components/analytics/useReportsData";
import { PlatformTabs } from "@/components/analytics/PlatformTabs";
import { UpdateReminder } from "@/components/analytics/UpdateReminder";
import { DemographicsDisplay } from "@/components/analytics/DemographicsDisplay";
import { PostAnalyzer } from "@/components/analytics/PostAnalyzer";
import { AIActionItems } from "@/components/analytics/AIActionItems";
import { SponsorOpportunities } from "@/components/analytics/SponsorOpportunities";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { MessageCircle } from "lucide-react";
import { PostingInsights } from "@/components/analytics/PostingInsights";

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
    <div className="container animate-fade-in relative min-h-screen">
      {selectedReport && (
        <div className="mb-6">
          <UpdateReminder selectedReport={selectedReport} />
        </div>
      )}

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

      <div className="space-y-8 mt-8">
        <AIActionItems selectedReport={selectedReport} />
        
        {selectedReport?.report_data.posting_insights && (
          <PostingInsights insights={selectedReport.report_data.posting_insights} />
        )}

        {selectedReport?.report_data.sponsor_opportunities && (
          <SponsorOpportunities selectedReport={selectedReport} />
        )}

        {selectedReport?.report_data.demographics && (
          <DemographicsDisplay demographics={selectedReport.report_data.demographics} />
        )}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-8 right-4 rounded-full px-6 shadow-lg flex items-center gap-2 bg-primary hover:bg-primary/90"
            size="lg"
          >
            <MessageCircle className="h-5 w-5" />
            My AI Social Expert
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[500px] h-[450px] p-0">
          <ChatContainer selectedReport={selectedReport} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Analytics;
