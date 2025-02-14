
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
      const filePath = `public/${timestamp}_${file.name.replace(/[^\x00-\x7F]/g, '')}`;
      
      const { error: uploadError } = await supabase.storage
        .from('pdf_reports')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('pdf_reports')
        .getPublicUrl(filePath);

      // Create report entry with file reference
      const reportData = {
        celebrity_name: "Cristina Pedroche", // This would come from PDF parsing in a real implementation
        username: "cristipedroche",
        platform: "Instagram",
        report_data: {
          pdf_url: publicUrl,
          followers: {
            total: 3066019
          },
          following: {
            total: 575
          },
          media_uploads: {
            total: 4310
          },
          engagement: {
            rate: "1.28",
            average_likes: 38663.80,
            average_comments: 605.13
          }
        },
        report_date: new Date().toISOString().split('T')[0]
      };

      const { error: dbError } = await supabase
        .from('celebrity_reports')
        .insert([reportData])
        .select()
        .single();

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
        description: error instanceof Error ? error.message : "Failed to upload report. Please try again.",
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
