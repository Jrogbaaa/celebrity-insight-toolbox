
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
        return data.map(item => ({
          id: item.id,
          celebrity_name: item.celebrity_name,
          username: item.username,
          platform: item.platform,
          report_data: item.report_data as CelebrityReport['report_data'],
          report_date: item.report_date
        }));
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
