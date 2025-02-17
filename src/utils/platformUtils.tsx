
import { Instagram, Youtube, Music2, Facebook } from "lucide-react";
import React from 'react';
import type { LucideIcon } from 'lucide-react';

export const getPlatformIcon = (platform: string): React.ReactNode => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return <Instagram className="h-4 w-4" />;
    case 'youtube':
      return <Youtube className="h-4 w-4" />;
    case 'tiktok':
      return <Music2 className="h-4 w-4" />;
    case 'facebook':
      return <Facebook className="h-4 w-4" />;
    default:
      return null;
  }
};

interface PlatformMetrics {
  followers: number;
  engagementRate: number;
  commentsPerPost: number;
  sharesPerPost: number;
  mediaUploads: number;
  following: number;
  averageLikes: number;
}

export const getMetricsForReport = (report: any): PlatformMetrics | null => {
  if (!report?.report_data) return null;

  const reportData = report.report_data;
  console.log('Processing report data for platform:', report.platform, reportData);

  const platformMetrics = {
    facebook: {
      followers: reportData.page_likes?.total || reportData.followers?.total,
      engagementRate: parseFloat(reportData.engagement?.rate || "0"),
      commentsPerPost: reportData.engagement?.average_comments,
      sharesPerPost: reportData.engagement?.average_shares,
      mediaUploads: reportData.posts?.total,
      following: reportData.following?.total,
      averageLikes: reportData.engagement?.average_likes,
    },
    instagram: {
      followers: reportData.followers?.total,
      engagementRate: parseFloat(reportData.engagement?.rate || "0"),
      commentsPerPost: reportData.engagement?.average_comments,
      sharesPerPost: reportData.engagement?.average_shares,
      mediaUploads: reportData.media_uploads?.total,
      following: reportData.following?.total,
      averageLikes: reportData.engagement?.average_likes,
    },
    tiktok: {
      followers: reportData.followers?.total,
      engagementRate: parseFloat(reportData.engagement?.rate || "0"),
      commentsPerPost: reportData.engagement?.average_comments,
      sharesPerPost: reportData.engagement?.average_shares,
      mediaUploads: reportData.videos?.total || reportData.media_uploads?.total,
      following: reportData.following?.total,
      averageLikes: reportData.engagement?.average_likes,
    },
    youtube: {
      followers: reportData.subscribers?.total || reportData.followers?.total,
      engagementRate: parseFloat(reportData.engagement?.rate || "0"),
      commentsPerPost: reportData.engagement?.average_comments,
      sharesPerPost: reportData.engagement?.average_shares,
      mediaUploads: reportData.videos?.total,
      following: reportData.following?.total,
      averageLikes: reportData.engagement?.average_likes,
    }
  };

  const metrics = platformMetrics[report.platform.toLowerCase() as keyof typeof platformMetrics] || {
    followers: 0,
    engagementRate: 0,
    commentsPerPost: 0,
    sharesPerPost: 0,
    mediaUploads: 0,
    following: 0,
    averageLikes: 0,
  };

  return {
    followers: metrics.followers || 0,
    engagementRate: metrics.engagementRate || 0,
    commentsPerPost: metrics.commentsPerPost || 0,
    sharesPerPost: metrics.sharesPerPost || 0,
    mediaUploads: metrics.mediaUploads || 0,
    following: metrics.following || 0,
    averageLikes: metrics.averageLikes || 0,
  };
};
