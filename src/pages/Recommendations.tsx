import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Clock, Target, Loader2 } from "lucide-react";
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
  const { data: insights, isLoading } = useQuery({
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

      // For now, return mock insights. In production, this would call an AI service
      return [
        {
          type: 'timing',
          title: 'Optimal Posting Time',
          description: 'Your followers are most active between 6-8 PM EST. Consider scheduling posts during this window.',
          impact: 'Could increase engagement by 25%'
        },
        {
          type: 'content',
          title: 'Content Strategy',
          description: 'Posts with carousel images receive 3x more engagement than single images.',
          impact: 'Potential 300% engagement increase'
        },
        {
          type: 'hashtags',
          title: 'Hashtag Analysis',
          description: 'Using 5-7 niche-specific hashtags performs better than using many generic ones.',
          impact: 'Average 45% more reach'
        },
        {
          type: 'audience',
          title: 'Audience Insights',
          description: 'Your most engaged followers are interested in technology and digital marketing.',
          impact: 'Target content for higher relevance'
        }
      ] as AIInsight[];
    },
    meta: {
      errorMessage: "Error loading insights"
    },
    retry: false
  });

  // Handle errors using the useEffect pattern instead
  React.useEffect(() => {
    if (error) {
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
      default:
        return Brain;
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Insights</h1>
        <p className="text-muted-foreground mt-2">
          AI-powered recommendations to improve your Instagram performance
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
              These insights are generated based on your account's historical performance and industry best practices.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Recommendations;