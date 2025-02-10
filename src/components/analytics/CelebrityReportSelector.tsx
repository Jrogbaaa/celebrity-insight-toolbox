
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {selectedReport ? selectedReport.celebrity_name : "Select Celebrity"}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {reports.map((report) => (
          <DropdownMenuItem
            key={report.id}
            onClick={() => onSelectReport(report)}
          >
            {report.celebrity_name} ({report.platform})
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
