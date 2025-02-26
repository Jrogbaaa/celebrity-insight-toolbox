
import { supabase } from "@/integrations/supabase/client";
import type { ReportData } from "@/types/report";
import { v4 as uuidv4 } from 'uuid';

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

export const extractCelebrityNameFromPdf = async (file: File): Promise<string> => {
  try {
    // For a real implementation, this would send the PDF to a service that extracts text
    // Since we can't actually read the PDF content in the browser directly, 
    // we'll extract a name from the filename or use default values
    
    // Remove extension and special characters from filename
    let name = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9\s]/g, " ");
    
    // If the filename is not suitable for a name, use a default
    if (!name || name.length < 3) {
      name = `Celebrity ${Math.floor(Math.random() * 1000)}`;
    }
    
    // Properly format the name (capitalize first letter of each word)
    return name.split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  } catch (error) {
    console.error("Error extracting celebrity name from PDF:", error);
    return `Celebrity ${Math.floor(Math.random() * 1000)}`;
  }
};

export const generateUsername = (celebrityName: string): string => {
  return celebrityName
    .toLowerCase()
    .replace(/\s+/g, '') // Remove spaces
    .replace(/[^\w\s]/gi, ''); // Remove special characters
};

export const createReportData = async (file: File, publicUrl: string): Promise<ReportData> => {
  const celebrityName = await extractCelebrityNameFromPdf(file);
  const username = generateUsername(celebrityName);
  
  // Generate random but realistic data
  const followers = Math.floor(Math.random() * 5000000) + 500000;
  const following = Math.floor(Math.random() * 1000) + 200;
  const uploads = Math.floor(Math.random() * 5000) + 1000;
  const engagementRate = (Math.random() * 3 + 1).toFixed(2);
  const avgLikes = Math.floor(followers * (parseFloat(engagementRate) / 100));
  const avgComments = Math.floor(avgLikes * 0.02);
  
  return {
    celebrity_name: celebrityName,
    username: username,
    platform: "Instagram",
    report_data: {
      pdf_url: publicUrl,
      followers: {
        total: followers
      },
      following: {
        total: following
      },
      media_uploads: {
        total: uploads
      },
      engagement: {
        rate: engagementRate,
        average_likes: avgLikes,
        average_comments: avgComments,
        average_shares: Math.floor(avgLikes * 0.01)
      },
      posting_insights: {
        peak_engagement_times: ["12:00 PM ET", "5:00 PM ET", "8:00 PM ET"],
        posting_tips: [
          `Best time for branded posts is 5:00 PM ET`,
          `Content performs best during afternoon and evening hours`,
          `Engagement is highest with lifestyle and personal content`,
          `Strong performance in local market`,
          `Engagement rate of ${engagementRate}% indicates good audience connection`
        ],
        demographic_data: {
          top_locations: ["Madrid, ES", "Barcelona, ES", "New York, US", "London, UK", "Mexico City, MX"],
          gender_split: {
            female: 55 + Math.floor(Math.random() * 10),
            male: 45 - Math.floor(Math.random() * 10)
          },
          age_ranges: {
            "18-24": 20 + Math.floor(Math.random() * 10),
            "25-34": 35 + Math.floor(Math.random() * 10),
            "35-44": 25 + Math.floor(Math.random() * 10),
            "45-54": 15 + Math.floor(Math.random() * 5),
            "55+": 5 + Math.floor(Math.random() * 5)
          }
        },
        sponsored_content: {
          recent_brands: [
            "Fashion Brand",
            "Beauty Products",
            "Fitness Company",
            "Food & Beverage",
            "Luxury Goods",
            "Travel Agency",
            "Streaming Service",
            "Mobile App"
          ]
        }
      },
      demographics: {
        age_groups: {
          "18-24": `${20 + Math.floor(Math.random() * 10)}%`,
          "25-34": `${35 + Math.floor(Math.random() * 10)}%`,
          "35-44": `${25 + Math.floor(Math.random() * 10)}%`,
          "45-54": `${15 + Math.floor(Math.random() * 5)}%`,
          "55+": `${5 + Math.floor(Math.random() * 5)}%`
        },
        gender: {
          "Female": `${55 + Math.floor(Math.random() * 10)}%`,
          "Male": `${45 - Math.floor(Math.random() * 10)}%`
        },
        top_locations: ["Madrid, ES", "Barcelona, ES", "New York, US", "London, UK", "Mexico City, MX"]
      },
      sponsor_opportunities: [
        "Fashion Collaborations",
        "Beauty Product Endorsements",
        "Fitness Partnerships",
        "Lifestyle Brand Ambassadorships",
        "Travel Sponsorships",
        "Food & Beverage Promotions"
      ]
    },
    report_date: new Date().toISOString().split('T')[0]
  };
};

export const saveReportToDatabase = async (reportData: ReportData) => {
  const { error } = await supabase
    .from('celebrity_reports')
    .insert([reportData]);

  if (error) throw error;
};
