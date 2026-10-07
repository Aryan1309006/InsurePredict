# InsurePredict — AI-Powered Health Insurance Cost Predictor

> **Tagline:** AI-Powered Health Insurance Cost Predictor  
> A full-stack, production-quality application built with **React**, **FastAPI**, and **Machine Learning** that predicts annual health insurance premiums based on individual demographics and lifestyle factors.

---

## 📸 Overview & Design Reference

InsurePredict faithfully implements the clean healthcare aesthetic and dashboard structure from the reference design:

1. **Home / Landing Page** — Healthcare hero section with interactive 3D shield illustration, feature benefit cards, and key input feature highlights.
2. **Predictor Page** — Form with numeric inputs, range sliders, segmented toggles (Sex, Smoker), dropdowns (Children, Region), and input validation.
3. **Result View** — Annual cost estimate display, monthly breakdown, model confidence badge, prediction factor visualizer, comparative distribution chart, and an interactive **What-If Scenario Simulator**.
4. **Dashboard & History** — Dynamic analytics dashboard with live aggregate statistics (Total Predictions, Avg. Annual Cost, Last Prediction), recent predictions table with search and filters, factor distribution donut chart, and model performance metrics.
5. **Model Specs (About)** — Live benchmark comparisons, train/test split details, R² / MAE / RMSE evaluation metrics, and preprocessing pipeline architecture.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS (with persistent Light / Dark mode support)
- **Routing:** React Router v7
- **HTTP Client:** Axios (with timeout, error handling, and backend offline detection)
- **Data Visualization:** Recharts (Donut chart, comparative bar chart)
- **Icons:** Lucide React

### Backend & Machine Learning
- **API Framework:** FastAPI + Uvicorn
- **Validation:** Pydantic v2
- **Data Science:** Pandas, NumPy, Scikit-Learn
- **Model Serialization:** Joblib
- **Machine Learning Pipeline:**
  - Evaluates **Linear Regression**, **Random Forest Regressor**, and **Gradient Boosting Regressor**
  - Feature transformation with `ColumnTransformer` (`StandardScaler` for numeric features, `OneHotEncoder` for categoricals)
  - Automatically selects the highest-scoring model (`R² = 0.8809`, `MAE = $2,405.10`)
  - Persists the trained pipeline and real metadata/feature importances

---

## 📁 Project Structure

```
insurepredict/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Header with navigation, theme toggle & avatar
│   │   │   ├── Footer.jsx          # Legal underwriting disclaimer & quick links
│   │   │   └── HeroGraphic.jsx     # 3D medical shield & stethoscope SVG illustration
│   │   ├── context/
│   │   │   └── ThemeContext.jsx    # Persistent dark/light theme provider
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Landing page (Panel 1)
│   │   │   ├── Predictor.jsx       # Interactive form & validation (Panel 2)
│   │   │   ├── Result.jsx          # Prediction card, factors & What-If simulator (Panel 3)
│   │   │   ├── History.jsx         # Analytics dashboard & history log (Panel 4)
│   │   │   └── About.jsx           # Model specs, architecture & benchmark report
│   │   ├── services/
│   │   │   ├── api.js              # Axios service connected to FastAPI
│   │   │   └── historyStorage.js   # LocalStorage history manager & stats aggregator
│   │   ├── App.jsx                 # Main application routes
│   │   ├── index.css               # Tailwind directives & CSS variables
│   │   └── main.jsx                # Application root
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry with CORS & error handlers
│   │   ├── schemas/
│   │   │   └── prediction.py       # Pydantic schemas for input validation & responses
│   │   ├── services/
│   │   │   └── model_service.py    # Singleton model loader, predictor & what-if engine
│   │   └── routes/
│   │       └── api.py              # API routes (/predict, /what-if, /model-info, /health)
│   ├── data/
│   │   └── insurance.csv           # Benchmark medical costs dataset (1,338 records)
│   ├── model/
│   │   ├── insurance_model.joblib  # Trained scikit-learn pipeline
│   │   └── model_metrics.json      # Genuine evaluation scores & feature importances
│   ├── training/
│   │   └── train_model.py          # Machine learning training & evaluation script
│   └── requirements.txt            # Python dependencies
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+** (tested on Python 3.13)
- **Node.js 18+** and **npm**

---

### 1. Backend Setup & Model Training

Open a terminal and navigate to the backend folder:

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run the ML training pipeline (loads data, trains 3 models, exports best model & metrics)
python training/train_model.py

# Start the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The FastAPI backend will be running at `http://127.0.0.1:8000`.  
Interactive Swagger docs are available at `http://127.0.0.1:8000/docs`.

