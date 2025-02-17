
import { supabase } from "@/integrations/supabase/client";
import type { ReportData } from "@/types/report";

export const uploadPdfToStorage = async (file: File, timestamp: number) => {
  const filePath = `pdf_reports/${timestamp}_${file.name.replace(/[^\x00-\x7F]/g, '')}`;
  
  const { data, error } = await supabase.storage
    .from('pdf_reports')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('pdf_reports')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const createReportData = (publicUrl: string): ReportData => {
  return {
    celebrity_name: "Cristina Pedroche",
    username: "cristipedroche",
    platform: "Instagram",
    report_data: {
      pdf_url: publicUrl,
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
        },
        sponsored_content: {
          recent_brands: [
            "H&M",
            "Victoria's Secret",
            "Mr. Wonderful",
            "Zara",
            "adidas",
            "Nike",
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
    report_date: "2025-02-17"
  };
};

export const saveReportToDatabase = async (reportData: ReportData) => {
  const { error } = await supabase
    .from('celebrity_reports')
    .insert([reportData]);

  if (error) throw error;
};
