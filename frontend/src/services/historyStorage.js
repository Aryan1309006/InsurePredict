const STORAGE_KEY = 'insurepredict_history_v1';

const INITIAL_SEEDS = [
  {
    id: 'seed-1',
    date: 'Apr 24, 2025',
    timestamp: 1745499600000,
    age: 32,
    sex: 'Male',
    bmi: 26.4,
    children: 2,
    smoker: 'No',
    region: 'Southeast',
    estimatedCost: 12480,
    monthlyCost: 1040,
  },
  {
    id: 'seed-2',
    date: 'Apr 23, 2025',
    timestamp: 1745413200000,
    age: 45,
    sex: 'Female',
    bmi: 28.7,
    children: 1,
    smoker: 'Yes',
    region: 'Southwest',
    estimatedCost: 27320,
    monthlyCost: 2276.67,
  },
  {
    id: 'seed-3',
    date: 'Apr 22, 2025',
    timestamp: 1745326800000,
    age: 28,
    sex: 'Male',
    bmi: 24.1,
    children: 0,
    smoker: 'No',
    region: 'Northwest',
    estimatedCost: 8760,
    monthlyCost: 730,
  },
  {
    id: 'seed-4',
    date: 'Apr 21, 2025',
    timestamp: 1745240400000,
    age: 52,
    sex: 'Female',
    bmi: 31.2,
    children: 3,
    smoker: 'No',
    region: 'Northeast',
    estimatedCost: 18450,
    monthlyCost: 1537.5,
  },
  {
    id: 'seed-5',
    date: 'Apr 20, 2025',
    timestamp: 1745154000000,
    age: 36,
    sex: 'Male',
    bmi: 27.6,
    children: 1,
    smoker: 'Yes',
    region: 'Southeast',
    estimatedCost: 23990,
    monthlyCost: 1999.17,
  },
];

export const historyStorage = {
  getHistory() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEEDS));
        return INITIAL_SEEDS;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
      return INITIAL_SEEDS;
    }
  },

  savePrediction(prediction, inputData) {
    try {
      const currentList = this.getHistory();
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const newEntry = {
        id: `pred-${Date.now()}`,
        date: formattedDate,
        timestamp: now.getTime(),
        age: Number(inputData.age),
        sex: inputData.sex.charAt(0).toUpperCase() + inputData.sex.slice(1).toLowerCase(),
        bmi: parseFloat(Number(inputData.bmi).toFixed(1)),
        children: Number(inputData.children),
        smoker: inputData.smoker.toLowerCase() === 'yes' ? 'Yes' : 'No',
        region: inputData.region.charAt(0).toUpperCase() + inputData.region.slice(1).toLowerCase(),
        estimatedCost: Math.round(prediction.predicted_cost),
        monthlyCost: Math.round(prediction.monthly_cost),
        rawPredictedCost: prediction.predicted_cost,
        rawMonthlyCost: prediction.monthly_cost,
        factors: prediction.factors,
        confidence_label: prediction.confidence_label,
      };

      const updated = [newEntry, ...currentList];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return newEntry;
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      return null;
    }
  },

  clearHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  },

  resetToDefault() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEEDS));
      return INITIAL_SEEDS;
    } catch (e) {
      console.error('Failed to reset history:', e);
      return [];
    }
  },

  getStats() {
    const list = this.getHistory();
    if (!list || list.length === 0) {
      return {
        total: 0,
        averageCost: 0,
        latestCost: 0,
        list: [],
      };
    }

    const total = list.length;
    const sum = list.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);
    const avg = Math.round(sum / total);
    const latest = list[0].estimatedCost || 0;

    return {
      total,
      averageCost: avg,
      latestCost: latest,
      list,
    };
  },
};
