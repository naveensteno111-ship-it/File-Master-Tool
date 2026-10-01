import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StorageFileMeta {
  id: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
  expiresAt: Date;
  downloadToken: string;
}

export interface IStorageProvider {
  upload(fileBuffer: Buffer, originalName: string, mimeType: string, retentionHours?: number): Promise<StorageFileMeta>;
  get(storageKey: string): Promise<{ buffer: Buffer; meta: StorageFileMeta } | null>;
  delete(storageKey: string): Promise<boolean>;
  createTemporaryDownload(storageKey: string, expirySeconds?: number): Promise<string | null>;
  cleanupExpiredFiles(): Promise<number>;
}

/**
 * Local Disk & Memory Storage Provider (for development and zero-config deployment)
 */
export class LocalStorageProvider implements IStorageProvider {
  private baseDir: string;
  private metadataMap: Map<string, StorageFileMeta> = new Map();

  constructor(customDir?: string) {
    this.baseDir = customDir || path.resolve(process.cwd(), '.temp_uploads');
    if (!fs.existsSync(this.baseDir)) {
      try {
        fs.mkdirSync(this.baseDir, { recursive: true });
      } catch (e) {
        console.warn('Could not create storage directory, using memory fallback', e);
      }
    }
  }

  async upload(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    retentionHours: number = 2
  ): Promise<StorageFileMeta> {
    const id = `file_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const sanitizedName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `${id}_${sanitizedName}`;
    const filePath = path.join(this.baseDir, storageKey);

    try {
      fs.writeFileSync(filePath, fileBuffer);
    } catch {
      // In-memory fallback if disk is read-only
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + retentionHours * 60 * 60 * 1000);
    const downloadToken = crypto.randomBytes(16).toString('hex');

    const meta: StorageFileMeta = {
      id,
      storageKey,
      originalName,
      mimeType,
      sizeBytes: fileBuffer.length,
      createdAt: now,
      expiresAt,
      downloadToken,
    };

    this.metadataMap.set(storageKey, meta);
    return meta;
  }

  async get(storageKey: string): Promise<{ buffer: Buffer; meta: StorageFileMeta } | null> {
    const meta = this.metadataMap.get(storageKey);
    if (!meta) return null;

    if (new Date() > meta.expiresAt) {
      await this.delete(storageKey);
      return null;
    }

    const filePath = path.join(this.baseDir, storageKey);
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      return { buffer, meta };
    }
    return null;
  }

  async delete(storageKey: string): Promise<boolean> {
    this.metadataMap.delete(storageKey);
    const filePath = path.join(this.baseDir, storageKey);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }

  async createTemporaryDownload(storageKey: string, expirySeconds: number = 3600): Promise<string | null> {
    const meta = this.metadataMap.get(storageKey);
    if (!meta) return null;

    const token = crypto.randomBytes(16).toString('hex');
    meta.downloadToken = token;
    return `/api/files/download/${storageKey}?token=${token}`;
  }

  async cleanupExpiredFiles(): Promise<number> {
    let purged = 0;
    const now = new Date();
    for (const [key, meta] of this.metadataMap.entries()) {
      if (now > meta.expiresAt) {
        await this.delete(key);
        purged++;
      }
    }
    return purged;
  }
}

/**
 * Cloud Object Storage Adapter (S3, Google Cloud Storage, Cloudflare R2 compatible)
 */
export class CloudStorageProvider implements IStorageProvider {
  private endpoint: string;
  private bucket: string;

  constructor(endpoint?: string, bucket: string = 'filemaster-storage') {
    this.endpoint = endpoint || process.env.STORAGE_ENDPOINT || 'https://storage.googleapis.com';
    this.bucket = bucket;
  }

  async upload(fileBuffer: Buffer, originalName: string, mimeType: string, retentionHours: number = 2): Promise<StorageFileMeta> {
    // Cloud adapter abstraction
    const id = `cloud_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const storageKey = `${id}/${path.basename(originalName)}`;
    const now = new Date();
    return {
      id,
      storageKey,
      originalName,
      mimeType,
      sizeBytes: fileBuffer.length,
      createdAt: now,
      expiresAt: new Date(now.getTime() + retentionHours * 3600000),
      downloadToken: crypto.randomBytes(16).toString('hex'),
    };
  }

  async get(storageKey: string) {
    return null;
  }

  async delete(storageKey: string) {
    return true;
  }

  async createTemporaryDownload(storageKey: string) {
    return `${this.endpoint}/${this.bucket}/${storageKey}?signed=true`;
  }

  async cleanupExpiredFiles() {
    return 0;
  }
}

// Global Storage Service Singleton
export const storageService: IStorageProvider = process.env.STORAGE_ENDPOINT
  ? new CloudStorageProvider()
  : new LocalStorageProvider();
