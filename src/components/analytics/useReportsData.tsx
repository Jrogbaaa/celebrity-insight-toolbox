
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CelebrityReport } from "@/types/reports";
import { ReportsService } from "@/services/ReportsService";
import { useQuery } from "@tanstack/react-query";

// Function to fetch data from Social Blade API
const fetchSocialBladeData = async (username: string, platform: string) => {
  try {
    console.log(`Fetching Social Blade data for ${username} on ${platform}...`);
    
    const response = await fetch(`https://supabase.functions.lovable.dev/ygweyscocelwjcqinkth/social-blade-stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        platform: platform.toLowerCase()
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Social Blade data: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Social Blade data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching Social Blade data:', error);
    throw error;
  }
};

export const useReportsData = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<CelebrityReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CelebrityReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log('Fetching reports...');

      const fetchedReports = await ReportsService.fetchReports();

      if (!ReportsService.validateReports(fetchedReports)) {
        console.log('No reports found');
        setReports([]);
        setSelectedReport(null);
        toast({
          title: "No Reports",
          description: "No celebrity reports found.",
          variant: "default",
        });
        return;
      }

      console.log('Fetched data:', fetchedReports);
      setReports(fetchedReports);
      
      if (!selectedReport || !fetchedReports.find(r => r.id === selectedReport.id)) {
        setSelectedReport(fetchedReports[0]);
      }

    } catch (error) {
      console.error('Error in fetchReports:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Get Social Blade data using React Query when a report is selected
  const { data: socialBladeData, isLoading: isSocialBladeLoading, error: socialBladeError } = useQuery({
    queryKey: ['socialBlade', selectedReport?.username, selectedReport?.platform],
    queryFn: () => selectedReport ? fetchSocialBladeData(selectedReport.username, selectedReport.platform) : null,
    enabled: !!selectedReport,
    staleTime: 1000 * 60 * 15, // 15 minutes
    meta: {
      onError: (error: Error) => {
        console.error('Social Blade query error:', error);
        toast({
          title: "Social Blade Data Error",
          description: error.message || "Failed to fetch Social Blade data",
          variant: "destructive",
        });
      }
    }
  });

  // Merge Social Blade data with the selected report data
  const enrichedSelectedReport = selectedReport && socialBladeData ? {
    ...selectedReport,
    social_blade_data: socialBladeData
  } : selectedReport;

  return {
    reports,
    selectedReport: enrichedSelectedReport,
    setSelectedReport,
    fetchReports,
    loading: loading || isSocialBladeLoading,
    socialBladeLoading: isSocialBladeLoading,
    socialBladeError
  };
};
