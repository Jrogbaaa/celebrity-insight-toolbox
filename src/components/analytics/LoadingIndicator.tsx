
import React from 'react';
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LoadingIndicatorProps {
  loading: boolean;
  progressStatus: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  loading, 
  progressStatus 
}) => {
  if (!loading) return null;
  
  return (
    <div className="absolute left-0 right-0 top-0 bg-white dark:bg-gray-900 p-2 z-10 rounded-md shadow-md border border-gray-200 dark:border-gray-700 max-w-xs mx-auto mt-16">
      <div className="flex flex-col gap-2 items-center justify-center p-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">{progressStatus}</p>
        <Progress className="h-1 w-full" value={100} />
      </div>
    </div>
  );
};
