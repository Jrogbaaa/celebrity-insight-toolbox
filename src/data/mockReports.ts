
import { CelebrityReport } from "@/types/reports";

export const mockReports: CelebrityReport[] = [
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
          "Existing partnerships with Desigual and Puma show strong athletic wear engagement",
          "Netflix collaborations indicate potential for entertainment partnerships",
          "High engagement with Zalando suggests strong e-commerce potential"
        ]
      },
      sponsor_opportunities: [
        "Expand luxury fashion partnerships beyond current Bulgari relationship",
        "Leverage existing Puma partnership to connect with other athletic brands like Dr. Martens",
        "Strong potential for expanding beauty collaborations given Pronovias engagement",
        "Consider partnerships with premium fashion brands like Dsquared2 based on audience overlap",
        "Opportunity to expand streaming partnerships beyond Netflix with other platforms",
        "High engagement with Zara suggests potential for other fast fashion collaborations"
      ],
      brand_mentions: [
        "Desigual", "Netflix", "Puma", "Tezenis", "Universal Pictures", "Vital Proteins", "Zalando"
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
      demographics: {
        age_groups: {
          "<16": "0.58",
          "17-19": "1.08",
          "20-24": "22.08",
          "25-29": "21.43",
          "30-34": "21.84",
          "35-39": "17.74",
          "40-49": "5.5",
          "50-59": "3.23",
          "60+": "6.53"
        },
        gender: {
          "Female": "70.93",
          "Male": "29.07"
        },
        top_locations: ["Brazil", "Italy", "Mexico", "France", "Spain", "Poland"]
      },
      posting_insights: {
        peak_engagement_times: ["2:00 PM", "6:00 PM", "9:00 PM"],
        posting_tips: [
          "Leverage existing Armani partnerships for luxury content",
          "Strong engagement from Netflix content suggests more streaming opportunities",
          "Maserati partnership shows potential for luxury automotive content",
          "Boss collaborations indicate strong fashion influence",
          "Consider cross-platform content with YouTube given mention patterns"
        ]
      },
      sponsor_opportunities: [
        "Expand luxury fashion presence through Armani Beauty line",
        "Potential for high-end automotive partnerships beyond Maserati",
        "Opportunity for premium eyewear collaborations with Oakley",
        "Leverage Netflix presence for other streaming platform partnerships",
        "Consider partnerships with GQ given existing fashion brand portfolio",
        "Explore collaborations with Dsquared2 based on audience demographics"
      ],
      brand_mentions: [
        "Armani", "Armani Beauty", "Boss", "Hugo Boss", "Maserati", "Netflix", "Oakley", "Universal Pictures"
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
      demographics: {
        age_groups: {
          "<16": "2.58",
          "17-19": "15.08",
          "20-24": "25.08",
          "25-29": "20.43",
          "30-34": "15.84",
          "35-39": "10.74",
          "40-49": "5.5",
          "50-59": "2.23",
          "60+": "2.53"
        },
        gender: {
          "Female": "75.93",
          "Male": "24.07"
        },
        top_locations: ["Spain", "Mexico", "Brazil", "Argentina", "Colombia"]
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
      demographics: {
        age_groups: {
          "<16": "0.01",
          "17-19": "0.92",
          "20-24": "12.4",
          "25-29": "27.07",
          "30-34": "27.85",
          "35-39": "14.76",
          "40-49": "5.33",
          "50-59": "4.23",
          "60+": "7.44"
        },
        gender: {
          "Female": "37.29",
          "Male": "62.71"
        },
        top_locations: ["Spain", "Mexico", "Colombia", "Argentina"]
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
      demographics: {
        age_groups: {
          "<16": "5.01",
          "17-19": "15.92",
          "20-24": "22.4",
          "25-29": "20.07",
          "30-34": "17.85",
          "35-39": "9.76",
          "40-49": "5.33",
          "50-59": "2.23",
          "60+": "1.44"
        },
        gender: {
          "Female": "42.29",
          "Male": "57.71"
        },
        top_locations: ["Spain", "Mexico", "Argentina", "Colombia", "Chile"]
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
