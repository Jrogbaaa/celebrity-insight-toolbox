
interface UpdateReminderProps {
  selectedReport: any;
}

export const UpdateReminder = ({ selectedReport }: UpdateReminderProps) => {
  const getNextUpdateDate = () => {
    if (!selectedReport?.report_date) return null;
    const reportDate = new Date(selectedReport.report_date);
    const nextUpdate = new Date(reportDate);
    nextUpdate.setMonth(nextUpdate.getMonth() + 2);
    return nextUpdate.toLocaleDateString();
  };

  return (
    <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground border border-border/50">
      {selectedReport ? (
        <p className="flex items-center gap-2">
          <span>📅</span>
          Next report update recommended by {getNextUpdateDate()} to maintain data accuracy.
        </p>
      ) : (
        <p className="flex items-center gap-2">
          <span>👋</span>
          Select a report from the dropdown or upload a new one to view analytics.
        </p>
      )}
    </div>
  );
};
