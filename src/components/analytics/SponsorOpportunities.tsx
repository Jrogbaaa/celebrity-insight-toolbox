
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
      // Product categories
      { pattern: /(luxury|premium|high-end) (fashion|automotive|eyewear|beauty)/gi, replacement: '<strong>$1 $2</strong>' },
      { pattern: /(fast fashion|athletic wear|streaming|e-commerce)/gi, replacement: '<strong>$1</strong>' },
      
      // Specific product types
      { pattern: /(athletic brands|beauty line|eyewear|automotive)/gi, replacement: '<strong>$1</strong>' },
      
      // Marketing strategies and partnerships
      { pattern: /(brand partnerships|collaborations|cross-promotion|cross-platform)/gi, replacement: '<strong>$1</strong>' },
      { pattern: /(expand|leverage|potential for|opportunity for|strong potential)/gi, replacement: '<strong>$1</strong>' },
      
      // Audience and demographics
      { pattern: /(audience overlap|demographics|market presence|target audience)/gi, replacement: '<strong>$1</strong>' },
      
      // Performance indicators
      { pattern: /(strong|high) (engagement|influence|performance)/gi, replacement: '<strong>$1 $2</strong>' },
      
      // Brand names (don't bold these, they're specific examples)
      
      // Relationship descriptors
      { pattern: /(existing|current|beyond|other) (partnership|relationship|collaboration)/gi, replacement: '<strong>$1 $2</strong>' },
      
      // Content types
      { pattern: /(luxury content|fashion content|streaming content)/gi, replacement: '<strong>$1</strong>' },
      
      // Business growth terms
      { pattern: /(expand|grow|increase|enhance) (presence|portfolio|line)/gi, replacement: '<strong>$1 $2</strong>' }
    ];

    let highlightedText = text;
    patterns.forEach(({ pattern, replacement }) => {
      highlightedText = highlightedText.replace(pattern, replacement);
    });

    // If no highlights were added, try to bold key business terms
    if (!highlightedText.includes('<strong>')) {
      // Additional fallback patterns for business terms
      const fallbackPatterns = [
        // Product categories
        /(fashion|beauty|automotive|eyewear|athletic|streaming|luxury)/gi,
        // Marketing terms
        /(partnership|collaboration|engagement|audience|market|demographic)/gi,
        // Strategy terms
        /(leverage|potential|opportunity|expand|strong|high)/gi
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
