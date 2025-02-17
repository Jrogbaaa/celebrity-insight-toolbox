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
            demographics: {
              age_groups: {
                "13-17": "0.35",
                "18-24": "9.22",
                "25-34": "28.99",
                "35-44": "20.34",
                "45-54": "7.19",
                "55+": "4.26"
              },
              gender: {
                "Female": "54.27",
                "Male": "45.73"
              },
              top_locations: ["Spain", "Mexico", "Colombia", "Argentina"]
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
            },
            sponsor_opportunities: [
              "High affinity with fashion and lifestyle brands",
              "Strong engagement with beauty and wellness content",
              "Potential for luxury brand collaborations",
              "Growing audience in fitness and health segments"
            ],
            brand_mentions: [
              "Zara", "L'Oréal", "Nike", "Maybelline", "Sephora"
            ]
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
              total: 1500000
            },
            following: {
              total: 125
            },
            media_uploads: {
              total: 892
            },
            engagement: {
              rate: "11.60",
              average_likes: 174100,
              average_comments: 892,
              average_shares: 1245
            },
            demographics: {
              age_groups: {
                "13-17": "12.35",
                "18-24": "32.45",
                "25-34": "28.99",
                "35-44": "15.34",
                "45-54": "6.19",
                "55+": "4.68"
              },
              gender: {
                "Female": "58.27",
                "Male": "41.73"
              },
              top_locations: ["Spain", "Mexico", "Argentina", "Colombia"]
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
                "Best time for sponsored posts is 7:00 AM",
                "Strong engagement from Brazil and Spain markets",
                "Content performs best during evening hours",
                "High engagement with lifestyle and acting-related content",
                "Opportunity to increase engagement with Netflix-related content",
                "Consider targeting the significant 20-34 age demographic"
              ]
            },
            sponsor_opportunities: [
              "Strong potential for Netflix and streaming platform collaborations",
              "High engagement with fashion and lifestyle brands",
              "Opportunity for partnerships with Spanish luxury brands",
              "Growing audience in entertainment and media segments"
            ],
            brand_mentions: [
              "Netflix", "Gucci", "Adidas", "Ray-Ban", "Cartier"
            ]
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
        },
        {
          id: "5",
          celebrity_name: "Jorge Cremades",
          username: "jorgecremades",
          platform: "Instagram",
          report_date: "2024-02-17",
          report_data: {
            followers: {
              total: 2900000
            },
            following: {
              total: 892
            },
            media_uploads: {
              total: 2455
            },
            engagement: {
              rate: "1.73",
              average_likes: 49400,
              average_comments: 587
            },
            posting_insights: {
              peak_engagement_times: ["11:00 AM", "3:00 PM", "8:00 PM"],
              posting_tips: [
                "Content performs best during afternoon hours",
                "Comedy and lifestyle content drives highest engagement",
                "Strong engagement from Spanish-speaking markets",
                "Consider collaborations with sports brands",
                "Engagement peaks with video content"
              ]
            },
            sponsor_opportunities: [
              "Strong affinity with sports and athletic brands",
              "High engagement with Nike and Adidas content",
              "Potential for partnerships with Marvel and NASA",
              "Growing audience in lifestyle and fashion segments"
            ],
            brand_mentions: [
              "El Corte Inglés", "Jimmy Choo", "Lidl", "Red Bull", "Ted Baker"
            ]
          }
        },
        {
          id: "6",
          celebrity_name: "Jorge Cremades",
          username: "jorgecremades",
          platform: "TikTok",
          report_date: "2024-02-17",
          report_data: {
            followers: {
              total: 1900000
            },
            following: {
              total: 245
            },
            media_uploads: {
              total: 587
            },
            engagement: {
              rate: "3.18",
              average_likes: 60300,
              average_comments: 892
            },
            posting_insights: {
              peak_engagement_times: ["2:00 PM", "6:00 PM", "9:00 PM"],
              posting_tips: [
                "Short-form comedy content performs exceptionally well",
                "Trending sounds increase reach significantly",
                "Strong engagement with Spanish language content",
                "Consider cross-platform content strategy",
                "Engagement peaks with reaction-style videos"
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
