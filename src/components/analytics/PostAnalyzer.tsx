
import React from 'react';
import { useContentAnalysis } from '@/hooks/useContentAnalysis';
import { AnalysisDialog } from './AnalysisDialog';
import { LoadingIndicator } from './LoadingIndicator';
import { FileUploadButton } from './FileUploadButton';
import { AnalysisResult } from '@/types/analysis';

interface PostAnalyzerProps {
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export const PostAnalyzer = ({ onAnalysisComplete }: PostAnalyzerProps) => {
  const {
    loading,
    showAnalysis,
    setShowAnalysis,
    analysisResult,
    previewUrl,
    mediaType,
    progressStatus,
    isLargeFile,
    fileInputRef,
    handleFileSelect
  } = useContentAnalysis(onAnalysisComplete);

  return (
    <>
      <AnalysisDialog
        showAnalysis={showAnalysis}
        setShowAnalysis={setShowAnalysis}
        analysisResult={analysisResult}
        previewUrl={previewUrl}
        mediaType={mediaType}
        isLargeFile={isLargeFile}
      />

      <div>
        <LoadingIndicator 
          loading={loading} 
          progressStatus={progressStatus} 
        />
        
        <FileUploadButton 
          loading={loading} 
          fileInputRef={fileInputRef} 
        />

        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          ref={fileInputRef}
        />
      </div>
    </>
  );
};
