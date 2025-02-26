
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
          // Ensure report_data structure is complete
          const report_data = typeof item.report_data === 'object' ? item.report_data : {};
          
          // Make sure all required properties exist with proper types
          if (!report_data.followers || typeof report_data.followers !== 'object') {
            report_data.followers = { total: 0 };
          }
          
          if (!report_data.following || typeof report_data.following !== 'object') {
            report_data.following = { total: 0 };
          }
          
          if (!report_data.media_uploads || typeof report_data.media_uploads !== 'object') {
            report_data.media_uploads = { total: 0 };
          }
          
          if (!report_data.posting_insights || typeof report_data.posting_insights !== 'object') {
            report_data.posting_insights = { 
              peak_engagement_times: [],
              posting_tips: []
            };
          }
          
          // Add demographics if missing (causing white screen)
          if (!report_data.demographics || typeof report_data.demographics !== 'object') {
            report_data.demographics = {
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
          
          return {
            id: item.id,
            celebrity_name: item.celebrity_name,
            username: item.username,
            platform: item.platform,
            report_data: report_data as CelebrityReport['report_data'],
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
