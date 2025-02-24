
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
        pattern: /(highest engagement during midday hours)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /(optimal posting time is early evening)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /(weekday mornings show better performance)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /(stories perform best during commute times)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /(weekend content reaches wider audience)/i,
        replacement: '<strong>$1</strong>'
      }
    ];

    let result = text;
    patterns.forEach(({ pattern, replacement }) => {
      result = result.replace(pattern, replacement);
    });

    // For any tips that didn't match specific patterns,
    // highlight the key timing or engagement insights
    if (!result.includes('<strong>')) {
      result = result.replace(
        /(best engagement window|peak activity hours|optimal posting schedule|highest reach times|key posting periods)/gi,
        '<strong>$1</strong>'
      );
    }

    return result;
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
                Highest engagement occurs at <strong>{peak_engagement_times.join("</strong> and <strong>")}</strong>
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
