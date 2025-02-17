
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadPdfToStorage, createReportData, saveReportToDatabase } from "@/utils/reportUpload";

export const useFileUpload = (onUploadSuccess: () => Promise<void>) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      const publicUrl = await uploadPdfToStorage(file, timestamp);
      const reportData = createReportData(publicUrl);
      await saveReportToDatabase(reportData);

      toast({
        title: "Success",
        description: "Report uploaded successfully!",
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      await onUploadSuccess();
    } catch (error) {
      console.error('Error uploading report:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fileInputRef,
    handleFileSelect,
  };
};
