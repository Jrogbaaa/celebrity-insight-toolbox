
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

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
  'Jaime Lorente Lopez': '/lovable-uploads/90cf8a1b-7d74-4343-b904-af2703049da6.png',
  'Cristina Pedroche': '/lovable-uploads/399f8136-3693-48a7-bcfb-01d4bf894f6e.png',
  'Jorge Cremades': '/lovable-uploads/5295d8ff-7074-45d3-8e53-5bf795706af4.png'
};

export const CelebrityReportSelector = ({
  reports,
  selectedReport,
  onSelectReport,
}: CelebrityReportSelectorProps) => {
  const [imageLoadError, setImageLoadError] = useState<Record<string, boolean>>({});
  const uniqueCelebrities = Array.from(new Set(reports.map(report => report.celebrity_name)));
  
  const getFirstReportForCelebrity = (celebrityName: string) => {
    return reports.find(report => report.celebrity_name === celebrityName);
  };

  const handleImageError = (celebrityName: string) => {
    console.error(`Failed to load image for ${celebrityName}`);
    setImageLoadError(prev => ({ ...prev, [celebrityName]: true }));
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
                onError={() => handleImageError(selectedReport.celebrity_name)}
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

          const imagePath = celebrityImages[celebrityName];
          console.log('Loading image:', imagePath, 'for celebrity:', celebrityName);

          return (
            <DropdownMenuItem
              key={celebrityName}
              onClick={() => onSelectReport(firstReport)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm cursor-pointer"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={imagePath}
                  alt={celebrityName}
                  onError={() => handleImageError(celebrityName)}
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
