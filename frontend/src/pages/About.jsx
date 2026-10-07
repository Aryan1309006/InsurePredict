import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Database, 
  BarChart, 
  CheckCircle2, 
  ShieldAlert, 
  Layers, 
  ArrowRight,
  GitBranch,
  Terminal,
  Activity
} from 'lucide-react';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModelData() {
      try {
        const info = await apiService.getModelInfo();
        setModelInfo(info);
      } catch (err) {
        console.warn('Error fetching model info:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchModelData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 mb-3">
          <Activity className="w-3.5 h-3.5" />
          <span>Machine Learning Specifications</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Model Performance & Methodology
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Detailed breakdown of the supervised regression pipeline, cross-validation metrics, and feature transformations powering InsurePredict.
        </p>
      </div>

      {/* Model Spec Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-400 block">Selected Algorithm</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {modelInfo?.algorithm || 'Gradient Boosting Regressor'}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-400 block">Dataset</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            Medical Cost Personal (1,338 rows)
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-400 block">Target Variable</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            charges (Annual USD)
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <BarChart className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-400 block">Evaluation R²</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">
            {modelInfo?.metrics?.r2 ? modelInfo.metrics.r2 : '0.8809'}
          </p>
        </div>

      </div>

      {/* Model Benchmark Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Regression Candidate Comparison
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Every candidate model was trained and evaluated on an identical 80/20 train/test split.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-400">
                <th className="pb-3">Candidate Model</th>
                <th className="pb-3">R² Score</th>
                <th className="pb-3">Mean Absolute Error (MAE)</th>
                <th className="pb-3">Root Mean Squared Error (RMSE)</th>
                <th className="pb-3 text-right">Selected Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {modelInfo?.comparison ? (
                Object.entries(modelInfo.comparison).map(([name, m]) => {
                  const isBest = name === modelInfo.algorithm;
                  return (
                    <tr key={name} className={isBest ? 'bg-blue-50/50 dark:bg-blue-950/40 font-semibold' : ''}>
                      <td className="py-4 font-sans text-slate-900 dark:text-white flex items-center gap-2">
                        {name}
                        {isBest && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">Winner</span>}
                      </td>
                      <td className="py-4 text-blue-600 dark:text-blue-400 font-bold">{m.r2}</td>
                      <td className="py-4 text-emerald-600 dark:text-emerald-400">${m.mae.toLocaleString()}</td>
                      <td className="py-4 text-slate-700 dark:text-slate-300">${m.rmse.toLocaleString()}</td>
                      <td className="py-4 text-right font-sans">
                        {isBest ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-4 h-4" /> Deployed in API
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Benchmarked</span>
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

      {/* Feature Engineering & Transformation Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-blue-600" />
            Preprocessing Pipeline
          </h3>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <span><strong>Numerical Features:</strong> `age`, `bmi`, `children` scaled using <code>StandardScaler()</code> to prevent weight skew.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <span><strong>Categorical Features:</strong> `sex`, `smoker`, `region` encoded via <code>OneHotEncoder(handle_unknown='ignore')</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <span><strong>Pipeline Composition:</strong> Bundled inside a <code>sklearn.pipeline.Pipeline</code> and serialized with <code>joblib</code>.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-600" />
            FastAPI Inference Architecture
          </h3>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
              <span><strong>Pydantic Strict Validation:</strong> Boundary checks for age (18-100), BMI (10-60), and valid enumeration values.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
              <span><strong>In-Memory Model Caching:</strong> Pipeline loaded as a singleton during application startup for sub-millisecond inference.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
              <span><strong>What-If Simulation Endpoint:</strong> Real-time perturbation calculations for smoking cessation and BMI targets.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Underwriting Disclaimer Card */}
      <div className="p-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-start gap-4 text-sm text-amber-800 dark:text-amber-300">
        <ShieldAlert className="w-6 h-6 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div className="space-y-1">
          <p className="font-bold">Underwriting & Educational Disclaimer</p>
          <p className="leading-relaxed">
            InsurePredict provides statistical regression estimates based on historical medical cost data for educational demonstration.
            Actual health insurance premiums in the United States and elsewhere depend on carrier actuarial filings, deductibles, co-pays, tobacco cessation programs, geographic rating areas, and state insurance regulations.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <button
          onClick={() => navigate('/predictor')}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 transition transform hover:-translate-y-0.5"
        >
          <span>Try The Predictor Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
