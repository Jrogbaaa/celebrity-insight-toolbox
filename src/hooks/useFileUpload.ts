
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadPdfToStorage, createReportData, saveReportToDatabase } from "@/utils/reportUpload";
import { supabase } from "@/integrations/supabase/client";

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
      // Show initial toast to indicate processing
      toast({
        title: "Processing PDF",
        description: "Extracting data from your PDF and creating profile...",
      });
      
      const timestamp = new Date().getTime();
      const publicUrl = await uploadPdfToStorage(file, timestamp);
      console.log("PDF uploaded successfully, URL:", publicUrl);
      
      const reportData = await createReportData(file, publicUrl);
      console.log("Created report data:", reportData.celebrity_name);

      // Check if celebrity already exists
      const { data: existingReports } = await supabase
        .from('celebrity_reports')
        .select('*')
        .eq('celebrity_name', reportData.celebrity_name);

      console.log("Existing reports check:", existingReports);

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
          
          console.log("Updating existing report for", reportData.celebrity_name);
          const { error: updateError } = await supabase
            .from('celebrity_reports')
            .update({
              report_data: reportData.report_data,
              report_date: reportData.report_date
            })
            .eq('id', existingReport?.id);

          if (updateError) {
            console.error("Error updating report:", updateError);
            throw updateError;
          }
          
          toast({
            title: "Report Updated",
            description: `Updated report for ${reportData.celebrity_name} on ${reportData.platform}`,
          });
        } else {
          // Add new platform report
          console.log("Adding new platform for", reportData.celebrity_name);
          await saveReportToDatabase(reportData);
          
          toast({
            title: "New Platform Added",
            description: `Added ${reportData.platform} report for ${reportData.celebrity_name}`,
          });
        }
      } else {
        // New celebrity, create new report
        console.log("Creating new celebrity:", reportData.celebrity_name);
        const savedData = await saveReportToDatabase(reportData);
        console.log("New celebrity saved data:", savedData);
        
        toast({
          title: "New Celebrity Added",
          description: `Created report for ${reportData.celebrity_name} on ${reportData.platform}`,
        });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh the reports list to include the new or updated report
      console.log("Refreshing reports after save...");
      await onUploadSuccess();
      console.log("Reports refreshed.");
      
      // Additional success toast to confirm everything worked
      toast({
        title: "Success",
        description: "Profile now available in the dropdown menu",
      });
      
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
