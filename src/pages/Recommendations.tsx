
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Clock, Target, Users, Image, MessageCircle, Sparkles, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useReportsData } from "@/components/analytics/useReportsData";

interface AIInsight {
  type: string;
  title: string;
  description: string;
  impact: string;
}

const generateInsightsFromReport = (reportData: any): AIInsight[] => {
  if (!reportData) return [];

  const insights: AIInsight[] = [];

  // Engagement Rate Insight
  if (reportData.engagement?.rate) {
    const engagementRate = parseFloat(reportData.engagement.rate);
    insights.push({
      type: 'engagement',
      title: 'Engagement Analysis',
      description: `Your current engagement rate is ${engagementRate}%. ${
        engagementRate < 2 
          ? 'Consider increasing interaction with your followers to boost engagement.'
          : 'You have a healthy engagement rate, keep up the good work!'
      }`,
      impact: `Current engagement rate: ${engagementRate}%`
    });
  }

  // Posting Time Insight
  if (reportData.posting_insights?.peak_engagement_times) {
    insights.push({
      type: 'timing',
      title: 'Optimal Posting Schedule',
      description: `Your audience is most active at ${reportData.posting_insights.peak_engagement_times.join(' and ')}. Align your posting schedule with these peak times.`,
      impact: 'Up to 50% more reach with optimal timing'
    });
  }

  // Followers vs Following Ratio
  if (reportData.followers?.total && reportData.following?.total) {
    const ratio = (reportData.followers.total / reportData.following.total).toFixed(2);
    insights.push({
      type: 'audience',
      title: 'Audience Growth Analysis',
      description: `Your followers to following ratio is ${ratio}:1. ${
        parseFloat(ratio) < 10 
          ? 'Consider being more selective with who you follow to maintain influencer status.'
          : 'You have a strong influencer ratio, which helps maintain authority in your niche.'
      }`,
      impact: `Current follower/following ratio: ${ratio}`
    });
  }

  // Content Engagement
  if (reportData.engagement?.average_likes && reportData.engagement?.average_comments) {
    const likesPerComment = (reportData.engagement.average_likes / reportData.engagement.average_comments).toFixed(1);
    insights.push({
      type: 'content',
      title: 'Content Impact Assessment',
      description: `You receive an average of ${likesPerComment} likes per comment. ${
        parseFloat(likesPerComment) < 50 
          ? 'Your content drives good conversation. Focus on creating more engaging captions to maintain this interaction.'
          : 'Your content receives high appreciation. Consider adding more call-to-actions to increase comments.'
      }`,
      impact: `${reportData.engagement.average_likes.toFixed(0)} average likes per post`
    });
  }

  // Media Performance
  if (reportData.media_uploads?.total) {
    insights.push({
      type: 'content-mix',
      title: 'Content Strategy Review',
      description: `With ${reportData.media_uploads.total} total posts, you have established a strong presence. Maintain a consistent posting schedule to keep engagement high.`,
      impact: 'Regular posting can increase follower retention by 40%'
    });
  }

  // Posting Tips
  if (reportData.posting_insights?.posting_tips) {
    insights.push({
      type: 'hashtags',
      title: 'Strategic Recommendations',
      description: reportData.posting_insights.posting_tips.join(' '),
      impact: 'Implementation of these tips can boost engagement by 25%'
    });
  }

  return insights;
};

const Recommendations = () => {
  const { selectedReport } = useReportsData();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['ai-insights', selectedReport?.id],
    queryFn: async () => {
      if (!selectedReport?.report_data) {
        return [];
      }
      return generateInsightsFromReport(selectedReport.report_data);
    },
    enabled: !!selectedReport,
  });

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[80vh]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Analyzing profile data...</span>
        </div>
      </div>
    );
  }

  if (!selectedReport) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Profile Selected</h2>
          <p className="text-muted-foreground">
            Please select a celebrity profile from the Analytics page to view personalized insights.
          </p>
        </div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'timing':
        return Clock;
      case 'content':
        return Brain;
      case 'hashtags':
        return TrendingUp;
      case 'audience':
        return Target;
      case 'engagement':
        return Sparkles;
      case 'content-mix':
        return Image;
      case 'interaction':
        return MessageCircle;
      case 'visual':
        return Users;
      default:
        return Brain;
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Growth Insights & Recommendations</h1>
        <p className="text-muted-foreground mt-2">
          Personalized recommendations for {selectedReport.celebrity_name} ({selectedReport.platform})
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {insights?.map((insight, index) => {
          const Icon = getIcon(insight.type);
          return (
            <Card key={index} className="transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{insight.description}</p>
                <div className="text-sm font-medium text-primary">
                  Impact: {insight.impact}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Brain className="h-5 w-5" />
            <p>
              These insights are generated based on {selectedReport.celebrity_name}'s profile data and industry best practices.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Recommendations;
