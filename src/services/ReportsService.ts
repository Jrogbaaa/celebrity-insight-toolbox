
import { CelebrityReport } from "@/types/reports";
import { supabase } from "@/integrations/supabase/client";
import { mockReports } from "@/data/mockReports";

export class ReportsService {
  static async fetchReports(): Promise<CelebrityReport[]> {
    try {
      // Fetch real reports from Supabase
      console.log('Fetching reports from Supabase...');
      const { data, error } = await supabase
        .from('celebrity_reports')
        .select('*')
        .order('celebrity_name', { ascending: true });
      
      if (error) {
        console.error('Error fetching from Supabase:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log('Found reports in Supabase:', data.length);
        // Properly cast the data to CelebrityReport[] type
        return data.map(item => {
          // Create a properly typed report_data object
          let typedReportData: CelebrityReport['report_data'] = {
            followers: { total: 0 },
            following: { total: 0 },
            media_uploads: { total: 0 },
            posting_insights: {
              peak_engagement_times: [],
              posting_tips: []
            }
          };
          
          // Use type assertion to work with the data
          const rawReportData = item.report_data as Record<string, any>;
          
          // Safely populate the typed object
          if (rawReportData.followers && typeof rawReportData.followers === 'object') {
            typedReportData.followers = rawReportData.followers as { total: number };
          }
          
          if (rawReportData.following && typeof rawReportData.following === 'object') {
            typedReportData.following = rawReportData.following as { total: number };
          }
          
          if (rawReportData.media_uploads && typeof rawReportData.media_uploads === 'object') {
            typedReportData.media_uploads = rawReportData.media_uploads as { total: number };
          }
          
          if (rawReportData.posting_insights && typeof rawReportData.posting_insights === 'object') {
            typedReportData.posting_insights = {
              peak_engagement_times: Array.isArray(rawReportData.posting_insights.peak_engagement_times) 
                ? rawReportData.posting_insights.peak_engagement_times 
                : [],
              posting_tips: Array.isArray(rawReportData.posting_insights.posting_tips) 
                ? rawReportData.posting_insights.posting_tips 
                : []
            };
          }
          
          if (rawReportData.engagement && typeof rawReportData.engagement === 'object') {
            typedReportData.engagement = rawReportData.engagement as CelebrityReport['report_data']['engagement'];
          }
          
          // Add demographics if they exist
          if (rawReportData.demographics && typeof rawReportData.demographics === 'object') {
            typedReportData.demographics = rawReportData.demographics as CelebrityReport['report_data']['demographics'];
          } else {
            // Add default demographics if missing
            typedReportData.demographics = {
              age_groups: {
                "18-24": "25%",
                "25-34": "40%",
                "35-44": "20%",
                "45-54": "10%",
                "55+": "5%"
              },
              gender: {
                "Female": "55%",
                "Male": "45%"
              },
              top_locations: ["Madrid, ES", "Barcelona, ES", "New York, US"]
            };
          }
          
          // Add sponsor opportunities if they exist
          if (rawReportData.sponsor_opportunities && Array.isArray(rawReportData.sponsor_opportunities)) {
            typedReportData.sponsor_opportunities = rawReportData.sponsor_opportunities;
          }
          
          // Add brand mentions if they exist
          if (rawReportData.brand_mentions && Array.isArray(rawReportData.brand_mentions)) {
            typedReportData.brand_mentions = rawReportData.brand_mentions;
          }
          
          return {
            id: item.id,
            celebrity_name: item.celebrity_name,
            username: item.username,
            platform: item.platform,
            report_data: typedReportData,
            report_date: item.report_date
          };
        });
      }
      
      // Return empty array instead of mock data
      console.log('No reports found in Supabase, returning empty array');
      return [];
    } catch (error) {
      console.error('Error in fetchReports:', error);
      // Return empty array on error instead of mock data
      console.log('Error occurred, returning empty array');
      return [];
    }
  }

  static validateReports(reports: CelebrityReport[]): boolean {
    return reports.length > 0;
  }
}
