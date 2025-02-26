
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
          const report_data = item.report_data || {};
          
          // Make sure all required properties exist
          if (!report_data.followers) report_data.followers = { total: 0 };
          if (!report_data.following) report_data.following = { total: 0 };
          if (!report_data.media_uploads) report_data.media_uploads = { total: 0 };
          if (!report_data.posting_insights) report_data.posting_insights = { 
            peak_engagement_times: [],
            posting_tips: []
          };
          
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
