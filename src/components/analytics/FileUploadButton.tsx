
import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

interface FileUploadButtonProps {
  loading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({ 
  loading, 
  fileInputRef 
}) => {
  return (
    <>
      <input
        type="file"
        accept="image/*,video/*"
        className="hidden"
        ref={fileInputRef}
      />
      
      <Button 
        onClick={() => fileInputRef.current?.click()} 
        className="flex items-center gap-2 bg-[#D6BCFA] hover:bg-[#D6BCFA]/90 text-primary transition-all h-11"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Analyze Post
      </Button>
    </>
  );
};
