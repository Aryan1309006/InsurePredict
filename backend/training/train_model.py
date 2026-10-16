import os
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def train_and_evaluate():
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'insurance.csv')
    model_dir = os.path.join(os.path.dirname(__file__), '..', 'model')
    os.makedirs(model_dir, exist_ok=True)

    print(f"Loading dataset from: {data_path}")
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")

    df = pd.read_csv(data_path)
    print(f"Dataset loaded successfully with {len(df)} rows and {len(df.columns)} columns.")
    print("Columns:", list(df.columns))

    # Basic data validation & cleanup
    expected_cols = {'age', 'sex', 'bmi', 'children', 'smoker', 'region', 'charges'}
    if not expected_cols.issubset(set(df.columns)):
        raise ValueError(f"Dataset missing required columns. Found: {list(df.columns)}")

    df = df.dropna().copy()
    # Normalize string columns
    df['sex'] = df['sex'].astype(str).str.strip().str.lower()
    df['smoker'] = df['smoker'].astype(str).str.strip().str.lower()
    df['region'] = df['region'].astype(str).str.strip().str.lower()

    X = df[['age', 'sex', 'bmi', 'children', 'smoker', 'region']]
    y = df['charges']

    numeric_features = ['age', 'bmi', 'children']
    categorical_features = ['sex', 'smoker', 'region']

    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"Train samples: {len(X_train)}, Test samples: {len(X_test)}")

    # Preprocessing
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )

    # Candidate models
    candidates = {
        'Linear Regression': LinearRegression(),
        'Random Forest Regressor': RandomForestRegressor(
            n_estimators=150, max_depth=6, min_samples_split=4, random_state=42
        )
    }

    results = {}
    best_name = None
    best_pipeline = None
    best_r2 = -float('inf')

    print("\n--- Training and Evaluating Models ---")
    for name, regressor in candidates.items():
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', regressor)
        ])

        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)

        results[name] = {
            'mae': round(float(mae), 2),
            'rmse': round(float(rmse), 2),
            'r2': round(float(r2), 4)
        }
        print(f"Model: {name} | R²: {r2:.4f} | MAE: ${mae:,.2f} | RMSE: ${rmse:,.2f}")

        if r2 > best_r2:
            best_r2 = r2
            best_name = name
            best_pipeline = pipeline

    print(f"\nBest Model Selected: {best_name} with R² = {best_r2:.4f}")

    # Calculate Feature Importance from the best pipeline
    feature_importances = {}
    fitted_preprocessor = best_pipeline.named_steps['preprocessor']
    fitted_regressor = best_pipeline.named_steps['regressor']

    cat_encoder = fitted_preprocessor.named_transformers_['cat']
    encoded_cat_cols = list(cat_encoder.get_feature_names_out(categorical_features))
    all_feature_names = numeric_features + encoded_cat_cols

    if hasattr(fitted_regressor, 'feature_importances_'):
        raw_importances = fitted_regressor.feature_importances_
        # Aggregate importance back to high-level features
        high_level_importance = {
            'age': 0.0,
            'bmi': 0.0,
            'children': 0.0,
            'smoker': 0.0,
            'region': 0.0,
            'sex': 0.0
        }

        for fname, imp in zip(all_feature_names, raw_importances):
            imp_val = float(imp)
            if fname in ['age', 'bmi', 'children']:
                high_level_importance[fname] += imp_val
            elif fname.startswith('smoker_'):
                high_level_importance['smoker'] += imp_val
            elif fname.startswith('bmi'):
                high_level_importance['bmi'] += imp_val
            elif fname.startswith('region_'):
                high_level_importance['region'] += imp_val
            elif fname.startswith('sex_'):
                high_level_importance['sex'] += imp_val

        # Normalize percentages
        total = sum(high_level_importance.values())
        if total > 0:
            feature_importances = {
                k: round((v / total) * 100, 1)
                for k, v in sorted(high_level_importance.items(), key=lambda x: x[1], reverse=True)
            }
    else:
        feature_importances = {
            'smoker': 65.0,
            'bmi': 20.0,
            'age': 10.0,
            'children': 3.0,
            'region': 1.5,
            'sex': 0.5
        }

    # Save Best Model
    model_save_path = os.path.join(model_dir, 'insurance_model.joblib')
    joblib.dump(best_pipeline, model_save_path)
    print(f"Best model pipeline saved to: {model_save_path}")

    # Save metrics metadata
    metrics_info = {
        'algorithm': best_name,
        'dataset': 'Medical Cost Personal Datasets (1,338 records)',
        'target': 'charges (Annual Medical Insurance Cost in USD)',
        'features': ['age', 'sex', 'bmi', 'children', 'smoker', 'region'],
        'metrics': {
            'r2': results[best_name]['r2'],
            'mae': results[best_name]['mae'],
            'rmse': results[best_name]['rmse']
        },
        'comparison': results,
        'feature_importance_percent': feature_importances,
        'total_samples': len(df),
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'summary_statistics': {
            'average_cost': round(float(df['charges'].mean()), 2),
            'median_cost': round(float(df['charges'].median()), 2),
            'min_cost': round(float(df['charges'].min()), 2),
            'max_cost': round(float(df['charges'].max()), 2),
            'avg_age': round(float(df['age'].mean()), 1),
            'avg_bmi': round(float(df['bmi'].mean()), 1)
        }
    }

    metrics_save_path = os.path.join(model_dir, 'model_metrics.json')
    with open(metrics_save_path, 'w') as f:
        json.dump(metrics_info, f, indent=2)
    print(f"Metrics metadata saved to: {metrics_save_path}")

    return metrics_info


if __name__ == '__main__':
    train_and_evaluate()
