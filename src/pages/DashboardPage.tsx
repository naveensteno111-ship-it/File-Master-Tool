import React, { useState, useEffect } from 'react';
import { RecentConversion, UserFileRecord } from '../types';
import { TOOLS_DATA } from '../data/toolsData';
import { ToolCard } from '../components/common/ToolCard';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchUserFiles, deleteUserFile } from '../services/apiService';
import {
  History,
  Star,
  Trash2,
  Lock,
  Download,
  ShieldCheck,
  HardDrive,
  FileCheck,
  User as UserIcon,
  ArrowRight,
  Folder,
  Sparkles,
  Zap,
  KeyRound,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

interface DashboardPageProps {
  history: RecentConversion[];
  onClearHistory: () => void;
  onRemoveHistoryItem: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onNavigate: (route: string) => void;
  onOpenPricing?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  history,
  onClearHistory,
  onRemoveHistoryItem,
  favorites,
  onToggleFavorite,
  onNavigate,
  onOpenPricing,
}) => {
  const { user, usage, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'history' | 'favorites' | 'account'>('overview');
  const [userFiles, setUserFiles] = useState<UserFileRecord[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Dialog state
  const [confirmDeleteFileId, setConfirmDeleteFileId] = useState<string | null>(null);
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);

  useEffect(() => {
    if (activeTab === 'files') {
      loadFiles();
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const files = await fetchUserFiles();
      setUserFiles(files);
    } catch {
      // ignore
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleDeleteFile = async (id: string) => {
    try {
      await deleteUserFile(id);
      setUserFiles((prev) => prev.filter((f) => f.id !== id));
      showToast('File removed from workspace.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete file', 'error');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile({
        name,
        avatarUrl,
        newPassword: newPassword || undefined,
      });
      setNewPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const favoriteTools = TOOLS_DATA.filter((t) => favorites.includes(t.id));
  const totalBytesProcessed = (user?.storageUsedBytes || 0) + history.reduce((acc, h) => acc + h.originalSize, 0);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const formatDate = (timestamp: number | string) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + d.toLocaleDateString();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-8">
      {/* Header Profile Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Workspace Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back{user ? `, ${user.name}` : ''}! Manage files, usage, and conversion pipelines.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            <Sparkles className="h-3 w-3" />
            <span>Plan: {user?.plan || 'Free Tier'}</span>
          </span>
          {(!user || user.plan === 'free') && onOpenPricing && (
            <button
              onClick={onOpenPricing}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700"
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-400">
            <FileCheck className="h-4 w-4 text-blue-600" />
            <span>Total Conversions</span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {history.length + (user?.usageToday || 0)}
          </p>
          <span className="text-[11px] text-slate-500">Across all file categories</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-400">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>Daily Remaining</span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {usage ? usage.remainingToday : 20}
            <span className="text-xs font-normal text-slate-400"> / {usage?.dailyLimit || 20}</span>
          </p>
          <span className="text-[11px] text-slate-500">Resets daily at midnight</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-400">
            <HardDrive className="h-4 w-4 text-emerald-500" />
            <span>Data Volume</span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {formatBytes(totalBytesProcessed)}
          </p>
          <span className="text-[11px] text-slate-500">Fast memory processing</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-400">
            <ShieldCheck className="h-4 w-4 text-violet-500" />
            <span>Privacy Score</span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            100%
          </p>
          <span className="text-[11px] text-slate-500">Zero permanent data leaks</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          Overview & Activity
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'files'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <Folder className="h-4 w-4" />
          <span>My Files</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Conversion History ({history.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'favorites'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <Star className="h-4 w-4" />
          <span>Favorite Tools ({favoriteTools.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'account'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <UserIcon className="h-4 w-4" />
          <span>Account Settings</span>
        </button>
      </div>

      {/* ===================================== */}
      {/* Tab 1: Overview */}
      {/* ===================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Recent Activity
                </h3>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs text-blue-600 hover:underline"
                >
                  View full history →
                </button>
              </div>

              {history.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {history.slice(0, 5).map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {item.outputFileName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {item.toolName} • {formatBytes(item.outputSize)} • {formatDate(item.timestamp)}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                        Completed
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No conversions recorded yet today. Drop a file on the homepage to begin!
                </div>
              )}
            </div>

            {/* Plan Info Card */}
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50/50 to-white p-6 dark:border-blue-900 dark:from-blue-950/30 dark:to-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Current Tier</span>
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  {user?.plan || 'Free'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Enjoy 50 MB per file, batch conversions up to 30 files, and 100% browser-side privacy.
              </p>

              <div className="border-t border-blue-100 dark:border-blue-900/60 pt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Max File Size:</span>
                  <span className="font-mono font-bold">{usage?.maxFileSizeMb || 50} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Daily Limit:</span>
                  <span className="font-mono font-bold">{usage?.dailyLimit || 20} jobs</span>
                </div>
              </div>

              {(!user || user.plan === 'free') && onOpenPricing && (
                <button
                  onClick={onOpenPricing}
                  className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
                >
                  Upgrade to Pro Studio
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* Tab 2: My Files (Section 3) */}
      {/* ===================================== */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Generated & Converted Files
            </h3>
            <span className="text-xs text-slate-500">
              Files auto-purge after {usage?.plan === 'premium' ? '24' : '2'} hours
            </span>
          </div>

          {loadingFiles ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading files...</div>
          ) : userFiles.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                  <tr>
                    <th className="px-4 py-3">File Name</th>
                    <th className="px-4 py-3">Format</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {userFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                        {file.fileName}
                      </td>
                      <td className="px-4 py-3 font-mono uppercase text-slate-500">{file.fileType}</td>
                      <td className="px-4 py-3 font-mono">{formatBytes(file.fileSize)}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(file.uploadedAt)}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                          {file.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {file.downloadUrl && (
                          <a
                            href={file.downloadUrl}
                            download={file.fileName}
                            className="inline-flex p-1.5 text-blue-600 hover:text-blue-700"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => setConfirmDeleteFileId(file.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <Folder className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No stored files</p>
              <p className="mt-1 text-xs text-slate-500">Converted files will appear here for easy access and re-download.</p>
            </div>
          )}
        </div>
      )}

      {/* ===================================== */}
      {/* Tab 3: Conversion History */}
      {/* ===================================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Saved strictly in your browser session for privacy.
            </span>
            {history.length > 0 && (
              <button
                onClick={() => setConfirmClearHistory(true)}
                className="flex items-center space-x-1 text-xs font-semibold text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All History</span>
              </button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                          {item.outputFileName}
                        </span>
                        <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                          {item.format}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                          {item.status || 'Completed'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 font-mono">
                        Tool: <strong>{item.toolName}</strong> • Original: {item.originalFileName} • {formatBytes(item.outputSize)} • {formatDate(item.timestamp)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => onNavigate(`tool:${item.toolId}`)}
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Launch Tool
                      </button>
                      <button
                        onClick={() => onRemoveHistoryItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600"
                        title="Delete log"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <History className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No conversion history yet</p>
            </div>
          )}
        </div>
      )}

      {/* ===================================== */}
      {/* Tab 4: Favorite Tools */}
      {/* ===================================== */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Saved Quick-Access Tools
          </h3>
          {favoriteTools.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {favoriteTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isFavorite={true}
                  onToggleFavorite={onToggleFavorite}
                  onOpenTool={(slug) => onNavigate(`tool:${slug}`)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <Star className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No favorite tools saved</p>
              <p className="mt-1 text-xs text-slate-500">Star any tool card to add it to your quick-access favorites list.</p>
            </div>
          )}
        </div>
      )}

      {/* ===================================== */}
      {/* Tab 5: Account Settings */}
      {/* ===================================== */}
      {activeTab === 'account' && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
              Profile & Account Credentials
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Update your personal details and security credentials.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'guest@filemaster.local'}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Email address cannot be changed directly for security.</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Update Password (optional)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={confirmDeleteFileId !== null}
        title="Delete File"
        message="Are you sure you want to permanently delete this converted file from workspace storage?"
        confirmLabel="Delete"
        isDanger={true}
        onConfirm={() => confirmDeleteFileId && handleDeleteFile(confirmDeleteFileId)}
        onCancel={() => setConfirmDeleteFileId(null)}
      />

      <ConfirmationDialog
        isOpen={confirmClearHistory}
        title="Clear Conversion History"
        message="This will delete your local log of recent conversions from this device. Are you sure?"
        confirmLabel="Clear All"
        isDanger={true}
        onConfirm={() => {
          onClearHistory();
          showToast('Conversion history cleared.', 'info');
        }}
        onCancel={() => setConfirmClearHistory(false)}
      />
    </div>
  );
};
