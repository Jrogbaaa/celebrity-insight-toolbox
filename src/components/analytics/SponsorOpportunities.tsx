
import React from "react";
import { Gift } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CelebrityReport } from "@/types/reports";

interface SponsorOpportunitiesProps {
  selectedReport: CelebrityReport;
}

export const SponsorOpportunities: React.FC<SponsorOpportunitiesProps> = ({ selectedReport }) => {
  const highlightKeyPhrases = (text: string) => {
    const patterns = [
      {
        pattern: /((?:strong|high|proven|demonstrated|excellent) (?:potential|engagement|success|resonance|performance|results) (?:with|in|for) [^,.]+)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /((?:perfect|ideal) (?:target audience|opportunity|match) for [^,.]+)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /((?:successful|effective) (?:partnership|collaboration) with [^,.]+)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /((?:high|strong) (?:conversion rates|engagement metrics|performance) [^,.]+)/i,
        replacement: '<strong>$1</strong>'
      }
    ];

    for (const { pattern, replacement } of patterns) {
      if (pattern.test(text)) {
        return text.replace(pattern, replacement);
      }
    }

    // Fallback patterns for more general opportunities
    const fallbackPatterns = [
      /([^.]*(?:opportunity|potential|chance) (?:to|for) [^.]*(?:expand|increase|improve|enhance) [^.]+)/i,
      /([^.]*(?:showing|demonstrating|indicating) (?:strong|high|excellent) [^.]+)/i,
      /([^.]*(?:leverage|utilize|capitalize on) (?:existing|current|strong) [^.]+)/i
    ];

    for (const pattern of fallbackPatterns) {
      if (pattern.test(text)) {
        return text.replace(pattern, '<strong>$1</strong>');
      }
    }

    return text;
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Sponsor Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <ul className="list-disc list-inside space-y-2">
              {selectedReport.report_data.sponsor_opportunities?.map((opportunity: string, index: number) => (
                <li 
                  key={index} 
                  className="text-foreground text-base" 
                  dangerouslySetInnerHTML={{
                    __html: highlightKeyPhrases(opportunity)
                  }} 
                />
              ))}
            </ul>
          </div>
          {selectedReport.report_data.brand_mentions && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Recent Brand Mentions</h3>
              <p className="text-foreground text-base">
                {selectedReport.report_data.brand_mentions.join(", ")}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
