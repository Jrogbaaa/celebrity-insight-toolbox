
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const CelebrityReportUploader = ({ onUploadSuccess }: { onUploadSuccess: () => Promise<void> }) => {
  const { loading, fileInputRef, handleFileSelect } = useFileUpload(onUploadSuccess);

  return (
    <div className="flex flex-col gap-4">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
        ref={fileInputRef}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 transition-all h-9 sm:h-10 px-3 sm:px-4 max-w-[120px] sm:max-w-none"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload PDF
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="max-w-xs">Upload a PDF report to create a new celebrity profile or update an existing one</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
