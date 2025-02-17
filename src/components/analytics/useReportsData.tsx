
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface CelebrityReport {
  id: string;
  celebrity_name: string;
  username: string;
  platform: string;
  report_data: any;
  report_date: string;
}

export const useReportsData = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<CelebrityReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CelebrityReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log('Fetching reports...');

      const staticReports = [
        {
          id: "1",
          celebrity_name: "Cristina Pedroche",
          username: "cristipedroche",
          platform: "Instagram",
          report_date: "2024-02-17",
          report_data: {
            followers: {
              total: 3100000
            },
            following: {
              total: 575
            },
            media_uploads: {
              total: 4310
            },
            engagement: {
              rate: "1.71",
              average_likes: 52400,
              average_comments: 605.13,
              average_shares: 386
            },
            posting_insights: {
              peak_engagement_times: ["12:00 AM ET Wednesdays", "10:00 AM", "7:00 PM"],
              posting_tips: [
                "Best time for branded posts is 12:00 AM ET on Wednesdays",
                "Content performs best during midday and evening hours",
                "Engagement is highest with lifestyle and personal content",
                "Strong performance in Spain market",
                "High engagement rate of 1.71% indicates strong audience connection"
              ]
            }
          }
        },
        {
          id: "2",
          celebrity_name: "Cristina Pedroche",
          username: "cristipedroche",
          platform: "TikTok",
          report_date: "2024-02-17",
          report_data: {
            followers: {
              total: 850000
            },
            following: {
              total: 125
            },
            media_uploads: {
              total: 892
            },
            engagement: {
              rate: "2.85",
              average_likes: 24200,
              average_comments: 312,
              average_shares: 945
            },
            posting_insights: {
              peak_engagement_times: ["3:00 PM", "8:00 PM", "10:00 PM"],
              posting_tips: [
                "Short-form video content performs best",
                "Dance and lifestyle content gets highest engagement",
                "Trending audio usage increases reach",
                "Strong Spanish market presence"
              ]
            }
          }
        },
        {
          id: "3",
          celebrity_name: "Jaime Lorente Lopez",
          username: "jaimelorentelo",
          platform: "Instagram",
          report_date: "2024-02-17",
          report_data: {
            followers: {
              total: 11500000
            },
            following: {
              total: 336
            },
            media_uploads: {
              total: 1100
            },
            engagement: {
              rate: "0.41",
              average_likes: 47200,
              average_comments: 215,
              average_shares: 156
            },
            posting_insights: {
              peak_engagement_times: ["2:00 PM", "6:00 PM", "9:00 PM"],
              posting_tips: [
                "Strong engagement from Brazil and Spain markets",
                "Content performs best during evening hours",
                "High engagement with lifestyle and acting-related content",
                "Opportunity to increase engagement with Netflix-related content",
                "Consider targeting the significant 20-34 age demographic"
              ]
            }
          }
        },
        {
          id: "4",
          celebrity_name: "Jaime Lorente Lopez",
          username: "jaimelorentelo",
          platform: "TikTok",
          report_date: "2024-02-17",
          report_data: {
            followers: {
              total: 1100000
            },
            following: {
              total: 89
            },
            media_uploads: {
              total: 336
            },
            engagement: {
              rate: "0.0",
              average_likes: 0,
              average_comments: 0,
              average_shares: 0
            },
            posting_insights: {
              peak_engagement_times: ["3:00 PM", "7:00 PM", "10:00 PM"],
              posting_tips: [
                "Opportunity to increase TikTok presence",
                "Consider creating short-form video content",
                "Leverage existing Instagram audience",
                "Focus on behind-the-scenes content",
                "Engage with trending challenges and sounds"
              ]
            }
          }
        }
      ];

      if (staticReports.length === 0) {
        console.log('No reports found');
        setReports([]);
        setSelectedReport(null);
        toast({
          title: "No Reports",
          description: "No celebrity reports found.",
          variant: "default",
        });
        return;
      }

      console.log('Fetched data:', staticReports);
      setReports(staticReports);
      
      if (!selectedReport || !staticReports.find(r => r.id === selectedReport.id)) {
        setSelectedReport(staticReports[0]);
      }

    } catch (error) {
      console.error('Error in fetchReports:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    selectedReport,
    setSelectedReport,
    fetchReports,
    loading,
  };
};
