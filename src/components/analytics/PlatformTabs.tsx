
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsGrid } from "@/components/MetricsGrid";
import { getPlatformIcon, getMetricsForReport } from "@/utils/platformUtils";

interface PlatformTabsProps {
  platforms: string[];
  currentPlatform: string;
  reports: any[];
  selectedReport: any;
  setSelectedReport: (report: any) => void;
}

export const PlatformTabs = ({
  platforms,
  currentPlatform,
  reports,
  selectedReport,
  setSelectedReport,
}: PlatformTabsProps) => {
  const getReportForPlatform = (platform: string) => {
    return reports.find(
      report => 
        report.celebrity_name === selectedReport?.celebrity_name && 
        report.platform === platform
    );
  };

  return (
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
        const metrics = report ? getMetricsForReport(report) : null;
        
        return (
          <TabsContent key={platform} value={platform}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {metrics && <MetricsGrid data={metrics} />}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};
