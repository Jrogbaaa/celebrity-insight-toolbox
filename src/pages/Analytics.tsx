
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CelebrityReportSelector } from "@/components/analytics/CelebrityReportSelector";
import { useReportsData } from "@/components/analytics/useReportsData";
import { CelebrityReportUploader } from "@/components/analytics/CelebrityReportUploader";
import { PlatformTabs } from "@/components/analytics/PlatformTabs";
import { UpdateReminder } from "@/components/analytics/UpdateReminder";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { MessageCircle } from "lucide-react";

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

      <UpdateReminder selectedReport={selectedReport} />

      {/* AI Content Expert Floating Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-20 right-4 rounded-full w-12 h-12 p-0 shadow-lg"
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[800px] h-[600px] p-0">
          <ChatContainer />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Analytics;
