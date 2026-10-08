import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  DollarSign,
  Calendar,
  Calculator,
  ArrowRight,
  TrendingUp,
  History as HistoryIcon,
  Trash2,
  Sparkles,
  AlertCircle,
  Loader2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, predsData] = await Promise.all([
        apiService.getStats(),
        apiService.getPredictions(),
      ]);
      setStats(statsData);
      setPredictions(predsData.predictions || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prediction record?')) {
      return;
    }
    try {
      setDeletingId(id);
      await apiService.deletePrediction(id);
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to delete prediction.');
    } finally {
      setDeletingId(null);
    }
  };

  const total = stats?.total_predictions ?? predictions.length;
  const avgCost = stats?.average_cost ?? 0;
  const latestCost = stats?.latest_cost ?? (predictions[0]?.predicted_cost || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Personal Health Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome, {user?.name || 'User'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time overview of your insurance calculations stored in MongoDB Atlas
          </p>
        </div>

        <button
          onClick={() => navigate('/predictor')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 self-start sm:self-auto"
        >
          <Calculator className="w-4 h-4" />
          <span>New Prediction</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Real MongoDB Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total Predictions */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 block">
              Total Predictions
            </span>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">
              {loading ? '...' : total}
            </span>
            <span className="text-xs text-slate-400 mt-1 block">
              Saved in your MongoDB account
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        {/* Avg. Estimated Cost */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 block">
              Average Estimated Cost
            </span>
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {loading ? '...' : `$${Math.round(avgCost).toLocaleString()}`}
            </span>
            <span className="text-xs text-slate-400 mt-1 block">
              Across your historical queries
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
            <DollarSign className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Latest Prediction */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 block">
              Latest Prediction
            </span>
            <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1 block">
              {loading ? '...' : (total > 0 ? `$${Math.round(latestCost).toLocaleString()}` : '—')}
            </span>
            <span className="text-xs text-slate-400 mt-1 block">
              {total > 0 ? 'Most recent simulation' : 'No records yet'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-inner">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Recent Predictions Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Predictions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Securely stored in your personal MongoDB Atlas database collection
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-500" />
            <span className="text-xs">Loading records from MongoDB...</span>
          </div>
        ) : predictions.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
              <Calculator className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No predictions generated yet
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Run your first insurance estimate using our machine learning model to start tracking personal historical costs.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/predictor')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                <span>Make a Prediction</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Age / Sex</th>
                  <th className="py-3 px-4">BMI</th>
                  <th className="py-3 px-4">Smoker</th>
                  <th className="py-3 px-4">Children</th>
                  <th className="py-3 px-4">Region</th>
                  <th className="py-3 px-4 text-right">Est. Cost</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {predictions.slice(0, 5).map((item) => {
                  const dateStr = item.created_at
                    ? new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition text-slate-700 dark:text-slate-300"
                    >
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {item.age} yrs • {item.sex}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800">
                          {Number(item.bmi).toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            item.smoker.toLowerCase() === 'yes'
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                          }`}
                        >
                          {item.smoker}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{item.children}</td>
                      <td className="py-3.5 px-4 capitalize">{item.region}</td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-blue-600 dark:text-blue-400">
                        ${Math.round(item.predicted_cost).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          title="Delete prediction"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition disabled:opacity-50"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
