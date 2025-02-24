
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
      // Metrics and numbers
      { pattern: /(\d+(?:\.\d+)?%(?:\s*increase)?)/g, replacement: '<strong>$1</strong>' },
      // Performance indicators
      { pattern: /(high|strong|excellent|outstanding) (engagement|performance|conversion|resonance)/gi, replacement: '<strong>$1 $2</strong>' },
      // Opportunity phrases
      { pattern: /(perfect match|ideal opportunity|proven success|strategic partnership)/gi, replacement: '<strong>$1</strong>' },
      // Market and audience
      { pattern: /(target audience|key demographic|market segment|niche market)/gi, replacement: '<strong>$1</strong>' },
      // Growth and improvement
      { pattern: /(significant|substantial|notable) (growth|increase|improvement|impact)/gi, replacement: '<strong>$1 $2</strong>' },
      // Success metrics
      { pattern: /(conversion rates|engagement metrics|ROI|brand awareness)/gi, replacement: '<strong>$1</strong>' },
      // Brand alignment
      { pattern: /(brand alignment|authentic connection|natural fit)/gi, replacement: '<strong>$1</strong>' },
      // Value propositions
      { pattern: /(valuable|effective|successful) (partnership|collaboration|promotion)/gi, replacement: '<strong>$1 $2</strong>' }
    ];

    let highlightedText = text;
    patterns.forEach(({ pattern, replacement }) => {
      highlightedText = highlightedText.replace(pattern, replacement);
    });

    // If no highlights were added, highlight the first important phrase
    if (!highlightedText.includes('<strong>')) {
      const fallbackPatterns = [
        /(opportunity|potential|advantage|benefit)/gi,
        /(brand|product|service|campaign)/gi,
        /(recommend|suggest|indicate|demonstrate)/gi,
        /(successfully|effectively|significantly)/gi
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
