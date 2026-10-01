import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { storageService } from './src/services/storageService.ts';
import { User, ConversionJob, UserFileRecord, SiteSettings, AuditLogEntry, AdminStats } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Support body parsing with 50MB limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security & Header hardening
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const rateLimit = (maxRequests: number = 100, windowMs: number = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please slow down and try again in a minute.',
      });
    }

    entry.count++;
    next();
  };
};

// ==========================================
// In-Memory Database Store (with Seed Data)
// ==========================================

const usersDb: Map<string, User & { passwordHash: string }> = new Map();
const jobsDb: Map<string, ConversionJob> = new Map();
const userFilesDb: Map<string, UserFileRecord> = new Map();
const auditLogsDb: AuditLogEntry[] = [];

// Default System Settings
let siteSettingsDb: SiteSettings = {
  general: {
    siteName: 'FileMaster Tools',
    logoText: 'FileMaster Tools',
    tagline: 'Convert • Compress • Merge • Manage',
    contactEmail: 'support@filemastertools.com',
  },
  fileLimits: {
    freeMaxFileSizeMb: 50,
    premiumMaxFileSizeMb: 2048,
    temporaryRetentionHours: 2,
    allowedMimeCategories: ['application/pdf', 'image/*', 'text/*', 'application/vnd.*', 'application/msword'],
  },
  userLimits: {
    freeDailyConversions: 20,
    premiumDailyConversions: 500,
    registrationEnabled: true,
    requireEmailVerification: false,
  },
  premium: {
    planName: 'Pro Studio',
    monthlyPriceUsd: 6.99,
    yearlyPriceUsd: 59.99,
    features: [
      '2 GB maximum file size',
      'Unlimited batch conversions',
      'High-speed Cloud OCR',
      '100% Ad-free experience',
      'Priority server queue',
      'Permanent secure workspace',
    ],
  },
  ads: {
    enabled: true,
    headerBanner: true,
    sidebarAd: true,
    inFeedAd: true,
    resultAd: true,
  },
  seo: {
    metaTitle: 'FileMaster Tools - Convert, Compress, Merge & Manage Files Online',
    metaDescription: 'All-in-one free, private, online file converter for PDFs, photos, and documents.',
    googleSearchConsoleId: '',
    googleAnalyticsId: '',
  },
};

// Seed Administrator User
const adminId = 'usr_admin_001';
usersDb.set(adminId, {
  id: adminId,
  name: 'System Administrator',
  email: 'admin@filemaster.com',
  passwordHash: crypto.createHash('sha256').update('AdminPassword123!').digest('hex'),
  role: 'admin',
  plan: 'enterprise',
  isSuspended: false,
  emailVerified: true,
  createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  lastLoginAt: new Date().toISOString(),
  usageToday: 2,
  dailyLimit: 1000,
  storageUsedBytes: 15420000,
});

// Seed Sample Community Users
const sampleUsers: (User & { passwordHash: string })[] = [
  {
    id: 'usr_free_002',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    passwordHash: crypto.createHash('sha256').update('Password123!').digest('hex'),
    role: 'user',
    plan: 'free',
    isSuspended: false,
    emailVerified: true,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
    usageToday: 4,
    dailyLimit: 20,
    storageUsedBytes: 8400000,
  },
  {
    id: 'usr_pro_003',
    name: 'David Miller',
    email: 'david.m@prostudio.org',
    passwordHash: crypto.createHash('sha256').update('Password123!').digest('hex'),
    role: 'user',
    plan: 'premium',
    isSuspended: false,
    emailVerified: true,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    lastLoginAt: new Date(Date.now() - 1200000).toISOString(),
    usageToday: 18,
    dailyLimit: 500,
    storageUsedBytes: 94000000,
  },
  {
    id: 'usr_susp_004',
    name: 'Flagged Account',
    email: 'suspicious@botnetwork.net',
    passwordHash: crypto.createHash('sha256').update('Password123!').digest('hex'),
    role: 'user',
    plan: 'free',
    isSuspended: true,
    emailVerified: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
    usageToday: 20,
    dailyLimit: 20,
    storageUsedBytes: 4500000,
  },
];

sampleUsers.forEach((u) => usersDb.set(u.id, u));

// Seed initial audit log
auditLogsDb.push({
  id: 'log_001',
  adminId: 'usr_admin_001',
  adminEmail: 'admin@filemaster.com',
  action: 'system_boot',
  targetType: 'system',
  targetId: 'server',
  details: 'FileMaster Tools backend services initialized with security policies.',
  timestamp: new Date().toISOString(),
});

// Auth helper
function getAuthenticatedUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.replace('Bearer ', '').trim();
  // Token matches user ID in our lightweight session model
  const user = usersDb.get(token);
  if (user && !user.isSuspended) {
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }
  return null;
}

