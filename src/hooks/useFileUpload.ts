
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

      // Check if celebrity already exists
      const { data: existingReports } = await supabase
        .from('celebrity_reports')
        .select('*')
        .eq('celebrity_name', reportData.celebrity_name);

      if (existingReports && existingReports.length > 0) {
        // If celebrity exists but platform is different, add new report
        const platformExists = existingReports.some(
          report => report.platform === reportData.platform
        );

        if (platformExists) {
          // Update existing report
          const existingReport = existingReports.find(
            report => report.platform === reportData.platform
          );
          
          const { error: updateError } = await supabase
            .from('celebrity_reports')
            .update({
              report_data: reportData.report_data,
              report_date: reportData.report_date
            })
            .eq('id', existingReport?.id);

          if (updateError) throw updateError;
        } else {
          // Add new platform report
          await saveReportToDatabase(reportData);
        }
      } else {
        // New celebrity, create new report
        await saveReportToDatabase(reportData);
      }

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
