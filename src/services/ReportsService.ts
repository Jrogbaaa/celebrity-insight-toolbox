
import { CelebrityReport } from "@/types/reports";
import { mockReports } from "@/data/mockReports";

export class ReportsService {
  static async fetchReports(): Promise<CelebrityReport[]> {
    // In a real application, this would be an API call
    return mockReports;
  }

  static validateReports(reports: CelebrityReport[]): boolean {
    return reports.length > 0;
  }
}
