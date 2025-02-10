
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [reports, setReports] = useState<CelebrityReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CelebrityReport | null>(null);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please login to access analytics",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
  };

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('celebrity_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch celebrity reports",
        variant: "destructive",
      });
      return;
    }

    setReports(data || []);
    if (data && data.length > 0 && !selectedReport) {
      setSelectedReport(data[0]);
    }
  };

  useEffect(() => {
    checkUser();
    fetchReports();
  }, []);

  return {
    reports,
    selectedReport,
    setSelectedReport,
    fetchReports,
  };
};
