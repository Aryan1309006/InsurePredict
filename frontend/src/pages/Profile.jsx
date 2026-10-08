import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Calendar, 
  BarChart3, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Calculator,
  History as HistoryIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingStats(true);
        await refreshUser();
        const statsData = await apiService.getStats();
        setStats(statsData);
      } catch (e) {
        console.warn('Failed to load stats for profile:', e);
      } finally {
        setLoadingStats(false);
      }
    }
    loadData();
  }, [refreshUser]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  const totalPredictions = stats ? stats.total_predictions : (user?.total_predictions ?? 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Security & Account</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          User Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your authenticated account details and prediction records
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm space-y-8">
        
        {/* User Identity Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-400 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-blue-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {user?.name || 'User'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{user?.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/60 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Full Name */}
          <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <User className="w-4 h-4 text-blue-500" />
              <span>Full Name</span>
            </div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              {user?.name || '—'}
            </p>
          </div>

          {/* Email Address */}
          <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Mail className="w-4 h-4 text-teal-500" />
              <span>Email Address</span>
            </div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              {user?.email || '—'}
            </p>
          </div>

          {/* Account Created */}
          <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span>Account Created</span>
            </div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              {formattedDate}
            </p>
          </div>

          {/* Total Predictions */}
          <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span>Total Predictions</span>
            </div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              {totalPredictions}
            </p>
          </div>

        </div>

        {/* Quick Links */}
        <div className="pt-4 flex flex-wrap items-center gap-4">
          <Link
            to="/predictor"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
          >
            <Calculator className="w-4 h-4" />
            <span>+ New Prediction</span>
          </Link>
          <Link
            to="/history"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <HistoryIcon className="w-4 h-4" />
            <span>View Full History</span>
          </Link>
        </div>

      </div>

    </div>
  );
}