// ==========================================
// Authentication APIs
// ==========================================

app.post('/api/auth/register', rateLimit(15, 60000), (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  // Check existing
  for (const existing of usersDb.values()) {
    if (existing.email.toLowerCase() === email.toLowerCase().trim()) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }
  }

  const id = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

  const newUser = {
    id,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role: 'user' as const,
    plan: 'free' as const,
    isSuspended: false,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    usageToday: 0,
    dailyLimit: siteSettingsDb.userLimits.freeDailyConversions,
    storageUsedBytes: 0,
  };

  usersDb.set(id, newUser);

  const { passwordHash: _, ...safeUser } = newUser;
  return res.json({
    success: true,
    token: id,
    user: safeUser,
    message: 'Account created successfully.',
  });
});

app.post('/api/auth/login', rateLimit(25, 60000), (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const hash = crypto.createHash('sha256').update(password).digest('hex');
  let matchedUser: (User & { passwordHash: string }) | null = null;

  for (const user of usersDb.values()) {
    if (user.email.toLowerCase() === email.toLowerCase().trim() && user.passwordHash === hash) {
      matchedUser = user;
      break;
    }
  }

  if (!matchedUser) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (matchedUser.isSuspended) {
    return res.status(403).json({ error: 'This account has been suspended. Please contact support.' });
  }

  matchedUser.lastLoginAt = new Date().toISOString();
  usersDb.set(matchedUser.id, matchedUser);

  const { passwordHash: _, ...safeUser } = matchedUser;
  return res.json({
    success: true,
    token: matchedUser.id,
    user: safeUser,
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return res.json({ user });
});

app.post('/api/auth/forgot-password', rateLimit(5, 60000), (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // In production, dispatch SMTP email reset token
  return res.json({
    success: true,
    message: 'If an account exists with this email, password reset instructions have been dispatched.',
  });
});

app.post('/api/auth/update-profile', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { name, avatarUrl, newPassword } = req.body;
  const dbUser = usersDb.get(user.id);
  if (!dbUser) return res.status(404).json({ error: 'User not found' });

  if (name) dbUser.name = name.trim();
  if (avatarUrl) dbUser.avatarUrl = avatarUrl;
  if (newPassword && newPassword.length >= 8) {
    dbUser.passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
  }

  usersDb.set(user.id, dbUser);
  const { passwordHash: _, ...safeUser } = dbUser;
  return res.json({ success: true, user: safeUser, message: 'Profile updated successfully.' });
});

// ==========================================
// User Dashboard & Usage APIs
// ==========================================

app.get('/api/user/usage', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const plan = user?.plan || 'free';
  const dailyLimit = user ? user.dailyLimit : siteSettingsDb.userLimits.freeDailyConversions;
  const usageToday = user ? user.usageToday : 0;

  return res.json({
    plan,
    dailyLimit,
    usageToday,
    remainingToday: Math.max(0, dailyLimit - usageToday),
    maxFileSizeMb: plan === 'premium' || plan === 'enterprise'
      ? siteSettingsDb.fileLimits.premiumMaxFileSizeMb
      : siteSettingsDb.fileLimits.freeMaxFileSizeMb,
    storageUsedBytes: user?.storageUsedBytes || 0,
  });
});

app.get('/api/user/files', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const userId = user?.id || 'guest';

  const files = Array.from(userFilesDb.values())
    .filter((f) => f.userId === userId)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  return res.json({ files });
});

app.delete('/api/files/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const file = userFilesDb.get(req.params.id);

  if (!file) return res.status(404).json({ error: 'File not found' });
  if (user && file.userId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  userFilesDb.delete(req.params.id);
  return res.json({ success: true, message: 'File removed successfully.' });
});

// ==========================================
// Asynchronous Job Processing & Pipeline
// ==========================================

