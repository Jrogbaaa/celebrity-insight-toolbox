
export interface CelebrityReport {
  id: string;
  celebrity_name: string;
  username: string;
  platform: string;
  report_data: {
    followers: {
      total: number;
    };
    following: {
      total: number;
    };
    media_uploads: {
      total: number;
    };
    engagement?: {
      rate: string;
      average_likes: number;
      average_comments: number;
      average_shares?: number;
    };
    demographics?: {
      age_groups: { [key: string]: string };
      gender: { [key: string]: string };
      top_locations: string[];
    };
    posting_insights: {
      peak_engagement_times: string[];
      posting_tips: string[];
    };
    sponsor_opportunities?: string[];
    brand_mentions?: string[];
  };
  report_date: string;
}
