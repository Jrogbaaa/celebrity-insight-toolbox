
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CelebrityReportSelector } from "@/components/analytics/CelebrityReportSelector";
import { CelebrityReportUploader } from "@/components/analytics/CelebrityReportUploader";
import { useReportsData } from "@/components/analytics/useReportsData";
import { PlatformTabs } from "@/components/analytics/PlatformTabs";
import { UpdateReminder } from "@/components/analytics/UpdateReminder";
import { DemographicsDisplay } from "@/components/analytics/DemographicsDisplay";
import { AIActionItems } from "@/components/analytics/AIActionItems";
import { SponsorOpportunities } from "@/components/analytics/SponsorOpportunities";
import { PostingInsights } from "@/components/analytics/PostingInsights";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { MessageCircle, TrendingUp } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          My Analytics Hub
        </h1>
        <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none">
            <CelebrityReportSelector
              reports={reports}
              selectedReport={selectedReport}
              onSelectReport={setSelectedReport}
            />
          </div>
          <div className="flex-shrink-0">
            <CelebrityReportUploader onUploadSuccess={fetchReports} />
          </div>
        </div>
      </div>

      {selectedReport && (
        <div className="mb-8">
          <UpdateReminder selectedReport={selectedReport} />
        </div>
      )}

      {selectedReport && (
        <Alert className="mb-8">
          <AlertDescription>
            Viewing analytics for {selectedReport.celebrity_name} ({selectedReport.username}) on {selectedReport.platform}
          </AlertDescription>
        </Alert>
      )}

      {selectedReport && platforms.length > 0 && (
        <PlatformTabs platforms={platforms} currentPlatform={currentPlatform} reports={reports} selectedReport={selectedReport} setSelectedReport={setSelectedReport} />
      )}

      <div className="space-y-8 mt-8">
        <AIActionItems selectedReport={selectedReport} />
        
        {selectedReport?.report_data.posting_insights && <PostingInsights insights={selectedReport.report_data.posting_insights} />}

        {selectedReport?.report_data.sponsor_opportunities && <SponsorOpportunities selectedReport={selectedReport} />}

        {selectedReport?.report_data.demographics && <DemographicsDisplay demographics={selectedReport.report_data.demographics} />}
      </div>

      {/* Mobile floating button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-8 right-4 rounded-full shadow-lg md:hidden" 
            size="icon"
            variant="default"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[500px] h-[450px] p-0">
          <ChatContainer selectedReport={selectedReport} />
        </DialogContent>
      </Dialog>

      {/* Desktop chat container */}
      <div className="hidden md:block fixed top-32 right-8 w-[400px]">
        <ChatContainer selectedReport={selectedReport} />
      </div>

      {/* Mobile document button */}
      <Button 
        className="fixed top-24 right-4 rounded-full shadow-lg md:hidden" 
        size="icon"
        variant="default"
        onClick={() => document.querySelector('.container')?.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <TrendingUp className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default Analytics;
