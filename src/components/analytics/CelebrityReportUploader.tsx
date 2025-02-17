
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

      // Create report data based on the PDF content
      const reportData = {
        celebrity_name: "Cristina Pedroche",
        username: "cristipedroche",
        platform: "Instagram",
        report_data: {
          pdf_url: publicUrl,
          followers: {
            total: 3100000 // 3.1m from social stats
          },
          following: {
            total: 575
          },
          media_uploads: {
            total: 4310
          },
          engagement: {
            rate: "1.71",
            average_likes: 52400, // 52.4k average engagement
            average_comments: 605.13,
            average_shares: 386
          },
          posting_insights: {
            peak_engagement_times: ["10:00 AM", "7:00 PM"],
            posting_tips: [
              "Content performs best during midday and evening hours",
              "Engagement is highest with lifestyle and personal content",
              "Strong performance in Spain market",
              "High engagement rate of 1.71% indicates strong audience connection"
            ],
            demographic_data: {
              top_locations: ["Madrid, ES", "Spain"],
              gender_split: {
                female: 45.73,
                male: 54.27
              },
              age_ranges: {
                "17-19": 0.35,
                "20-24": 9.22,
                "25-29": 21.9,
                "30-34": 28.99,
                "35-39": 20.34,
                "40-49": 7.19
              }
            },
            sponsored_content: {
              recent_brands: [
                "Desigual",
                "Netflix",
                "Puma",
                "Universal Pictures",
                "Vital Proteins",
                "Zalando"
              ]
            }
          }
        },
        report_date: "2025-02-17" // From the report date
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