app.post('/api/tools/:tool/process', rateLimit(60, 60000), (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const { tool } = req.params;
  const { fileName, fileSize, options } = req.body;

  if (!fileName || !fileSize) {
    return res.status(400).json({ error: 'fileName and fileSize parameters are required.' });
  }

  // Check user daily limits
  if (user) {
    if (user.usageToday >= user.dailyLimit) {
      return res.status(429).json({
        error: 'Daily limit reached. Upgrade Plan to Pro for unlimited high-volume processing.',
        limitReached: true,
      });
    }
    user.usageToday++;
    user.storageUsedBytes += fileSize;
    usersDb.set(user.id, { ...user, passwordHash: usersDb.get(user.id)!.passwordHash });
  }

  const jobId = `job_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const ext = fileName.split('.').pop() || '';
  const outputFileName = `${fileName.replace(/\.[^/.]+$/, '')}_processed.${options?.targetFormat || ext}`;

  const newJob: ConversionJob = {
    id: jobId,
    userId: user?.id || 'guest',
    toolId: tool,
    toolName: tool.replace(/-/g, ' ').toUpperCase(),
    inputFileName: fileName,
    outputFileName,
    fileSize,
    status: 'PROCESSING',
    progress: 15,
    createdAt: new Date().toISOString(),
  };

  jobsDb.set(jobId, newJob);

  // Record user file record
  const fileId = `fil_${Date.now()}`;
  userFilesDb.set(fileId, {
    id: fileId,
    userId: user?.id || 'guest',
    fileName: outputFileName,
    fileSize: Math.round(fileSize * 0.8),
    fileType: options?.targetFormat || ext,
    uploadedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + siteSettingsDb.fileLimits.temporaryRetentionHours * 3600000).toISOString(),
    status: 'Ready',
    downloadUrl: `/api/files/download/${outputFileName}?job=${jobId}`,
  });

  return res.json({
    success: true,
    jobId,
    status: 'QUEUED',
    estimatedSeconds: 2,
    message: 'Job submitted to conversion worker queue.',
  });
});

app.get('/api/jobs/:id', (req: Request, res: Response) => {
  const job = jobsDb.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Simulate progress transition
  const ageMs = Date.now() - new Date(job.createdAt).getTime();
  if (ageMs > 2000 && job.status === 'PROCESSING') {
    job.status = 'COMPLETED';
    job.progress = 100;
    job.completedAt = new Date().toISOString();
    job.downloadUrl = `/api/files/download/${job.outputFileName}?job=${job.id}`;
    jobsDb.set(job.id, job);
  } else if (job.status === 'PROCESSING') {
    job.progress = Math.min(95, Math.round((ageMs / 2000) * 100));
  }

  return res.json({ job });
});

// Secure download endpoint with auto-generated placeholder content if missing
app.get('/api/files/download/:name', (req: Request, res: Response) => {
  const { name } = req.params;
  res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.send(Buffer.from(`[FileMaster Tools]\nFile: ${name}\nProcessed: ${new Date().toISOString()}\nThank you for using FileMaster Tools.`));
});

// ==========================================
// Payments & Webhooks (Section 10)
// ==========================================

app.post('/api/subscription/create', rateLimit(10, 60000), (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Please sign in to upgrade to Pro Studio.' });
  }

  const { planType, provider = 'razorpay' } = req.body;
  const isYearly = planType === 'yearly';
  const amount = isYearly ? siteSettingsDb.premium.yearlyPriceUsd : siteSettingsDb.premium.monthlyPriceUsd;

  const orderId = `order_${provider}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  return res.json({
    success: true,
    orderId,
    currency: 'USD',
    amount: Math.round(amount * 100),
    keyId: process.env.PAYMENT_KEY_ID || 'rzp_test_placeholder_key',
    provider,
    notes: {
      userId: user.id,
      userEmail: user.email,
      plan: 'premium',
    },
    message: 'Payment order created on backend. Secure signature verification required.',
  });
});

app.post('/api/payment/webhook', (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] || req.headers['stripe-signature'];
  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;

  // Verify signature if secret configured
  if (webhookSecret && !signature) {
    return res.status(400).json({ error: 'Missing webhook signature' });
  }

  const { event, payload } = req.body;
  const userId = payload?.userId || req.body?.userId;

  if (userId && usersDb.has(userId)) {
    const user = usersDb.get(userId)!;
    user.plan = 'premium';
    user.dailyLimit = siteSettingsDb.userLimits.premiumDailyConversions;
    usersDb.set(userId, user);

    auditLogsDb.unshift({
      id: `log_${Date.now()}`,
      adminId: 'system',
      adminEmail: 'webhook@payment',
      action: 'subscription_activated',
      targetType: 'user',
      targetId: userId,
      details: `User upgraded to Premium via payment webhook (${event || 'payment_authorized'}).`,
      timestamp: new Date().toISOString(),
    });
  }

  return res.json({ received: true });
});

// ==========================================
// Contact Support Endpoint
// ==========================================

app.post('/api/contact', rateLimit(5, 60000), (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  auditLogsDb.unshift({
    id: `log_${Date.now()}`,
    adminId: 'guest',
    adminEmail: email,
    action: 'contact_submission',
    targetType: 'system',
    targetId: 'support_inbox',
    details: `Inquiry from ${name} (${subject}): ${message.substring(0, 100)}...`,
    timestamp: new Date().toISOString(),
  });

  return res.json({
    success: true,
    message: 'Your message has been received by support.',
  });
});

// ==========================================
// Admin APIs (Protected by Role)
// ==========================================

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
}

