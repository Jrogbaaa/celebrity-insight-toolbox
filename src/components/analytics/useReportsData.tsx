
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
              ],
              demographic_data: {
                top_locations: ["Madrid, ES", "Spain", "Venezuela", "Brazil", "Mexico", "Colombia", "United States"],
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
              }
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