---

### 2. Frontend Setup

In a new terminal window, navigate to the frontend folder:

```bash
cd frontend

# Install npm packages
npm install

# Start the Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📡 API Endpoints

### 1. Health Check
`GET /api/health`
```json
{
  "status": "ok"
}
```

### 2. Calculate Prediction
`POST /api/predict`

**Request Body:**
```json
{
  "age": 32,
  "sex": "male",
  "bmi": 26.4,
  "children": 2,
  "smoker": "no",
  "region": "southeast"
}
```

**Response:**
```json
{
  "predicted_cost": 6552.77,
  "monthly_cost": 546.06,
  "confidence_label": "Model Estimate",
  "model_algorithm": "Gradient Boosting Regressor",
  "factors": {
    "age": { "value": 32, "display": "32 yrs", "impact_level": "Low", "feature_importance_pct": 11.8 },
    "bmi": { "value": 26.4, "display": "26.4", "impact_level": "Moderate", "feature_importance_pct": 18.6 },
    "smoking": { "value": "No", "display": "No", "impact_level": "Low", "feature_importance_pct": 68.1 },
    "children": { "value": 2, "display": "2", "impact_level": "Low", "feature_importance_pct": 1.0 },
    "region": { "value": "Southeast", "display": "Southeast", "impact_level": "Minimal", "feature_importance_pct": 0.4 }
  },
  "disclaimer": "This tool provides an estimated insurance cost for educational/demo purposes..."
}
```

### 3. What-If Scenarios
`POST /api/what-if`  
Runs multiple model inferences with perturbation of critical lifestyle variables (Smoking status, BMI adjustment to normal weight, and 5-year age progression), returning the exact cost delta and percent difference.

### 4. Model Metadata & Metrics
`GET /api/model-info`  
Returns the actual metrics computed during model training (`R² = 0.8809`, `MAE = $2,405.10`, `RMSE = $4,300.36`), model comparison rankings, and feature importances.

---

## 🧠 Machine Learning Details

The model was trained on the standard Brett Lantz **Medical Cost Personal Dataset** (1,338 records).

| Algorithm | R² Score | MAE | RMSE | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Gradient Boosting Regressor** | **0.8809** | **$2,405.10** | **$4,300.36** | **Selected (Best)** |
| Random Forest Regressor | 0.8718 | $2,540.35 | $4,461.07 | Benchmarked |
| Linear Regression | 0.7836 | $4,181.19 | $5,796.28 | Baseline |

### Feature Importance Breakdown:
- **Smoker:** 68.1% (Primary driver of cost variance)
- **BMI:** 18.6% (Secondary driver, exponential scaling above 30.0)
- **Age:** 11.8% (Linear increase with age)
- **Children:** 1.0%
- **Region:** 0.4%
- **Sex:** 0.1%

---

## 🔒 Privacy & Legal Disclaimer

This application is an educational and portfolio demonstration. It does not collect or transmit Personally Identifiable Information (PII) such as names, social security numbers, medical records, or addresses. Predictions are statistical regression estimates and do not represent guaranteed insurance premiums or legally binding underwriting quotes.
