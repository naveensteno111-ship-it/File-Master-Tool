export type ToolCategory =
  | 'pdf'
  | 'image'
  | 'document'
  | 'excel'
  | 'powerpoint'
  | 'archive'
  | 'compress'
  | 'convert'
  | 'merge'
  | 'all';

export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

export type UserRole = 'user' | 'admin' | 'moderator';

export type SubscriptionPlan = 'free' | 'premium' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: SubscriptionPlan;
  avatarUrl?: string;
  isSuspended: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  usageToday: number;
  dailyLimit: number;
  storageUsedBytes: number;
}

export interface ToolDefinition {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  category: ToolCategory;
  icon: string;
  badge?: string;
  popular?: boolean;
  isClientSide?: boolean;
  requiresBackend?: boolean;
  requiresPremium?: boolean;
  enabled: boolean;
  isFunctional: boolean; // true = working client or server pipeline; false = marked as coming soon
  acceptedFormats: string[];
  maxFiles?: number;
  maxFileSizeMb?: number;
  outputFormat: string;
  metaTitle: string;
  metaDescription: string;
  faqs: { question: string; answer: string }[];
}

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  pageCount?: number;
}

export interface ConversionResult {
  fileName: string;
  blob: Blob;
  downloadUrl: string;
  originalSize: number;
  outputSize: number;
  format: string;
  savingsPercentage?: number;
  pages?: { pageNumber: number; blob: Blob; url: string }[];
}

export interface RecentConversion {
  id: string;
  toolId: string;
  toolName: string;
  originalFileName: string;
  outputFileName: string;
  originalSize: number;
  outputSize: number;
  timestamp: number;
  format: string;
  status: 'Processing' | 'Completed' | 'Failed' | 'Expired';
}

export interface UserFileRecord {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  expiresAt: string;
  status: 'Ready' | 'Expired' | 'Processing';
  downloadUrl?: string;
}

export interface ConversionJob {
  id: string;
  userId: string;
  toolId: string;
  toolName: string;
  inputFileName: string;
  outputFileName?: string;
  fileSize: number;
  status: JobStatus;
  progress: number;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  error?: string;
}

export interface SiteSettings {
  general: {
    siteName: string;
    logoText: string;
    tagline: string;
    contactEmail: string;
  };
  fileLimits: {
    freeMaxFileSizeMb: number;
    premiumMaxFileSizeMb: number;
    temporaryRetentionHours: number;
    allowedMimeCategories: string[];
  };
  userLimits: {
    freeDailyConversions: number;
    premiumDailyConversions: number;
    registrationEnabled: boolean;
    requireEmailVerification: boolean;
  };
  premium: {
    planName: string;
    monthlyPriceUsd: number;
    yearlyPriceUsd: number;
    features: string[];
  };
  ads: {
    enabled: boolean;
    headerBanner: boolean;
    sidebarAd: boolean;
    inFeedAd: boolean;
    resultAd: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    googleSearchConsoleId: string;
    googleAnalyticsId: string;
  };
}

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: 'user' | 'tool' | 'settings' | 'job' | 'system';
  targetId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  premiumUsers: number;
  totalConversions: number;
  filesProcessedCount: number;
  failedConversions: number;
  estimatedRevenueUsd: number;
  storageUsedBytes: number;
  systemStatus: 'healthy' | 'degraded' | 'maintenance';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  durationMs?: number;
}
