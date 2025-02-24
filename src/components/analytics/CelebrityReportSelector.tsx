
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
  'Jaime': '/lovable-uploads/e644962b-a296-4b0e-8d7b-77d913bd4fd2.png',
  'Cristina': '/lovable-uploads/14455bf9-eab5-417b-a412-10c0372a9e52.png',
  'Jorge Cremades': '/lovable-uploads/8f6cae49-bfa3-4b2c-9e77-b10bf20515c2.png'
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
            <Avatar className="h-6 w-6">
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
      <DropdownMenuContent className="w-[200px]">
        {uniqueCelebrities.map((celebrityName) => {
          const firstReport = getFirstReportForCelebrity(celebrityName);
          if (!firstReport) return null;
          return (
            <DropdownMenuItem
              key={celebrityName}
              onClick={() => onSelectReport(firstReport)}
              className="flex items-center gap-2 p-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={celebrityImages[celebrityName]} 
                  alt={celebrityName}
                  className="object-cover" 
                />
                <AvatarFallback>{celebrityName[0]}</AvatarFallback>
              </Avatar>
              <span>{celebrityName}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
