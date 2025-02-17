
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const CelebrityReportUploader = ({ onUploadSuccess }: { onUploadSuccess: () => Promise<void> }) => {
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
      // Upload PDF to storage
      const timestamp = new Date().getTime();
      const filePath = `pdf_reports/${timestamp}_${file.name.replace(/[^\x00-\x7F]/g, '')}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pdf_reports')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('pdf_reports')
        .getPublicUrl(filePath);

      // For now, we'll use sample data until we implement PDF parsing
      const reportData = {
        celebrity_name: "Sample Celebrity",
        username: "sampleuser",
        platform: "Instagram",
        report_data: {
          pdf_url: publicUrl,
          followers: {
            total: 1000000
          },
          following: {
            total: 500
          },
          media_uploads: {
            total: 1000
          },
          engagement: {
            rate: "2.5",
            average_likes: 25000,
            average_comments: 1000
          },
          posting_insights: {
            peak_engagement_times: ["9:00 AM", "6:00 PM"],
            general_best_times: {
              monday: ["10:00 AM", "3:00 PM"],
              tuesday: ["11:00 AM", "4:00 PM"],
              thursday: ["9:00 AM", "5:00 PM"]
            },
            posting_tips: [
              "Post consistently at peak engagement times",
              "Use a mix of content types",
              "Engage with followers' comments"
            ]
          }
        },
        report_date: new Date().toISOString().split('T')[0]
      };

      const { error: dbError } = await supabase
        .from('celebrity_reports')
        .insert([reportData]);

      if (dbError) throw dbError;

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
        className="flex items-center gap-2 bg-primary hover:bg-primary/90 transition-all"
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
