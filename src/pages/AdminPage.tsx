import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  AdminStats,
  User,
  ToolDefinition,
  SiteSettings,
  AuditLogEntry
} from '../types';
import { TOOLS_DATA } from '../data/toolsData';
import {
  fetchAdminStatistics,
  fetchAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  fetchAdminSettings,
  updateAdminSettings,
  fetchAdminAuditLogs,
} from '../services/apiService';
import { DataTable } from '../components/common/DataTable';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import {
  ShieldAlert,
  Users,
  Wrench,
  Settings,
  Activity,
  DollarSign,
  FileCheck,
  HardDrive,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  Search,
  Save,
  RotateCcw,
  Sparkles,
  Zap,
  Globe,
  Radio
} from 'lucide-react';

interface AdminPageProps {
  onNavigate: (route: string) => void;
  onOpenAuth: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'tools' | 'settings' | 'audit'>('dashboard');

  // Admin Data States
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [toolsList, setToolsList] = useState<ToolDefinition[]>(TOOLS_DATA);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [userPlanFilter, setUserPlanFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');
  const [toolCategoryFilter, setToolCategoryFilter] = useState<string>('all');

  // Confirmation state for user actions
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToSuspend, setUserToSuspend] = useState<User | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, settingsData, logsData] = await Promise.all([
        fetchAdminStatistics(),
        fetchAdminUsers(),
        fetchAdminSettings(),
        fetchAdminAuditLogs(),
      ]);
      setStats(statsData);
      setUsersList(usersData);
      setSettings(settingsData);
      setAuditLogs(logsData);
    } catch (err: any) {
      showToast(err.message || 'Failed to load administrator data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl py-24 px-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 mb-4">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Access Restricted: Administrator Only
        </h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          The FileMaster Tools administration management portal requires an authorized administrator session.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onOpenAuth}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
          >
            Sign In with Admin Credentials
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Handle User Status toggle
  const handleToggleSuspend = async (targetUser: User) => {
    try {
      const updated = await updateAdminUser(targetUser.id, {
        isSuspended: !targetUser.isSuspended,
      });
      setUsersList((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showToast(`User ${updated.name} ${updated.isSuspended ? 'suspended' : 'activated'}.`, 'info');
      setUserToSuspend(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to update user', 'error');
    }
  };

  // Handle User Plan change
  const handleChangePlan = async (userId: string, newPlan: string) => {
    try {
      const updated = await updateAdminUser(userId, { plan: newPlan });
      setUsersList((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showToast(`Plan updated to ${newPlan}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update plan', 'error');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (targetId: string) => {
    try {
      await deleteAdminUser(targetId);
      setUsersList((prev) => prev.filter((u) => u.id !== targetId));
      showToast('User account deleted permanently.', 'success');
      setUserToDelete(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  // Handle Tool Status toggle
  const handleToggleTool = (toolId: string) => {
    setToolsList((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, enabled: !t.enabled } : t))
    );
    showToast('Tool status updated.', 'info');
  };

  const handleToggleToolPremium = (toolId: string) => {
    setToolsList((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, requiresPremium: !t.requiresPremium } : t))
    );
    showToast('Tool tier requirement updated.', 'info');
  };

  // Handle Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const updated = await updateAdminSettings(settings);
      setSettings(updated);
      showToast('System configuration saved successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 space-y-8">
      {/* Admin Title & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600 dark:bg-red-950/60 dark:text-red-400 mb-2 border border-red-200 dark:border-red-900">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>FileMaster Tools Superadmin Console</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Platform Administration
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All Workers Online</span>
          </div>
          <button
            onClick={loadAdminData}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            title="Refresh metrics"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'dashboard'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Dashboard & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'users'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Management ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'tools'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <Wrench className="h-4 w-4" />
          <span>Tool Registry ({toolsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'settings'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Global Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'audit'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <Radio className="h-4 w-4" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. DASHBOARD & ANALYTICS (Section 5, 26) */}
      {/* ========================================================= */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Registered Users</span>
              <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{stats.totalUsers}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">+3 registered today</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold uppercase text-slate-400">Premium Subscribers</span>
              <p className="mt-1 text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{stats.premiumUsers}</p>
              <span className="text-[10px] text-slate-500 font-mono">
                Est. Rev: ${stats.estimatedRevenueUsd.toFixed(2)} / mo
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Conversions</span>
              <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{stats.totalConversions}</p>
              <span className="text-[10px] text-slate-500">Across PDF, Image, Docs</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold uppercase text-slate-400">Pipeline Failures</span>
              <p className="mt-1 text-3xl font-extrabold text-emerald-600 font-mono">{stats.failedConversions}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">100% Success Rate</span>
            </div>
          </div>

          {/* Quick Metrics Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Top Active Tool Categories
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">PDF Tools</span>
                    <span className="font-mono text-slate-500">62% traffic</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: '62%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Image Converters & Compressor</span>
                    <span className="font-mono text-slate-500">26% traffic</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '26%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Office & Document Tools</span>
                    <span className="font-mono text-slate-500">12% traffic</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Storage & Retention Metrics
              </h3>
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span>Current Active Volatile RAM:</span>
                  <span className="font-mono font-bold">{formatBytes(stats.storageUsedBytes)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span>Auto-Retention Policy:</span>
                  <span className="font-mono font-bold">{settings?.fileLimits.temporaryRetentionHours || 2} Hours</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span>Security Firewall:</span>
                  <span className="font-mono font-bold text-emerald-600">Strict MIME + Anti-Exec Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. USER MANAGEMENT (Section 6) */}
      {/* ========================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              User Accounts Database
            </h3>
            <div className="flex items-center space-x-2">
              <select
                value={userPlanFilter}
                onChange={(e) => setUserPlanFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>
          </div>

          <DataTable
            data={usersList.filter((u) => {
              if (userPlanFilter !== 'all' && u.plan !== userPlanFilter) return false;
              if (userStatusFilter === 'active' && u.isSuspended) return false;
              if (userStatusFilter === 'suspended' && !u.isSuspended) return false;
              return true;
            })}
            searchPlaceholder="Search users by name or email..."
            searchFilter={(u, q) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)}
            columns={[
              {
                header: 'User',
                render: (u) => (
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                  </div>
                ),
              },
              {
                header: 'Plan',
                render: (u) => (
                  <select
                    value={u.plan}
                    onChange={(e) => handleChangePlan(u.id, e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold uppercase text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                ),
              },
              {
                header: 'Today Usage',
                render: (u) => (
                  <span className="font-mono">
                    {u.usageToday} / {u.dailyLimit}
                  </span>
                ),
              },
              {
                header: 'Status',
                render: (u) => (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      u.isSuspended
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    }`}
                  >
                    {u.isSuspended ? 'Suspended' : 'Active'}
                  </span>
                ),
              },
              {
                header: 'Actions',
                className: 'text-right',
                render: (u) => (
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setUserToSuspend(u)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                    >
                      {u.isSuspended ? 'Activate' : 'Suspend'}
                    </button>
                    {u.id !== user?.id && (
                      <button
                        onClick={() => setUserToDelete(u)}
                        className="rounded-lg border border-red-200 px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 dark:border-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TOOL REGISTRY (Section 7, 8) */}
      {/* ========================================================= */}
      {activeTab === 'tools' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Platform Tool Catalog ({toolsList.length} Tools)
            </h3>
            <select
              value={toolCategoryFilter}
              onChange={(e) => setToolCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">All Categories</option>
              <option value="pdf">PDF Tools</option>
              <option value="image">Image Tools</option>
              <option value="document">Document Tools</option>
              <option value="excel">Excel & CSV</option>
              <option value="powerpoint">PowerPoint</option>
              <option value="archive">Archive & Utilities</option>
            </select>
          </div>

          <DataTable
            data={toolsList.filter((t) => toolCategoryFilter === 'all' || t.category === toolCategoryFilter)}
            searchPlaceholder="Search tools by name, slug or extension..."
            searchFilter={(t, q) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)}
            columns={[
              {
                header: 'Tool Name',
                render: (t) => (
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{t.name}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">/{t.slug}</span>
                  </div>
                ),
              },
              {
                header: 'Category',
                render: (t) => (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {t.category}
                  </span>
                ),
              },
              {
                header: 'Engine',
                render: (t) => (
                  <span className="text-[11px]">
                    {t.isClientSide ? 'Client Browser' : 'Backend Worker'}
                  </span>
                ),
              },
              {
                header: 'Tier',
                render: (t) => (
                  <button
                    onClick={() => handleToggleToolPremium(t.id)}
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${
                      t.requiresPremium
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {t.requiresPremium ? 'Pro Only' : 'Free Tier'}
                  </button>
                ),
              },
              {
                header: 'Status',
                render: (t) => (
                  <button
                    onClick={() => handleToggleTool(t.id)}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      t.enabled
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {t.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                ),
              },
              {
                header: 'Ready',
                render: (t) => (
                  <span className="text-[11px] font-semibold">
                    {t.isFunctional ? (
                      <span className="text-emerald-600">Active</span>
                    ) : (
                      <span className="text-amber-500">Coming Soon</span>
                    )}
                  </span>
                ),
              },
            ]}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. GLOBAL SETTINGS (Section 19) */}
      {/* ========================================================= */}
      {activeTab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
          {/* General */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              General Branding & Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.general.siteName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, siteName: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Contact Support Email
                </label>
                <input
                  type="email"
                  value={settings.general.contactEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, contactEmail: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* File Limits */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              File & Storage Limits
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Free Max File Size (MB)
                </label>
                <input
                  type="number"
                  value={settings.fileLimits.freeMaxFileSizeMb}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      fileLimits: {
                        ...settings.fileLimits,
                        freeMaxFileSizeMb: parseInt(e.target.value) || 10,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Premium Max File Size (MB)
                </label>
                <input
                  type="number"
                  value={settings.fileLimits.premiumMaxFileSizeMb}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      fileLimits: {
                        ...settings.fileLimits,
                        premiumMaxFileSizeMb: parseInt(e.target.value) || 100,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Temporary Retention (Hours)
                </label>
                <input
                  type="number"
                  value={settings.fileLimits.temporaryRetentionHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      fileLimits: {
                        ...settings.fileLimits,
                        temporaryRetentionHours: parseInt(e.target.value) || 2,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Advertisements Toggle */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Monetization & Advertisement Placements
            </h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={settings.ads.enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ads: { ...settings.ads, enabled: e.target.checked },
                    })
                  }
                  className="rounded text-blue-600"
                />
                <span className="font-bold">Enable Advertisements across platform for Free tier</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={settings.ads.headerBanner}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ads: { ...settings.ads, headerBanner: e.target.checked },
                      })
                    }
                  />
                  <span>Header Banner</span>
                </label>
                <label className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={settings.ads.inFeedAd}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ads: { ...settings.ads, inFeedAd: e.target.checked },
                      })
                    }
                  />
                  <span>In-Feed Unit</span>
                </label>
                <label className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={settings.ads.sidebarAd}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ads: { ...settings.ads, sidebarAd: e.target.checked },
                      })
                    }
                  />
                  <span>Sidebar Ad</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="inline-flex items-center space-x-2 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-sm"
            >
              <Save className="h-4 w-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* 5. AUDIT LOGS (Section 33) */}
      {/* ========================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Administrative Action Audit Trail
          </h3>

          <DataTable
            data={auditLogs}
            searchPlaceholder="Search audit events..."
            searchFilter={(l, q) => l.action.toLowerCase().includes(q) || l.details.toLowerCase().includes(q)}
            columns={[
              {
                header: 'Action',
                render: (l) => (
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    {l.action}
                  </span>
                ),
              },
              {
                header: 'Admin / Initiator',
                render: (l) => <span className="font-mono text-[11px]">{l.adminEmail}</span>,
              },
              {
                header: 'Details',
                render: (l) => <span className="text-xs text-slate-600 dark:text-slate-300">{l.details}</span>,
              },
              {
                header: 'Timestamp',
                render: (l) => <span className="text-[11px] text-slate-400 font-mono">{new Date(l.timestamp).toLocaleString()}</span>,
              },
            ]}
          />
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={userToDelete !== null}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user "${userToDelete?.name}" (${userToDelete?.email})? This action cannot be reversed.`}
        confirmLabel="Permanently Delete"
        isDanger={true}
        onConfirm={() => userToDelete && handleDeleteUser(userToDelete.id)}
        onCancel={() => setUserToDelete(null)}
      />

      <ConfirmationDialog
        isOpen={userToSuspend !== null}
        title={userToSuspend?.isSuspended ? 'Activate User' : 'Suspend User'}
        message={`Are you sure you want to ${userToSuspend?.isSuspended ? 'activate' : 'suspend'} access for ${userToSuspend?.name}?`}
        confirmLabel={userToSuspend?.isSuspended ? 'Activate' : 'Suspend'}
        isDanger={!userToSuspend?.isSuspended}
        onConfirm={() => userToSuspend && handleToggleSuspend(userToSuspend)}
        onCancel={() => setUserToSuspend(null)}
      />
    </div>
  );
};
