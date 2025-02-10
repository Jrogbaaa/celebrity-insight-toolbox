
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

      // Example data for Cristina Pedroche
      const reportData = {
        celebrity_name: "Cristina Pedroche",
        username: "cristipedroche",
        platform: "Instagram",
        user_id: session.user.id,
        report_data: {
          followers: {
            total: 3066164,
            last_30_days: -3660,
            daily_average: -122
          },
          following: {
            total: 577,
            last_30_days: -30,
            daily_average: -1
          },
          media_uploads: {
            total: 4309,
            last_30_days: 30,
            daily_average: 1
          },
          engagement: {
            rate: "1.52%",
            average_likes: 45755.20,
            average_comments: 781.44
          },
          ranks: {
            total_grade: "B+",
            followers_rank: 10770,
            engagement_rank: 340023
          },
          growth_trends: [
            {"date": "2025-01-28", "followers": 3067295, "following": 590, "media": 4301},
            {"date": "2025-02-10", "followers": 3066164, "following": 577, "media": 4309}
          ]
        },
        report_date: new Date().toISOString().split('T')[0]
      };

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