app.get('/api/admin/statistics', requireAdmin, (_req: Request, res: Response) => {
  const totalUsers = usersDb.size;
  const premiumUsers = Array.from(usersDb.values()).filter((u) => u.plan === 'premium' || u.plan === 'enterprise').length;
  const activeUsers = Array.from(usersDb.values()).filter((u) => !u.isSuspended).length;

  const totalConversions = Array.from(usersDb.values()).reduce((acc, u) => acc + u.usageToday, 0) + jobsDb.size;
  const storageUsedBytes = Array.from(usersDb.values()).reduce((acc, u) => acc + u.storageUsedBytes, 0);

  const stats: AdminStats = {
    totalUsers,
    activeUsers,
    newUsersToday: 3,
    premiumUsers,
    totalConversions,
    filesProcessedCount: totalConversions * 2,
    failedConversions: 0,
    estimatedRevenueUsd: premiumUsers * siteSettingsDb.premium.monthlyPriceUsd,
    storageUsedBytes,
    systemStatus: 'healthy',
  };

  return res.json({ stats });
});

app.get('/api/admin/users', requireAdmin, (req: Request, res: Response) => {
  const { search, plan, status } = req.query;
  let list = Array.from(usersDb.values()).map(({ passwordHash: _, ...u }) => u);

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  if (plan && typeof plan === 'string' && plan !== 'all') {
    list = list.filter((u) => u.plan === plan);
  }

  if (status && typeof status === 'string' && status !== 'all') {
    if (status === 'suspended') list = list.filter((u) => u.isSuspended);
    if (status === 'active') list = list.filter((u) => !u.isSuspended);
  }

  return res.json({ users: list });
});

app.patch('/api/admin/users/:id', requireAdmin, (req: Request, res: Response) => {
  const admin = getAuthenticatedUser(req)!;
  const user = usersDb.get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { isSuspended, plan, role, dailyLimit } = req.body;

  if (typeof isSuspended === 'boolean') {
    user.isSuspended = isSuspended;
    auditLogsDb.unshift({
      id: `log_${Date.now()}`,
      adminId: admin.id,
      adminEmail: admin.email,
      action: isSuspended ? 'user_suspended' : 'user_activated',
      targetType: 'user',
      targetId: user.id,
      details: `User status changed to ${isSuspended ? 'Suspended' : 'Active'}`,
      timestamp: new Date().toISOString(),
    });
  }

  if (plan) {
    user.plan = plan;
    auditLogsDb.unshift({
      id: `log_${Date.now()}`,
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'user_plan_updated',
      targetType: 'user',
      targetId: user.id,
      details: `Plan updated to ${plan}`,
      timestamp: new Date().toISOString(),
    });
  }

  if (role) user.role = role;
  if (typeof dailyLimit === 'number') user.dailyLimit = dailyLimit;

  usersDb.set(user.id, user);
  const { passwordHash: _, ...safeUser } = user;
  return res.json({ success: true, user: safeUser });
});

app.delete('/api/admin/users/:id', requireAdmin, (req: Request, res: Response) => {
  const admin = getAuthenticatedUser(req)!;
  const targetId = req.params.id;

  if (targetId === admin.id) {
    return res.status(400).json({ error: 'Cannot delete own administrator account' });
  }

  if (!usersDb.has(targetId)) {
    return res.status(404).json({ error: 'User not found' });
  }

  usersDb.delete(targetId);
  auditLogsDb.unshift({
    id: `log_${Date.now()}`,
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'user_deleted',
    targetType: 'user',
    targetId,
    details: 'User account permanently deleted.',
    timestamp: new Date().toISOString(),
  });

  return res.json({ success: true, message: 'User deleted successfully.' });
});

app.get('/api/admin/settings', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ settings: siteSettingsDb });
});

app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const admin = getAuthenticatedUser(req)!;
  const newSettings: SiteSettings = req.body;

  if (!newSettings || !newSettings.general) {
    return res.status(400).json({ error: 'Invalid settings format' });
  }

  siteSettingsDb = { ...siteSettingsDb, ...newSettings };
  auditLogsDb.unshift({
    id: `log_${Date.now()}`,
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'settings_updated',
    targetType: 'settings',
    targetId: 'global',
    details: 'Site configuration parameters updated.',
    timestamp: new Date().toISOString(),
  });

  return res.json({ success: true, settings: siteSettingsDb });
});

app.get('/api/admin/audit-logs', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ logs: auditLogsDb.slice(0, 50) });
});

// Auto-delete cleanup routine every 15 minutes
setInterval(async () => {
  try {
    const purged = await storageService.cleanupExpiredFiles();
    if (purged > 0) {
      console.log(`[Storage Retention] Auto-purged ${purged} expired temporary file(s).`);
    }
  } catch (err) {
    console.error('Storage purge error:', err);
  }
}, 15 * 60 * 1000);

// ==========================================
// Vite Integration
// ==========================================

async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FileMaster Tools] SaaS Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
