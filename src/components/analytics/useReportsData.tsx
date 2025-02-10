
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CelebrityReport {
  id: string;
  celebrity_name: string;
  username: string;
  platform: string;
  report_data: any;
  report_date: string;
}

export const useReportsData = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<CelebrityReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CelebrityReport | null>(null);

  const fetchReports = async () => {
    console.log('Fetching reports...');
    const { data, error } = await supabase
      .from('celebrity_reports')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Fetched data:', data);
    console.log('Error if any:', error);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch celebrity reports: " + error.message,
        variant: "destructive",
      });
      return;
    }

    if (!data || data.length === 0) {
      toast({
        title: "No Data",
        description: "No celebrity reports found",
        variant: "destructive",
      });
      return;
    }

    setReports(data);
    if (data.length > 0 && !selectedReport) {
      setSelectedReport(data[0]);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    selectedReport,
    setSelectedReport,
    fetchReports,
  };
};
