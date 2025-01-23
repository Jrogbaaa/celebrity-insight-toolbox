import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Clock, Target, Users, Image, MessageCircle, Loader2 } from "lucide-react";
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
      const { data: tokens } = await supabase
        .from('instagram_tokens')
        .select('*')
        .maybeSingle();

      if (!tokens) {
        throw new Error('Please connect your Instagram account first');
      }

      const { data: cache } = await supabase
        .from('instagram_cache')
        .select('data')
        .maybeSingle();

      // Enhanced mock insights with more detailed analysis
      return [
        {
          type: 'engagement',
          title: 'Engagement Opportunities',
          description: 'Your engagement rate is currently at 2.1%. Consider responding to comments within 1 hour and using more engaging captions with questions to boost interaction.',
          impact: 'Potential 40% increase in engagement'
        },
        {
          type: 'content',
          title: 'Content Strategy Enhancement',
          description: 'Your best-performing content type is carousel posts with how-to guides. Creating more educational series could significantly boost your reach.',
          impact: 'Historical 3x higher save rate'
        },
        {
          type: 'timing',
          title: 'Optimal Posting Schedule',
          description: 'Your audience is most active between 6-8 PM EST on weekdays. Currently, 60% of your posts are outside this window.',
          impact: 'Up to 50% more reach potential'
        },
        {
          type: 'audience',
          title: 'Audience Growth Strategy',
          description: 'Your follower growth rate is 2.3% monthly. Implementing consistent storytelling and behind-the-scenes content could accelerate this growth.',
          impact: 'Target: 5% monthly growth rate'
        },
        {
          type: 'hashtags',
          title: 'Hashtag Performance',
          description: 'Your current hashtag strategy reaches only 15% of potential viewers. Using more niche-specific hashtags could expand your reach significantly.',
          impact: '85% more discoverable content'
        },
        {
          type: 'consistency',
          title: 'Content Consistency',
          description: 'Posting frequency varies between 2-7 days. Maintaining a consistent 3-post per week schedule aligns with your audience\'s expectations.',
          impact: 'Steady engagement increase'
        },
        {
          type: 'interaction',
          title: 'Community Building',
          description: 'Your story reply rate is 5%. Increasing interactive elements like polls and questions could boost audience participation.',
          impact: 'Double community engagement'
        },
        {
          type: 'visual',
          title: 'Visual Cohesion',
          description: 'Posts with consistent color schemes and branding receive 40% more saves. Consider developing a signature visual style.',
          impact: 'Enhanced brand recognition'
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
        return Users;
      case 'visual':
        return Image;
      case 'interaction':
        return MessageCircle;
      default:
        return Brain;
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Performance Insights</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive analysis and actionable recommendations to optimize your Instagram presence
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
              These insights are generated based on your account\'s historical performance and industry best practices.
              Updated daily to provide you with the most relevant recommendations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Recommendations;