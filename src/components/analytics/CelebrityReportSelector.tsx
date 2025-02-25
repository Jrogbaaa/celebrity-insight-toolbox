
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

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
  'Cristina Pedroche': '/lovable-uploads/0ba089d2-3d60-496a-a5bd-c19fc4218930.png', // Updated to new image
  'Jorge Cremades': '/lovable-uploads/dfce4dad-be8c-46aa-87b0-9b4c433313db.png'
};

export const CelebrityReportSelector = ({
  reports,
  selectedReport,
  onSelectReport,
}: CelebrityReportSelectorProps) => {
  const [imageLoadError, setImageLoadError] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    // Preload and test all images
    Object.entries(celebrityImages).forEach(([name, path]) => {
      const img = new Image();
      img.onload = () => console.log(`Successfully loaded image for ${name}:`, path);
      img.onerror = (error) => console.error(`Failed to load image for ${name}:`, path, error);
      img.src = path;
    });
  }, []);

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
        <Button 
          variant="outline" 
          className="flex items-center gap-2 min-w-[200px] sm:min-w-[200px] max-w-[150px] sm:max-w-none h-9 sm:h-10"
        >
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
          <span className="truncate">{selectedReport ? selectedReport.celebrity_name : "Select Celebrity"}</span>
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
