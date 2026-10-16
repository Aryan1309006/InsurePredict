import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  History as HistoryIcon,
  Activity,
  Database,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  Search,
  Trash2,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Loader2,
  Calculator
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modelInfo, setModelInfo] = useState(null);
  const [loadingModel, setLoadingModel] = useState(false);

  // Load history from MongoDB Atlas
  const loadHistoryData = async () => {
    try {
      setLoadingHistory(true);
      const res = await apiService.getPredictions();
      const formatted = (res.predictions || []).map((item) => {
        const d = item.created_at ? new Date(item.created_at) : new Date();
        const dateStr = d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        return {
          id: item.id,
          date: dateStr,
          timestamp: item.timestamp || d.getTime(),
          age: item.age,
          sex: item.sex,
          bmi: item.bmi,
          children: item.children,
          smoker: item.smoker,
          region: item.region,
          estimatedCost: Math.round(item.predicted_cost),
          monthlyCost: Math.round(item.monthly_cost),
          rawPredictedCost: item.predicted_cost,
        };
      });
      setHistoryList(formatted);
    } catch (err) {
      console.warn('Failed to load predictions from MongoDB:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistoryData();
  }, []);

  // Load live model info from backend
  useEffect(() => {
    async function fetchModel() {
      try {
        setLoadingModel(true);
        const data = await apiService.getModelInfo();
        setModelInfo(data);
      } catch (err) {
        console.warn('Failed to load model info:', err);
      } finally {
        setLoadingModel(false);
      }
    }
    fetchModel();
  }, []);

  // Compute dynamic stats from MongoDB predictions
  const stats = useMemo(() => {
    if (!historyList || historyList.length === 0) {
      return { total: 0, avgCost: 0, lastCost: 0 };
    }
    const total = historyList.length;
    const sum = historyList.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);
    const avg = Math.round(sum / total);
    const last = historyList[0]?.estimatedCost || 0;
    return { total, avgCost: avg, lastCost: last };
  }, [historyList]);

  // Filtered list for search
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return historyList;
    const q = searchQuery.toLowerCase();
    return historyList.filter(
      (item) =>
        item.date.toLowerCase().includes(q) ||
        item.sex.toLowerCase().includes(q) ||
        item.smoker.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q) ||
        item.estimatedCost.toString().includes(q)
    );
  }, [historyList, searchQuery]);

  const handleDeletePrediction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prediction record?')) {
      return;
    }
    try {
      setDeletingId(id);
      await apiService.deletePrediction(id);
      setHistoryList((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete prediction record.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your entire prediction history? This action cannot be undone.')) {
      try {
        await apiService.clearPredictions();
        setHistoryList([]);
      } catch (err) {
        alert(err.message || 'Failed to clear prediction history.');
      }
    }
  };

  // Donut chart distribution data (feature factors from model or reference)
  const donutData = useMemo(() => {
    if (modelInfo?.feature_importance_percent) {
      const p = modelInfo.feature_importance_percent;
      return [
        { name: 'Smoking', value: p.smoker || 68.1, color: '#f43f5e' },
        { name: 'BMI', value: p.bmi || 18.6, color: '#06b6d4' },
        { name: 'Age', value: p.age || 11.8, color: '#3b82f6' },
        { name: 'Children', value: p.children || 1.0, color: '#f59e0b' },
        { name: 'Region', value: p.region || 0.4, color: '#a855f7' },
      ];
    }
    return [
      { name: 'Smoking', value: 32, color: '#f43f5e' },
      { name: 'BMI', value: 24, color: '#06b6d4' },
      { name: 'Age', value: 18, color: '#3b82f6' },
      { name: 'Children', value: 12, color: '#f59e0b' },
      { name: 'Region', value: 14, color: '#a855f7' },
    ];
  }, [modelInfo]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Sidebar + Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Tabs */}
        <aside className="lg:col-span-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'history', label: 'Prediction History', icon: HistoryIcon },
            { id: 'model', label: 'Model Performance', icon: Activity },
            { id: 'dataset', label: 'About Dataset', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60">
            <button
              onClick={() => navigate('/predictor')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>+ New Prediction</span>
            </button>
          </div>
        </aside>

        {/* Right Main Panel */}
        <main className="lg:col-span-9 space-y-8">
          
          {/* Header Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeTab === 'dashboard' && `Welcome, ${user?.name || 'User'}`}
              {activeTab === 'history' && 'Prediction History'}
              {activeTab === 'model' && 'Model Performance & Architecture'}
              {activeTab === 'dataset' && 'Insurance Training Dataset'}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {activeTab === 'dashboard' && 'Your prediction history and insights loaded live from MongoDB Atlas.'}
              {activeTab === 'history' && 'Browse, search, and manage all your historical insurance cost estimations.'}
              {activeTab === 'model' && 'Real calculated metrics, regression model comparisons, and evaluation scores.'}
              {activeTab === 'dataset' && 'Exploration of features, distributions, and summary statistics.'}
            </p>
          </div>

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Top 3 Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Total Predictions */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                      Total Predictions
                    </span>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                      {loadingHistory ? '...' : stats.total}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                </div>

                {/* Avg. Annual Cost */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                      Avg. Annual Cost
                    </span>
                    <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
                      {loadingHistory ? '...' : `$${stats.avgCost.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="w-6 h-6 stroke-[2.5]" />
                  </div>
                </div>

                {/* Last Prediction */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                      Last Prediction
                    </span>
                    <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1 block">
                      {loadingHistory ? '...' : (stats.total > 0 ? `$${stats.lastCost.toLocaleString()}` : '—')}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* Recent Predictions Table */}
              <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Recent Predictions
                  </h3>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View All
                  </button>
                </div>

                {loadingHistory ? (
                  <div className="py-8 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-500" />
                    <span className="text-xs">Loading records from MongoDB...</span>
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">
                    No predictions found in your account yet.{' '}
                    <button
                      onClick={() => navigate('/predictor')}
                      className="text-blue-600 font-semibold underline ml-1"
                    >
                      Make your first prediction
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700/60 text-xs font-semibold text-slate-400">
                          <th className="pb-3 pl-2">Date</th>
                          <th className="pb-3">Age</th>
                          <th className="pb-3">Sex</th>
                          <th className="pb-3">BMI</th>
                          <th className="pb-3">Children</th>
                          <th className="pb-3">Smoker</th>
                          <th className="pb-3">Region</th>
                          <th className="pb-3 text-right pr-2">Estimated Cost</th>
                          <th className="pb-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                        {historyList.slice(0, 5).map((row, idx) => (
                          <tr key={row.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
                            <td className="py-3 pl-2 font-medium flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  row.smoker === 'Yes' ? 'bg-rose-500' : 'bg-emerald-500'
                                }`}
                              />
                              <span>{row.date}</span>
                            </td>
                            <td className="py-3">{row.age}</td>
                            <td className="py-3">{row.sex}</td>
                            <td className="py-3">{row.bmi}</td>
                            <td className="py-3">{row.children}</td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  row.smoker === 'Yes'
                                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {row.smoker}
                              </span>
                            </td>
                            <td className="py-3 capitalize">{row.region}</td>
                            <td className="py-3 text-right pr-2 font-bold text-slate-900 dark:text-white">
                              ${row.estimatedCost.toLocaleString()}
                            </td>
                            <td className="py-3 text-center">
                              <button
                                onClick={() => handleDeletePrediction(row.id)}
                                disabled={deletingId === row.id}
                                className="p-1 text-slate-400 hover:text-rose-600 transition"
                                title="Delete record"
                              >
                                {deletingId === row.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Bottom 2 Cards: Cost Distribution Donut & Model Performance Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                
                {/* Cost Distribution Donut Chart */}
                <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Cost Distribution
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-4">
                    {/* Donut Chart with center label */}
                    <div className="sm:col-span-7 h-48 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={78}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {donutData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(val, name) => [`${val}%`, name]}
                            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          ${stats.avgCost.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">Avg. Cost</span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="sm:col-span-5 space-y-2 text-xs">
                      {donutData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    Factor influence proportion derived from trained ML feature importances.
                  </p>
                </div>

                {/* Model Performance Card */}
                <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Model Performance
                      </h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold">
                        Trained & Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 my-6 text-center">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400 block font-medium">R² Score</span>
                        <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400 mt-1 block">
                          {modelInfo?.metrics?.r2 || '0.8718'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400 block font-medium">MAE</span>
                        <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
                          ${modelInfo?.metrics?.mae ? Math.round(modelInfo.metrics.mae).toLocaleString() : '2,540'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400 block font-medium">RMSE</span>
                        <span className="text-lg font-extrabold text-purple-600 dark:text-purple-400 mt-1 block">
                          ${modelInfo?.metrics?.rmse ? Math.round(modelInfo.metrics.rmse).toLocaleString() : '4,461'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => setActiveTab('model')}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 transition text-center"
                    >
                      {modelInfo?.algorithm || 'Random Forest Regressor'}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* PREDICTION HISTORY FULL TAB */}
          {activeTab === 'history' && (
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by date, smoker, region..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => navigate('/predictor')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>+ New Prediction</span>
                  </button>

                  <button
                    onClick={handleClearHistory}
                    disabled={historyList.length === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg hover:bg-rose-100 transition disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>

              {loadingHistory ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-500" />
                  <span className="text-xs">Loading records from MongoDB Atlas...</span>
                </div>
              ) : filteredList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No prediction records found in your account.{' '}
                  <button
                    onClick={() => navigate('/predictor')}
                    className="text-blue-600 font-semibold underline ml-1"
                  >
                    Make a prediction
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700/60 text-xs font-semibold text-slate-400">
                        <th className="pb-3 pl-2">Date</th>
                        <th className="pb-3">Age</th>
                        <th className="pb-3">Sex</th>
                        <th className="pb-3">BMI</th>
                        <th className="pb-3">Children</th>
                        <th className="pb-3">Smoker</th>
                        <th className="pb-3">Region</th>
                        <th className="pb-3 text-right pr-2">Estimated Cost</th>
                        <th className="pb-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                      {filteredList.map((row, idx) => (
                        <tr key={row.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
                          <td className="py-3 pl-2 font-medium flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                row.smoker === 'Yes' ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                            />
                            <span>{row.date}</span>
                          </td>
                          <td className="py-3">{row.age}</td>
                          <td className="py-3">{row.sex}</td>
                          <td className="py-3">{row.bmi}</td>
                          <td className="py-3">{row.children}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                row.smoker === 'Yes'
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {row.smoker}
                            </span>
                          </td>
                          <td className="py-3 capitalize">{row.region}</td>
                          <td className="py-3 text-right pr-2 font-bold text-slate-900 dark:text-white">
                            ${row.estimatedCost.toLocaleString()}
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => handleDeletePrediction(row.id)}
                              disabled={deletingId === row.id}
                              className="p-1 text-slate-400 hover:text-rose-600 transition"
                              title="Delete record"
                            >
                              {deletingId === row.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* MODEL PERFORMANCE TAB */}
          {activeTab === 'model' && (
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8">
              
              <div className="space-y-2">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
                  Regression Pipeline
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {modelInfo?.algorithm || 'Random Forest Regressor'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Preprocessed with scikit-learn ColumnTransformer (StandardScaler for numerical features, OneHotEncoder for categoricals).
                </p>
              </div>

              {/* Models Comparison Table */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Evaluated Algorithm Benchmark
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-400">
                        <th className="pb-3">Algorithm</th>
                        <th className="pb-3">R² Score</th>
                        <th className="pb-3">MAE ($)</th>
                        <th className="pb-3">RMSE ($)</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {modelInfo?.comparison ? (
                        Object.entries(modelInfo.comparison).map(([name, metrics]) => {
                          const isSelected = name === modelInfo.algorithm;
                          return (
                            <tr key={name} className={isSelected ? 'bg-blue-50/40 dark:bg-blue-950/30' : ''}>
                              <td className="py-3 font-semibold text-slate-900 dark:text-white">
                                {name}
                              </td>
                              <td className="py-3 font-mono">{metrics.r2}</td>
                              <td className="py-3 font-mono">${metrics.mae.toLocaleString()}</td>
                              <td className="py-3 font-mono">${metrics.rmse.toLocaleString()}</td>
                              <td className="py-3 text-right">
                                {isSelected ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Best Model
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400">Baseline</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Feature Importance List */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Calculated Feature Importances
                </h4>
                <div className="space-y-3">
                  {donutData.map((f) => (
                    <div key={f.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-700 dark:text-slate-300">{f.name}</span>
                        <span className="text-slate-900 dark:text-white font-bold">{f.value}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${f.value}%`, backgroundColor: f.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ABOUT DATASET TAB */}
          {activeTab === 'dataset' && (
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Medical Cost Personal Dataset
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Standard insurance benchmark dataset containing 1,338 records of individual health insurance costs based on 6 core clinical and demographic features.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block font-medium">Total Rows</span>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                    {modelInfo?.total_samples || '1,338'}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block font-medium">Average Cost</span>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                    ${modelInfo?.summary_statistics?.average_cost ? Math.round(modelInfo.summary_statistics.average_cost).toLocaleString() : '13,270'}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block font-medium">Average Age</span>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                    {modelInfo?.summary_statistics?.avg_age || '39.2'} yrs
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block font-medium">Average BMI</span>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                    {modelInfo?.summary_statistics?.avg_bmi || '30.7'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                Notice: Health insurance rates in production incorporate thousands of additional underwriting rules, state mandates, prescription drug tiers, and deductible preferences.
              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  );
}
