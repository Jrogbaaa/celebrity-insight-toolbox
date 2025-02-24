
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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

const celebrityImages: Record<string, string> = {
  'Jaime': '/lovable-uploads/90cf8a1b-7d74-4343-b904-af2703049da6.png',
  'Cristina': '/lovable-uploads/b4964eb4-66c5-4cf9-8f67-efacbe88fd7c.png',
  'Jorge Cremades': '/lovable-uploads/5295d8ff-7074-45d3-8e53-5bf795706af4.png'
};

export const CelebrityReportSelector = ({
  reports,
  selectedReport,
  onSelectReport,
}: CelebrityReportSelectorProps) => {
  const uniqueCelebrities = Array.from(new Set(reports.map(report => report.celebrity_name)));
  
  const getFirstReportForCelebrity = (celebrityName: string) => {
    return reports.find(report => report.celebrity_name === celebrityName);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 min-w-[200px]">
          {selectedReport && (
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={celebrityImages[selectedReport.celebrity_name]} 
                alt={selectedReport.celebrity_name}
                className="object-cover"
              />
              <AvatarFallback>{selectedReport.celebrity_name[0]}</AvatarFallback>
            </Avatar>
          )}
          <span>{selectedReport ? selectedReport.celebrity_name : "Select Celebrity"}</span>
          <ChevronDown className="h-4 w-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[200px] bg-white dark:bg-gray-800 p-1 shadow-lg rounded-md border"
        align="start"
      >
        {uniqueCelebrities.map((celebrityName) => {
          const firstReport = getFirstReportForCelebrity(celebrityName);
          if (!firstReport) return null;
          return (
            <DropdownMenuItem
              key={celebrityName}
              onClick={() => onSelectReport(firstReport)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm cursor-pointer"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={celebrityImages[celebrityName]} 
                  alt={celebrityName}
                  className="object-cover" 
                />
                <AvatarFallback>{celebrityName[0]}</AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{celebrityName}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
