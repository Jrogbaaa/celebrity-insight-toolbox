
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
          // Safely handle report_data as a record type
          const reportData = item.report_data as Record<string, any>;
          
          // Create a properly structured report data with defaults
          const typedReportData: CelebrityReport['report_data'] = {
            followers: { total: 0 },
            following: { total: 0 },
            media_uploads: { total: 0 },
            posting_insights: {
              peak_engagement_times: [],
              posting_tips: []
            }
          };
          
          // Safely copy data if it exists
          if (reportData && typeof reportData === 'object') {
            // Handle followers
            if (reportData.followers && typeof reportData.followers === 'object') {
              typedReportData.followers = {
                total: typeof reportData.followers.total === 'number' ? reportData.followers.total : 0
              };
            }
            
            // Handle following
            if (reportData.following && typeof reportData.following === 'object') {
              typedReportData.following = {
                total: typeof reportData.following.total === 'number' ? reportData.following.total : 0
              };
            }
            
            // Handle media_uploads
            if (reportData.media_uploads && typeof reportData.media_uploads === 'object') {
              typedReportData.media_uploads = {
                total: typeof reportData.media_uploads.total === 'number' ? reportData.media_uploads.total : 0
              };
            }
            
            // Handle posting_insights
            if (reportData.posting_insights && typeof reportData.posting_insights === 'object') {
              typedReportData.posting_insights = {
                peak_engagement_times: Array.isArray(reportData.posting_insights.peak_engagement_times) 
                  ? reportData.posting_insights.peak_engagement_times 
                  : [],
                posting_tips: Array.isArray(reportData.posting_insights.posting_tips) 
                  ? reportData.posting_insights.posting_tips 
                  : []
              };
            }
            
            // Handle engagement if it exists
            if (reportData.engagement && typeof reportData.engagement === 'object') {
              typedReportData.engagement = {
                rate: String(reportData.engagement.rate || '0'),
                average_likes: Number(reportData.engagement.average_likes || 0),
                average_comments: Number(reportData.engagement.average_comments || 0),
                average_shares: reportData.engagement.average_shares !== undefined 
                  ? Number(reportData.engagement.average_shares) 
                  : undefined
              };
            }
            
            // Handle demographics
            if (reportData.demographics && typeof reportData.demographics === 'object') {
              typedReportData.demographics = {
                age_groups: typeof reportData.demographics.age_groups === 'object' 
                  ? reportData.demographics.age_groups as Record<string, string> 
                  : { "18-24": "25%", "25-34": "40%", "35-44": "20%", "45-54": "10%", "55+": "5%" },
                gender: typeof reportData.demographics.gender === 'object' 
                  ? reportData.demographics.gender as Record<string, string> 
                  : { "Female": "55%", "Male": "45%" },
                top_locations: Array.isArray(reportData.demographics.top_locations) 
                  ? reportData.demographics.top_locations 
                  : ["Madrid, ES", "Barcelona, ES", "New York, US"]
              };
            } else {
              // Default demographics
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
            
            // Handle sponsor_opportunities if it exists
            if (reportData.sponsor_opportunities && Array.isArray(reportData.sponsor_opportunities)) {
              typedReportData.sponsor_opportunities = reportData.sponsor_opportunities;
            }
            
            // Handle brand_mentions if it exists
            if (reportData.brand_mentions && Array.isArray(reportData.brand_mentions)) {
              typedReportData.brand_mentions = reportData.brand_mentions;
            }
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
