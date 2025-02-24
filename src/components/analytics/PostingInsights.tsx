import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, TrendingUp } from "lucide-react";

interface PostingInsightsProps {
  insights: {
    general_best_times?: {
      monday?: string[];
      tuesday?: string[];
      thursday?: string[];
    };
    peak_engagement_times?: string[];
    posting_tips?: string[];
  };
}

export const PostingInsights = ({ insights }: PostingInsightsProps) => {
  if (!insights) {
    return null;
  }

  const { general_best_times, peak_engagement_times, posting_tips } = insights;

  const highlightKeyPhrases = (text: string) => {
    const patterns = [
      {
        pattern: /((morning posts receive 20% higher engagement)|(afternoons show strongest conversion rates)|(weekday posts outperform weekend content by 35%)|(engagement spikes during lunch hours)|(reels perform best between 7-9 PM)|(consistency in posting times increases overall engagement)|(videos posted before noon get double the views)|(evening audience is most likely to share content))/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /((engagement rates peak at \d+%)|(followers are most active during \w+ hours)|(content receives \d+% more interactions)|(highest engagement window is \d+(?::\d+)? (?:AM|PM)))/i,
        replacement: '<strong>$1</strong>'
      }
    ];

    for (const { pattern, replacement } of patterns) {
      if (pattern.test(text)) {
        return text.replace(pattern, replacement);
      }
    }

    // If no specific pattern matched, try to highlight metrics and timing information
    const fallbackPatterns = [
      /((?:\d+%|\d+ times) (?:higher|better|stronger|more) (?:engagement|performance|interaction))/i,
      /(performs? best (?:during|between|at) [^.]+)/i,
      /(highest engagement occurs? (?:during|between|at) [^.]+)/i
    ];

    for (const pattern of fallbackPatterns) {
      if (pattern.test(text)) {
        return text.replace(pattern, '<strong>$1</strong>');
      }
    }

    return text;
  };

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Posting Time Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {general_best_times && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Best Times to Post
              </h3>
              <div className="space-y-2">
                {general_best_times.monday && (
                  <div className="flex gap-2">
                    <span className="font-bold text-base">Monday:</span>
                    <span className="text-foreground text-base">
                      <strong>{general_best_times.monday.join(", ")}</strong>
                    </span>
                  </div>
                )}
                {general_best_times.tuesday && (
                  <div className="flex gap-2">
                    <span className="font-bold text-base">Tuesday:</span>
                    <span className="text-foreground text-base">
                      <strong>{general_best_times.tuesday.join(", ")}</strong>
                    </span>
                  </div>
                )}
                {general_best_times.thursday && (
                  <div className="flex gap-2">
                    <span className="font-bold text-base">Thursday:</span>
                    <span className="text-foreground text-base">
                      <strong>{general_best_times.thursday.join(", ")}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {peak_engagement_times && peak_engagement_times.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Peak Engagement Times
              </h3>
              <p className="text-foreground text-base">
                Highest engagement occurs at {peak_engagement_times.map((time, index) => (
                  <React.Fragment key={time}>
                    {index > 0 && index === peak_engagement_times.length - 1 ? ' and ' : index > 0 ? ', ' : ''}
                    <strong>{time}</strong>
                  </React.Fragment>
                ))}
              </p>
            </div>
          )}

          {posting_tips && posting_tips.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Tips for Better Engagement</h3>
              <ul className="list-disc list-inside space-y-2">
                {posting_tips.map((tip, index) => (
                  <li 
                    key={index} 
                    className="text-foreground text-base" 
                    dangerouslySetInnerHTML={{
                      __html: highlightKeyPhrases(tip)
                    }} 
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
