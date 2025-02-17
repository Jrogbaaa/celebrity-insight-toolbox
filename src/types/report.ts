
export interface ReportData {
  celebrity_name: string;
  username: string;
  platform: string;
  report_data: {
    pdf_url: string;
    followers: {
      total: number;
    };
    following: {
      total: number;
    };
    media_uploads: {
      total: number;
    };
    engagement: {
      rate: string;
      average_likes: number;
      average_comments: number;
      average_shares: number;
    };
    posting_insights: {
      peak_engagement_times: string[];
      posting_tips: string[];
      demographic_data: {
        top_locations: string[];
        gender_split: {
          female: number;
          male: number;
        };
        age_ranges: {
          [key: string]: number;
        };
      };
      sponsored_content: {
        recent_brands: string[];
      };
    };
  };
  report_date: string;
}
