# InsurePredict — AI-Powered Health Insurance Cost Predictor

> **Tagline:** AI-Powered Health Insurance Cost Predictor with Secure Authentication and MongoDB Atlas  
> A full-stack, production-quality application built with **React**, **FastAPI**, **Machine Learning**, and **MongoDB Atlas** that predicts health insurance premiums and tracks personalized calculation history securely.

---

## 📸 Architecture & Authentication Flow

```text
User opens InsurePredict
        ↓
Landing Page / Public Info
        ↓
Login / Sign Up
        ↓
Argon2 Hash + JWT HttpOnly Session Cookie
        ↓
Authenticated User
        ↓
User Dashboard
        ↓
ML Predictor
        ↓
Prediction Calculated & Saved to MongoDB Atlas
        ↓
User-Specific Prediction History & Statistics
```

Unauthenticated users can view:
- Public Landing Page (`/`)
- Methodology & Model Specifications (`/about`)
- Sign Up (`/signup`)
- Login (`/login`)

Protected pages (requiring secure authentication):
- Predictor (`/predictor`)
- Prediction Results (`/result`)
- Personal Prediction History (`/history`)
- Dashboard (`/dashboard`)
- User Profile (`/profile`)

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS (Healthcare SaaS aesthetic, Light / Dark theme)
- **Routing:** React Router v7 with `ProtectedRoute` guards
- **Authentication:** `AuthContext` + session restoration via HttpOnly cookies (`withCredentials: true`)
- **HTTP Client:** Axios with structured error mapping and loading states
- **Data Visualization:** Recharts (Dynamic donut charts, comparative graphs)
- **Icons:** Lucide React

### Backend & Machine Learning
- **API Framework:** FastAPI + Uvicorn
- **Database:** MongoDB Atlas (via `pymongo[srv]`)
- **Password Security:** Argon2 password hashing (`argon2-cffi`)
- **Authentication:** JWT tokens (`PyJWT`) stored in secure, HttpOnly cookies
- **Validation:** Pydantic v2
- **Data Science:** Pandas, NumPy, Scikit-Learn
- **Model Serialization:** Joblib
- **Machine Learning Pipeline:**
  - Evaluates Linear Regression and Random Forest Regressor
  - Feature transformation with `ColumnTransformer` (`StandardScaler` and `OneHotEncoder`)
  - Automatically loads best model (`Random Forest Regressor`: `R² = 0.8718`, `MAE = $2,540.35`, `RMSE = $4,461.07`)

---

## 📁 Project Structure

```text
InsurePredict/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Auth-aware navbar (Login/SignUp vs User/Logout)
│   │   │   ├── Footer.jsx          # Healthcare disclaimer & links
│   │   │   ├── HeroGraphic.jsx     # 3D medical shield illustration
│   │   │   └── ProtectedRoute.jsx  # Route guard with session verification
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # User state, login, register, logout, session refresh
│   │   │   └── ThemeContext.jsx    # Dark/light theme provider
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Landing page
│   │   │   ├── Login.jsx           # Clean Login page with validation & loading states
│   │   │   ├── SignUp.jsx          # Sign Up page (Name, Email, Password, Confirm Password)
│   │   │   ├── Dashboard.jsx       # User dashboard with live MongoDB statistics
│   │   │   ├── Predictor.jsx       # Interactive form sending authenticated ML predictions
│   │   │   ├── Result.jsx          # Prediction breakdown & What-If scenario simulations
│   │   │   ├── History.jsx         # User-specific prediction history with deletion
│   │   │   ├── Profile.jsx         # User account details and metrics
│   │   │   └── About.jsx           # Model specs, architecture & benchmark report
│   │   ├── services/
│   │   │   └── api.js              # Axios service configured with credentials & endpoints
│   │   ├── App.jsx                 # Routes with ProtectedRoute wrappers
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── config.py               # Environment configuration (.env loader)
│   │   ├── database/
│   │   │   └── mongodb.py          # MongoDB client, connection pooling & indexes
│   │   ├── dependencies/
│   │   │   └── auth.py             # get_current_user dependency (Cookie / Bearer)
│   │   ├── routes/
│   │   │   ├── api.py              # Main API router mounting sub-routers
│   │   │   ├── auth.py             # /api/auth/register, login, logout, me
│   │   │   └── prediction.py       # /api/predict, /api/predictions, /api/predictions/stats
│   │   ├── schemas/
│   │   │   ├── auth.py             # RegisterRequest, LoginRequest, UserResponse
│   │   │   └── prediction.py       # Prediction schemas, history items, and stats
│   │   ├── services/
│   │   │   └── model_service.py    # Singleton model inference engine
│   │   ├── utils/
│   │   │   └── security.py         # Argon2 hashing & PyJWT token utilities
│   │   └── main.py                 # FastAPI application, CORS & exception handling
│   ├── data/
│   │   └── insurance.csv           # Benchmark training dataset (1,338 records)
│   ├── model/
│   │   ├── insurance_model.joblib  # Trained scikit-learn pipeline
│   │   └── model_metrics.json      # Genuine evaluation scores & feature importances
│   ├── training/
│   │   └── train_model.py          # ML training script
│   ├── test_auth_mongodb.py        # Automated test suite for auth & user isolation
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Template for environment configuration
│   └── .env                        # Local environment variables (gitignored)
│
├── .gitignore
└── README.md
```

