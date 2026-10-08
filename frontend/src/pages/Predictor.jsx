import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  ShieldCheck, 
  Users, 
  AlertCircle, 
  Loader2, 
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { apiService } from '../services/api';


export default function Predictor({ setLastResult }) {
  const navigate = useNavigate();

  // Form State initialized to reference image default values (32, male, 26.4, 2, no, southeast)
  const [formData, setFormData] = useState({
    age: 32,
    sex: 'male',
    bmi: 26.4,
    children: 2,
    smoker: 'no',
    region: 'southeast',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validate = () => {
    const errs = {};
    const ageNum = Number(formData.age);
    if (!formData.age || isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      errs.age = 'Please enter a valid age between 18 and 100.';
    }

    const bmiNum = Number(formData.bmi);
    if (!formData.bmi || isNaN(bmiNum) || bmiNum < 10 || bmiNum > 60) {
      errs.bmi = 'BMI must be between 10 and 60.';
    }

    if (!['male', 'female'].includes(formData.sex)) {
      errs.sex = 'Please select your biological sex.';
    }

    const childNum = Number(formData.children);
    if (isNaN(childNum) || childNum < 0 || childNum > 10) {
      errs.children = 'Children count must be between 0 and 10.';
    }

    if (!['yes', 'no'].includes(formData.smoker)) {
      errs.smoker = 'Please select smoking status.';
    }

    if (!['northeast', 'northwest', 'southeast', 'southwest'].includes(formData.region)) {
      errs.region = 'Please select your region.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError(null);

    try {
      const payload = {
        age: parseInt(formData.age, 10),
        sex: formData.sex,
        bmi: parseFloat(Number(formData.bmi).toFixed(1)),
        children: parseInt(formData.children, 10),
        smoker: formData.smoker,
        region: formData.region,
      };

      const result = await apiService.predictCost(payload);

      const savedEntry = {
        age: payload.age,
        sex: payload.sex,
        bmi: payload.bmi,
        children: payload.children,
        smoker: payload.smoker,
        region: payload.region,
        estimatedCost: Math.round(result.predicted_cost),
        monthlyCost: Math.round(result.monthly_cost),
        factors: result.factors,
        confidence_label: result.confidence_label,
      };

      if (setLastResult) {
        setLastResult({
          prediction: result,
          input: payload,
          entry: savedEntry,
        });
      }

      // Pass result via router state to /result
      navigate('/result', {
        state: {
          prediction: result,
          input: payload,
          entry: savedEntry,
        },
      });
    } catch (err) {
      console.error('Prediction submission error:', err);
      setServerError(err.message || 'Unable to calculate prediction. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Health Insurance Cost Predictor
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Fill in the details below to get your estimated annual insurance cost.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3 text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Unable to calculate prediction</p>
            <p className="mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Form Left, Info Cards Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Card */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Row 1: Age & BMI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Age */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="age" className="block text-sm font-semibold text-slate-900 dark:text-white">
                    Age
                  </label>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {formData.age} years
                  </span>
                </div>
                <input
                  type="number"
                  id="age"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                    errors.age ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                  placeholder="32"
                />
                <input
                  type="range"
                  min="18"
                  max="100"
                  value={formData.age || 18}
                  onChange={(e) => handleChange('age', Number(e.target.value))}
                  aria-label="Age slider"
                  className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>18</span>
                  <span>100</span>
                </div>
                {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
              </div>

              {/* BMI */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="bmi" className="block text-sm font-semibold text-slate-900 dark:text-white">
                    BMI
                  </label>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {formData.bmi} kg/m²
                  </span>
                </div>
                <input
                  type="number"
                  id="bmi"
                  step="0.1"
                  min="10"
                  max="60"
                  value={formData.bmi}
                  onChange={(e) => handleChange('bmi', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                    errors.bmi ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                  placeholder="26.4"
                />
                <input
                  type="range"
                  min="12"
                  max="50"
                  step="0.1"
                  value={formData.bmi || 12}
                  onChange={(e) => handleChange('bmi', parseFloat(e.target.value))}
                  aria-label="BMI slider"
                  className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>12</span>
                  <span>50</span>
                </div>
                {errors.bmi && <p className="text-xs text-red-500 mt-1">{errors.bmi}</p>}
              </div>

            </div>

            {/* Row 2: Sex & Children */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Sex Segmented Control */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Sex
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleChange('sex', 'male')}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      formData.sex === 'male'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('sex', 'female')}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      formData.sex === 'female'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Female
                  </button>
                </div>
                {errors.sex && <p className="text-xs text-red-500 mt-1">{errors.sex}</p>}
              </div>

              {/* Children Dropdown / Stepper */}
              <div className="space-y-2">
                <label htmlFor="children" className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Children
                </label>
                <select
                  id="children"
                  value={formData.children}
                  onChange={(e) => handleChange('children', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                    errors.children ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <option value="0">0 dependents</option>
                  <option value="1">1 dependent</option>
                  <option value="2">2 dependents</option>
                  <option value="3">3 dependents</option>
                  <option value="4">4 dependents</option>
                  <option value="5">5 dependents</option>
                </select>
                {errors.children && <p className="text-xs text-red-500 mt-1">{errors.children}</p>}
              </div>

            </div>

            {/* Row 3: Smoker & Region */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Smoker Segmented Control */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Smoker
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleChange('smoker', 'no')}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      formData.smoker === 'no'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('smoker', 'yes')}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      formData.smoker === 'yes'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Yes
                  </button>
                </div>
                {errors.smoker && <p className="text-xs text-red-500 mt-1">{errors.smoker}</p>}
              </div>

              {/* Region Dropdown */}
              <div className="space-y-2">
                <label htmlFor="region" className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Region
                </label>
                <select
                  id="region"
                  value={formData.region}
                  onChange={(e) => handleChange('region', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition capitalize ${
                    errors.region ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <option value="northeast">Northeast</option>
                  <option value="northwest">Northwest</option>
                  <option value="southeast">Southeast</option>
                  <option value="southwest">Southwest</option>
                </select>
                {errors.region && <p className="text-xs text-red-500 mt-1">{errors.region}</p>}
              </div>

            </div>

            {/* Calculate Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Calculating your estimate...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="w-5 h-5" />
                    <span>Calculate Insurance Cost</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Why It Matters & Info Graphic Cards */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Why It Matters */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Why It Matters?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Understanding your potential health insurance cost helps you plan better for your and your family's future.
            </p>
          </div>

          {/* Card 2: Soft Healthcare Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-blue-50/40 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-blue-950/20 border border-emerald-100/80 dark:border-emerald-900/30 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-teal-100/70 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                Better insight.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Healthier tomorrow.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
