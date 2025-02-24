
import React from "react";
import { Gift } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CelebrityReport } from "@/types/reports";

interface SponsorOpportunitiesProps {
  selectedReport: CelebrityReport;
}

export const SponsorOpportunities: React.FC<SponsorOpportunitiesProps> = ({ selectedReport }) => {
  const highlightKeyPhrases = (text: string) => {
    // Custom replacement patterns for specific phrases
    const patterns = [
      {
        pattern: /(connect with other athletic brands)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /(high engagement rates among young professionals)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /(potential for luxury brand collaborations)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /(strong alignment with sustainable brands)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /(authentic storytelling opportunities)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /(audience resonates well with lifestyle content)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /(ideal for long-term brand partnerships)/i,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /(significant influence in the fashion sector)/i,
        replacement: '<strong>$1</strong>'
      }
    ];

    let result = text;
    patterns.forEach(({ pattern, replacement }) => {
      result = result.replace(pattern, replacement);
    });

    // For any sentences that didn't match specific patterns,
    // highlight key metrics and important phrases
    if (!result.includes('<strong>')) {
      result = result.replace(
        /(impressive ROI|growing audience|strong conversion rates|high performance metrics|increasing engagement|consistent growth|successful campaigns)/gi,
        '<strong>$1</strong>'
      );
    }

    return result;
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
