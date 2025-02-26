
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

// Default avatar image to use when we don't have a specific one
const DEFAULT_AVATAR = "/placeholder.svg";

// Predefined celebrity images - we'll fallback to initials if not in this list
const celebrityImages: Record<string, string> = {
  'Jaime Lorente Lopez': '/lovable-uploads/90cf8a1b-7d74-4343-b904-af2703049da6.png',
  'Cristina Pedroche': '/lovable-uploads/0ba089d2-3d60-496a-a5bd-c19fc4218930.png',
  'Jorge Cremades': '/lovable-uploads/dfce4dad-be8c-46aa-87b0-9b4c433313db.png'
};

export const CelebrityReportSelector = ({
  reports,
  selectedReport,
  onSelectReport,
}: CelebrityReportSelectorProps) => {
  const [imageLoadError, setImageLoadError] = useState<Record<string, boolean>>({});
  
  // Get unique celebrities 
  const uniqueCelebrities = Array.from(new Set(reports.map(report => report.celebrity_name)));
  
  // Sort celebrities alphabetically
  uniqueCelebrities.sort((a, b) => a.localeCompare(b));
  
  const getFirstReportForCelebrity = (celebrityName: string) => {
    return reports.find(report => report.celebrity_name === celebrityName);
  };

  const handleImageError = (celebrityName: string) => {
    console.error(`Failed to load image for ${celebrityName}`);
    setImageLoadError(prev => ({ ...prev, [celebrityName]: true }));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
                src={celebrityImages[selectedReport.celebrity_name] || DEFAULT_AVATAR} 
                alt={selectedReport.celebrity_name}
                onError={() => handleImageError(selectedReport.celebrity_name)}
                className="object-cover"
              />
              <AvatarFallback>{getInitials(selectedReport.celebrity_name)}</AvatarFallback>
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

          const imagePath = celebrityImages[celebrityName] || DEFAULT_AVATAR;
          const hasImageError = imageLoadError[celebrityName];

          return (
            <DropdownMenuItem
              key={celebrityName}
              onClick={() => onSelectReport(firstReport)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm cursor-pointer"
            >
              <Avatar className="h-10 w-10">
                {!hasImageError ? (
                  <AvatarImage 
                    src={imagePath}
                    alt={celebrityName}
                    onError={() => handleImageError(celebrityName)}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback>{getInitials(celebrityName)}</AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{celebrityName}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
