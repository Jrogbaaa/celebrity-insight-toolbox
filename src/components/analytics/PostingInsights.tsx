
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
      // Time-related patterns
      { pattern: /(\d{1,2}(?::\d{2})?\s*(?:AM|PM)(?:\s*-\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM))?)/gi, replacement: '<strong>$1</strong>' },
      { pattern: /(early morning|late evening|mid-day|lunch hours?|peak hours?)/gi, replacement: '<strong>$1</strong>' },
      // Day-related patterns
      { pattern: /(weekday|weekend|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/gi, replacement: '<strong>$1</strong>' },
      // Metrics and numbers
      { pattern: /(\d+(?:\.\d+)?%)/g, replacement: '<strong>$1</strong>' },
      { pattern: /(double|triple|quadruple|twice|three times)/gi, replacement: '<strong>$1</strong>' },
      // Performance indicators
      { pattern: /(highest|peak|optimal|maximum|increased|enhanced) (engagement|performance|reach|visibility|interaction)/gi, replacement: '<strong>$1 $2</strong>' },
      { pattern: /(engagement rate|conversion rate|interaction rate|response rate)/gi, replacement: '<strong>$1</strong>' },
      // Audience behavior
      { pattern: /(active|engaged|responsive|attentive) (audience|followers|users)/gi, replacement: '<strong>$1 $2</strong>' },
      // Content types
      { pattern: /(video|reel|story|post|content) (performance|engagement|metrics)/gi, replacement: '<strong>$1 $2</strong>' }
    ];

    let highlightedText = text;
    patterns.forEach(({ pattern, replacement }) => {
      highlightedText = highlightedText.replace(pattern, replacement);
    });

    // If no highlights were added, highlight the first important phrase or metric
    if (!highlightedText.includes('<strong>')) {
      const fallbackPatterns = [
        /(consistently|regularly|frequently|daily|weekly)/gi,
        /(recommended|suggested|optimal|best|ideal)/gi,
        /(engagement|performance|visibility|reach|impact)/gi
      ];

      for (const pattern of fallbackPatterns) {
        if (pattern.test(text)) {
          highlightedText = text.replace(pattern, '<strong>$1</strong>');
          break;
        }
      }
    }

    return highlightedText;
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
