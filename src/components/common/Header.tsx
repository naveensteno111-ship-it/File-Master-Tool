import React, { useState } from 'react';
import {
  Layers,
  Moon,
  Sun,
  Search,
  Menu,
  X,
  Upload,
  History,
  ShieldAlert,
  User as UserIcon,
  LogOut,
  Sparkles,
  Zap,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
  onOpenPricing: () => void;
  onOpenAuth: () => void;
  onQuickUpload: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  onOpenSearch,
  onOpenPricing,
  onOpenAuth,
  onQuickUpload,
  isDark,
  onToggleTheme,
}) => {
  const { user, isAuthenticated, isAdmin, usage, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Home', route: 'home' },
    { label: 'PDF Tools', route: 'category:pdf' },
    { label: 'Image Tools', route: 'category:image' },
    { label: 'Document Tools', route: 'category:document' },
    { label: 'Compress', route: 'tool:image-compressor' },
    { label: 'Convert', route: 'tool:jpg-to-pdf' },
    { label: 'Merge', route: 'tool:merge-pdf' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('home')}
            className="group flex items-center space-x-2.5 text-left focus:outline-none"
            aria-label="FileMaster Tools Home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                FileMaster <span className="text-blue-600 dark:text-blue-400 font-bold">Tools</span>
              </span>
              <span className="hidden sm:block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Convert • Compress • Merge
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <button
              key={link.route}
              onClick={() => onNavigate(link.route)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                currentRoute === link.route
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Action Controls & Utilities */}
        <div className="flex items-center space-x-2.5">
          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800 transition"
            aria-label="Search tools"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden md:inline rounded bg-slate-200/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>

          {/* Daily Usage Pill (if usage available) */}
          {usage && (
            <button
              onClick={onOpenPricing}
              className="hidden xl:flex items-center space-x-1.5 rounded-xl border border-blue-200 bg-blue-50/60 px-2.5 py-1 text-[11px] font-mono font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
              title="Daily Conversion Allowance"
            >
              <Zap className="h-3 w-3 text-amber-500" />
              <span>{usage.remainingToday}/{usage.dailyLimit} left</span>
            </button>
          )}

          {/* Dashboard Icon */}
          <button
            onClick={() => onNavigate('dashboard')}
            className={`hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border transition ${
              currentRoute === 'dashboard'
                ? 'border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-400'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            title="User Dashboard & History"
            aria-label="Dashboard"
          >
            <History className="h-4 w-4" />
          </button>

          {/* Admin Panel Button (visible if Admin) */}
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`flex items-center space-x-1.5 rounded-xl border border-red-200 bg-red-50/80 px-2.5 py-1.5 text-xs font-bold text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400 hover:bg-red-100 transition ${
                currentRoute === 'admin' ? 'ring-2 ring-red-500' : ''
              }`}
              title="Admin Management Panel"
            >
              <ShieldAlert className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* User Profile / Auth Button */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
                <span className="rounded bg-blue-100 px-1 py-0.2 text-[9px] font-bold uppercase text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {user.plan}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-950 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <History className="h-3.5 w-3.5 text-slate-400" />
                    <span>My Workspace</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => onNavigate('admin')}
                      className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                      <span>Admin Control Panel</span>
                    </button>
                  )}

                  <button
                    onClick={onOpenPricing}
                    className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                    <span>Upgrade Plan</span>
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  <button
                    onClick={logout}
                    className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition"
            >
              <UserIcon className="h-3.5 w-3.5 text-slate-500" />
              <span>Sign In</span>
            </button>
          )}

          {/* Prominent Upload CTA */}
          <button
            onClick={onQuickUpload}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition"
          >
            <Upload className="h-4 w-4" />
            <span className="font-semibold hidden sm:inline">Upload</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 shadow-xl dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col space-y-2 pt-2">
            {navLinks.map((link) => (
              <button
                key={link.route}
                onClick={() => {
                  onNavigate(link.route);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  currentRoute === link.route
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900'
                }`}
              >
                <span>{link.label}</span>
              </button>
            ))}

            <button
              onClick={() => {
                onNavigate('dashboard');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              <History className="h-4 w-4 text-blue-600" />
              <span>Workspace Dashboard</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 rounded-lg px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Admin Management Panel</span>
              </button>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <button onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }}>About</button>
              <button onClick={() => { onNavigate('contact'); setMobileMenuOpen(false); }}>Contact</button>
              <button onClick={() => { onNavigate('privacy'); setMobileMenuOpen(false); }}>Privacy</button>
              <button onClick={() => { onNavigate('terms'); setMobileMenuOpen(false); }}>Terms</button>
              <button onClick={() => { onNavigate('cookies'); setMobileMenuOpen(false); }}>Cookies</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
