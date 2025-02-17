
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CelebrityReport {
  id: string;
  celebrity_name: string;
  username: string;
  platform: string;
  report_data: any;
  report_date: string;
}

interface CelebrityReportSelectorProps {
  reports: CelebrityReport[];
  selectedReport: CelebrityReport | null;
  onSelectReport: (report: CelebrityReport) => void;
}

export const CelebrityReportSelector = ({
  reports,
  selectedReport,
  onSelectReport,
}: CelebrityReportSelectorProps) => {
  // Get unique celebrity names
  const uniqueCelebrities = Array.from(new Set(reports.map(report => report.celebrity_name)));
  
  // Find the first report for a celebrity
  const getFirstReportForCelebrity = (celebrityName: string) => {
    return reports.find(report => report.celebrity_name === celebrityName);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {selectedReport ? selectedReport.celebrity_name : "Select Celebrity"}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {uniqueCelebrities.map((celebrityName) => {
          const firstReport = getFirstReportForCelebrity(celebrityName);
          if (!firstReport) return null;
          return (
            <DropdownMenuItem
              key={celebrityName}
              onClick={() => onSelectReport(firstReport)}
            >
              {celebrityName}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
