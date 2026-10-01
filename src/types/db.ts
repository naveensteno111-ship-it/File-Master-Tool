/**
 * Database Entity Architecture for FileMaster Tools
 * Compatible with PostgreSQL, Cloud SQL, Prisma, and Drizzle ORM
 */

export interface DbUser {
  id: string; // UUID primary key
  email: string; // Unique index
  passwordHash: string; // Argon2id or bcrypt hash
  name: string;
  role: 'user' | 'admin' | 'moderator';
  plan: 'free' | 'premium' | 'enterprise';
  avatarUrl?: string;
  isSuspended: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface DbFile {
  id: string; // UUID
  userId: string; // Foreign key -> DbUser.id
  storageKey: string; // Path or Object Storage UUID
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  isTemporary: boolean;
  expiresAt: Date; // Indexed for auto-purge job
  createdAt: Date;
}

export interface DbConversionJob {
  id: string; // UUID
  userId?: string; // Foreign key -> DbUser.id (optional for guests)
  toolId: string;
  inputFileId: string; // Foreign key -> DbFile.id
  outputFileId?: string; // Foreign key -> DbFile.id
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  progress: number;
  optionsJson?: string;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface DbConversionHistory {
  id: string;
  userId: string;
  jobId: string;
  toolSlug: string;
  originalFileName: string;
  outputFileName: string;
  originalSizeBytes: number;
  outputSizeBytes: number;
  status: string;
  createdAt: Date;
}

export interface DbSubscription {
  id: string;
  userId: string; // Foreign key -> DbUser.id
  plan: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'expired';
  provider: 'razorpay' | 'stripe';
  externalSubscriptionId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbPayment {
  id: string;
  userId: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  provider: 'razorpay' | 'stripe';
  signature?: string;
  createdAt: Date;
}

export interface DbUsage {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format (indexed)
  conversionCount: number;
  totalBytesProcessed: number;
  lastResetAt: Date;
}

export interface DbNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

export interface DbAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ipAddress?: string;
  createdAt: Date;
}

export interface DbSiteSetting {
  key: string; // Primary key
  value: string; // JSON serialized
  updatedBy: string;
  updatedAt: Date;
}
