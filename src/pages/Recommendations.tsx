import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Clock, Target, Users, Image, MessageCircle, Sparkles, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AIInsight {
  type: string;
  title: string;
  description: string;
  impact: string;
}

const Recommendations = () => {
  const { data: insights, isLoading, error } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      // For now, return mock insights that focus on improvement opportunities
      return [
        {
          type: 'engagement',
          title: 'Engagement Opportunities',
          description: 'Your posts receive good initial engagement but drop off after 24 hours. Consider using Instagram Stories and Reels to maintain consistent engagement throughout the week.',
          impact: 'Potential 40% increase in weekly engagement'
        },
        {
          type: 'content',
          title: 'Content Strategy Enhancement',
          description: 'Your most successful posts combine educational content with personal insights. Try creating more "behind-the-scenes" content and sharing industry tips to boost engagement.',
          impact: 'Historical 65% higher engagement on educational content'
        },
        {
          type: 'timing',
          title: 'Optimal Posting Schedule',
          description: 'Your audience is most active between 7-9 AM and 5-7 PM EST. Currently, most of your posts are outside these windows.',
          impact: 'Up to 50% more reach with optimal timing'
        },
        {
          type: 'audience',
          title: 'Audience Growth Strategy',
          description: "Your follower growth has plateaued. Increase collaboration with complementary creators and engage more with your target audience's comments.",
          impact: 'Similar accounts see 2x faster growth with this approach'
        },
        {
          type: 'content-mix',
          title: 'Content Format Distribution',
          description: 'Your feed is currently 80% static posts. Incorporating more Reels and carousel posts could significantly boost engagement.',
          impact: 'Reels typically see 3x more engagement'
        },
        {
          type: 'interaction',
          title: 'Community Engagement',
          description: 'Quick responses to comments within 2 hours can create a more engaged community. Consider dedicating specific times for community interaction.',
          impact: 'Can increase follower retention by 40%'
        },
        {
          type: 'hashtags',
          title: 'Hashtag Strategy',
          description: 'Your current hashtags are too broad. Using a mix of niche-specific hashtags with 10K-500K posts could improve visibility.',
          impact: '75% better reach with optimized hashtags'
        },
        {
          type: 'visual',
          title: 'Visual Consistency',
          description: 'Posts with consistent color schemes and branding receive more saves. Consider developing a signature visual style.',
          impact: 'Branded content sees 30% more saves'
        }
      ] as AIInsight[];
    },
    meta: {
      errorMessage: "Error loading insights"
    },
    retry: false
  });

  useEffect(() => {
    if (error instanceof Error) {
      toast({
        title: "Error loading insights",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[80vh]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Analyzing your Instagram data...</span>
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
          Actionable recommendations to enhance your Instagram presence and engagement
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
              These insights are generated based on industry best practices and successful growth patterns observed across similar accounts.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Recommendations;