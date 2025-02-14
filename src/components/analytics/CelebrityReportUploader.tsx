
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

      // Validate report data schema before upload
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
          ],
          posting_insights: {
            peak_engagement_times: ["9:00 AM", "6:00 PM"],
            posting_tips: [
              "Share more behind-the-scenes content",
              "Increase video content frequency",
              "Engage with followers' comments regularly"
            ]
          }
        },
        report_date: new Date().toISOString().split('T')[0]
      };

      // Validate required metrics
      const requiredMetrics = [
        'followers.total',
        'following.total',
        'media_uploads.total',
        'engagement.rate',
        'engagement.average_likes',
        'engagement.average_comments'
      ];

      const validateMetrics = (data: any, path: string) => {
        return path.split('.').reduce((obj, key) => obj && obj[key], data) !== undefined;
      };

      const missingMetrics = requiredMetrics.filter(metric => 
        !validateMetrics(reportData.report_data, metric)
      );

      if (missingMetrics.length > 0) {
        throw new Error(`Missing required metrics: ${missingMetrics.join(', ')}`);
      }

      // Insert new report
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
        description: error instanceof Error ? error.message : "Failed to upload report. Please try again.",
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