---

## ☁️ MongoDB Atlas Setup Guide

Follow these steps to connect your MongoDB Atlas cloud database:

### 1. Create a MongoDB Atlas Account
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.

### 2. Create a Cluster
- Create a new project (e.g. `InsurePredict`).
- Select **Deploy a database** and choose the **M0 Free Shared Cluster**.
- Choose your preferred cloud provider and region closest to your users, then click **Create Deployment**.

### 3. Create a Database User
- In the Security Quickstart (or under **Security > Database Access**):
  - Choose **Username and Password** authentication.
  - Set a username (e.g. `insure_user`).
  - Set a strong password (copy this password for your connection string).
  - Assign the user role `Read and write to any database`.

### 4. Configure Network Access (IP Access List)
- Under **Security > Network Access**:
  - Click **Add IP Address**.
  - For development, choose **Allow Access From Anywhere** (`0.0.0.0/0`) or enter your current IP address.
  - Click **Confirm**.

### 5. Get Your MongoDB Connection String
- Under **Databases**, click **Connect** on your cluster.
- Choose **Drivers** (Driver: `Python`, Version: `3.12 or later`).
- Copy the provided connection string URI. It looks like:
  ```text
  mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
  ```

### 6. Configure Backend `.env`
In the `backend/` directory, create or edit `.env` (never commit this file to git):

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=insurepredict
JWT_SECRET=your_long_random_secret_key_here_minimum_32_characters
JWT_EXPIRE_MINUTES=1440
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

*(Replace `<username>` and `<password>` with your database user credentials. Do not share or commit these credentials).*

---

## 🚀 Running the Application

### 1. Start the FastAPI Backend

```bash
cd backend

# (Optional) Activate your virtual environment:
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the automated verification test suite
python test_auth_mongodb.py

# Start the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API will be running at `http://127.0.0.1:8000`.  
Interactive documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Start the React Frontend

In another terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📡 API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user, hashes password with Argon2, sets session cookie | No |
| `POST` | `/api/auth/login` | Verify credentials, sets HttpOnly JWT session cookie | No |
| `POST` | `/api/auth/logout` | Clears authentication session cookie | No |
| `GET` | `/api/auth/me` | Returns current user profile and prediction counts | **Yes** |

### Prediction & History Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/predict` | Runs ML inference and persists record under user account in MongoDB | **Yes** |
| `GET` | `/api/predictions` | Retrieves strictly the authenticated user's prediction history | **Yes** |
| `GET` | `/api/predictions/stats` | Computes user-specific dashboard metrics from MongoDB | **Yes** |
| `DELETE` | `/api/predictions/{id}` | Deletes a prediction after verifying user ownership | **Yes** |
| `DELETE` | `/api/predictions` | Clears all predictions belonging to authenticated user | **Yes** |
| `POST` | `/api/what-if` | Runs lifestyle factor perturbation simulations | No |
| `GET` | `/api/model-info` | Returns model performance metrics and algorithm benchmarks | No |
| `GET` | `/api/health` | Health check endpoint | No |

---

## 🔒 Security Highlights

- **Password Hashing:** Passwords are never stored as plain text. Secured using **Argon2** (winner of the Password Hashing Competition).
- **Session Security:** JWT tokens are transported in **HttpOnly**, SameSite cookies to mitigate XSS exposure.
- **Data Isolation:** User ID is derived exclusively from the verified server-side session token. Users can never query or delete another user's records.
- **Environment Isolation:** Secrets and database URIs are loaded exclusively from `.env` and kept out of version control.
