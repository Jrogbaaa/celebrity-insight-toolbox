
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";

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
      <Button 
        onClick={() => fileInputRef.current?.click()} 
        className="flex items-center gap-2 bg-primary hover:bg-primary/90 transition-all max-w-[180px] sm:max-w-none"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Upload PDF Report
      </Button>
    </div>
  );
};
