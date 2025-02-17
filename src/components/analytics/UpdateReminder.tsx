
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
    <div className="mt-8 bg-card rounded-lg p-6 shadow-lg border border-border/50">
      {selectedReport ? (
        <>
          <h2 className="text-lg font-semibold mb-2">📅 Report Update Reminder</h2>
          <p className="text-muted-foreground">
            For the most accurate insights, we recommend uploading a new report for {selectedReport.celebrity_name} by {getNextUpdateDate()}. Regular updates help maintain data accuracy and track growth trends effectively.
          </p>
        </>
      ) : (
        <>
          <h2 className="text-lg font-semibold mb-2">👋 Welcome to the Analytics Hub</h2>
          <p className="text-muted-foreground">
            Reports are uploaded through chat for analysis. Select a report from the dropdown to view detailed analytics.
          </p>
        </>
      )}
    </div>
  );
};
