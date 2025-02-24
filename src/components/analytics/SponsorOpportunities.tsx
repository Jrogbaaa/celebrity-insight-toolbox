
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
        pattern: /(connect with other athletic brands)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /(perfect target audience for luxury fashion brands)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /(demonstrated success with beauty product promotions)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /(proven track record in fitness equipment collaborations)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /(high conversion rates with wellness products)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /(strong resonance with sustainable fashion initiatives)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /(excellent engagement metrics for lifestyle products)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /(highly successful at promoting premium accessories)/i,
        replacement: '<strong>$1</strong>'
      }
    ];

    let result = text;
    for (const { pattern, replacement } of patterns) {
      if (pattern.test(text)) {
        return text.replace(pattern, replacement);
      }
    }

    // If no specific pattern matched, try to highlight the most meaningful part
    const fallbackPatterns = [
      /([^.]*(?:partnership|collaboration|promotion|campaign)[^.]*shows? (?:strong|high|excellent|impressive) (?:results|performance|engagement|ROI))/i,
      /([^.]*(?:ideal|perfect|excellent) (?:opportunity|chance|potential) for [^.]*)/i,
      /([^.]*(?:proven|demonstrated|established) (?:success|results|performance) [^.]*)/i
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
                <strong>{selectedReport.report_data.brand_mentions.join(", ")}</strong>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
