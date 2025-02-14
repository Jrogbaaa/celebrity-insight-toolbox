
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const CelebrityReportUploader = ({ onUploadSuccess }: { onUploadSuccess: () => Promise<void> }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadReport = async () => {
    setLoading(true);
    try {
      if (!selectedFile) {
        toast({
          title: "No file selected",
          description: "Please select a PDF file to upload",
          variant: "destructive",
        });
        return;
      }

      // Upload PDF to storage
      const timestamp = new Date().getTime();
      const filePath = `public/${timestamp}_${selectedFile.name.replace(/[^\x00-\x7F]/g, '')}`;
      
      const { error: uploadError } = await supabase.storage
        .from('pdf_reports')
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

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

      setSelectedFile(null);
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
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => fileInputRef.current?.click()} 
          variant="outline"
          className="flex items-center gap-2"
          disabled={loading}
        >
          <File className="h-4 w-4" />
          {selectedFile ? selectedFile.name : "Select PDF Report"}
        </Button>
        <Button 
          onClick={handleUploadReport} 
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 transition-all"
          disabled={loading || !selectedFile}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload Report
        </Button>
      </div>
    </div>
  );
};
