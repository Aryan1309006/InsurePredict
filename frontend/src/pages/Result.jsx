import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Info,
  Shield,
  User,
  Activity,
  Cigarette,
  Users,
  MapPin,
  TrendingDown,
  TrendingUp,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Sliders,
  DollarSign
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { apiService } from '../services/api';

export default function Result({ lastResult }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Try router state, then fallback prop, then fallback to realistic default
  const resultData = location.state?.prediction || lastResult?.prediction || {
    predicted_cost: 12480.50,
    monthly_cost: 1040.04,
    confidence_label: 'Model Estimate',
    model_algorithm: 'Gradient Boosting Regressor',
    factors: {
      age: { value: 32, display: '32 yrs', impact_level: 'Low', feature_importance_pct: 11.8 },
      bmi: { value: 26.4, display: '26.4', impact_level: 'Moderate', feature_importance_pct: 18.6 },
      smoking: { value: 'No', display: 'No', impact_level: 'Low', feature_importance_pct: 68.1 },
      children: { value: 2, display: '2', impact_level: 'Low', feature_importance_pct: 1.0 },
      region: { value: 'Southeast', display: 'Southeast', impact_level: 'Minimal', feature_importance_pct: 0.4 },
    },
  };

  const inputData = location.state?.input || lastResult?.input || {
    age: 32,
    sex: 'male',
    bmi: 26.4,
    children: 2,
    smoker: 'no',
    region: 'southeast',
  };

  const [whatIfData, setWhatIfData] = useState(null);
  const [loadingWhatIf, setLoadingWhatIf] = useState(false);

  // Fetch What-If scenarios from backend
  useEffect(() => {
    let isMounted = true;
    async function fetchWhatIf() {
      try {
        setLoadingWhatIf(true);
        const res = await apiService.getWhatIf(inputData);
        if (isMounted) setWhatIfData(res);
      } catch (err) {
        console.warn('What-If simulation fetch error:', err);
      } finally {
        if (isMounted) setLoadingWhatIf(false);
      }
    }
    fetchWhatIf();
    return () => {
      isMounted = false;
    };
  }, [inputData]);

  const formattedCost = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(resultData.predicted_cost);

  const formattedMonthly = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(resultData.monthly_cost);

  // Chart data for "How Your Input Compares"
  const chartData = [
    { name: 'Age', value: Number(inputData.age), unit: 'yrs', max: 100, color: '#3b82f6' },
    { name: 'BMI', value: Number(inputData.bmi), unit: 'kg/m²', max: 60, color: '#06b6d4' },
    { name: 'Children', value: Number(inputData.children), unit: 'deps', max: 5, color: '#f59e0b' },
    { name: 'Smoker', value: inputData.smoker.toLowerCase() === 'yes' ? 100 : 0, display: inputData.smoker.toUpperCase(), color: '#10b981' },
    { name: 'Region', value: 50, display: inputData.region.toUpperCase(), color: '#8b5cf6' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      
      {/* Back Link */}
      <div>
        <button
          onClick={() => navigate('/predictor')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Form</span>
        </button>
      </div>

      {/* Top 2 Cards: Main Result Left, Prediction Factors Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Card: Main Estimate Display */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Header with green icon badge */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Estimated Annual Insurance Cost
                </p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight mt-1">
                  {formattedCost}
                </h2>
              </div>
            </div>

            {/* Sub-cards row: Monthly Estimate & Model Confidence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                  Monthly Estimate
                </span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {formattedMonthly}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                  Model Confidence
                </span>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {resultData.confidence_label || 'Model Estimate'}
                  </span>
                </div>
              </div>

            </div>

            {/* Disclaimer Callout Box */}
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-start gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                This is an estimated cost based on our machine learning model.
                Actual premiums may vary depending on your insurer, medical records, and additional underwriting factors.
              </p>
            </div>

          </div>

          {/* Calculate Again Outline Button */}
          <div className="pt-6">
            <button
              onClick={() => navigate('/predictor')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/80 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Calculate Again</span>
            </button>
          </div>
        </div>

        {/* Right Card: Prediction Factors */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Prediction Factors
            </h3>

            {/* Factor items matching reference layout */}
            <div className="mt-5 space-y-4">
              
              {/* Age Factor */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 w-28">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Age</span>
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-slate-100 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full" 
                      style={{ width: `${Math.min(100, Math.max(15, (Number(inputData.age) / 80) * 100))}%` }} 
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white w-10 text-right">
                  {inputData.age}
                </span>
              </div>

              {/* BMI Factor */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 w-28">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-600">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">BMI</span>
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-slate-100 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-cyan-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, Math.max(15, (Number(inputData.bmi) / 50) * 100))}%` }} 
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white w-10 text-right">
                  {Number(inputData.bmi).toFixed(1)}
                </span>
              </div>

              {/* Smoking Factor */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 w-28">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                    <Cigarette className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Smoking</span>
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-slate-100 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full" 
                      style={{ width: inputData.smoker.toLowerCase() === 'yes' ? '100%' : '20%' }} 
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white w-10 text-right capitalize">
                  {inputData.smoker}
                </span>
              </div>

              {/* Children Factor */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 w-28">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Children</span>
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-slate-100 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, Math.max(15, (Number(inputData.children) / 5) * 100))}%` }} 
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white w-10 text-right">
                  {inputData.children}
                </span>
              </div>

              {/* Region Factor */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 w-28">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Region</span>
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-slate-100 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full w-2/3" />
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white w-20 text-right capitalize truncate">
                  {inputData.region}
                </span>
              </div>

            </div>
          </div>

          {/* Top Factors Affecting Cost Callout */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                Top Factors Affecting Cost
              </p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5 leading-relaxed">
                Smoking status, BMI and age have the highest impact on your estimated cost.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Section 1: How Your Input Compares Bar Chart */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            How Your Input Compares
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Relative scale distribution of your submitted metrics
          </p>
        </div>

        <div className="h-48 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
                        <span className="font-semibold">{d.name}: </span>
                        <span>{d.display || `${d.value} ${d.unit}`}</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section 2: What-If Simulator (Requirement #11) */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              What-If Scenario Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time model recalculation showing potential savings or cost shifts if your habits or demographics change.
            </p>
          </div>
        </div>

        {loadingWhatIf ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            Calculating What-If scenarios using machine learning model...
          </div>
        ) : whatIfData?.scenarios ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {whatIfData.scenarios.map((sc) => {
              const isSavings = sc.difference < 0;
              return (
                <div
                  key={sc.id}
                  className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between space-y-4 hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                        {sc.title}
                      </h4>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isSavings
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                        }`}
                      >
                        {isSavings ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        {Math.abs(sc.percent_change)}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {sc.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-end justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Projected Cost</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        ${sc.simulated_cost.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Difference</span>
                      <span className={`text-xs font-bold ${isSavings ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isSavings ? '-' : '+'}${Math.abs(sc.difference).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

    </div>
  );
}
