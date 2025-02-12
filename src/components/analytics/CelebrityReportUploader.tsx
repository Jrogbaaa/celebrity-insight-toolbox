
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const CelebrityReportUploader = ({ onUploadSuccess }: { onUploadSuccess: () => Promise<void> }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUploadReport = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please login to upload reports",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Example data with correct metrics
      const reportData = {
        celebrity_name: "Cristina Pedroche",
        username: "cristipedroche",
        platform: "Instagram",
        user_id: session.user.id,
        report_data: {
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
          },
          growth_trends: [
            {"date": "2024-01-01", "followers": 3066019},
            {"date": "2024-02-01", "followers": 3066019},
            {"date": "2024-03-01", "followers": 3066019}
          ]
        },
        report_date: new Date().toISOString().split('T')[0]
      };

      // Delete existing reports first
      await supabase
        .from('celebrity_reports')
        .delete()
        .not('id', 'is', null);

      // Insert new report with correct data
      const { data, error } = await supabase
        .from('celebrity_reports')
        .insert([reportData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report uploaded successfully!",
      });

      await onUploadSuccess();
    } catch (error) {
      console.error('Error uploading report:', error);
      toast({
        title: "Error",
        description: "Failed to upload report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleUploadReport} 
      className="flex items-center gap-2 bg-primary hover:bg-primary/90 transition-all"
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Upload className="h-4 w-4" />
      )}
      Upload Report
    </Button>
  );
};
