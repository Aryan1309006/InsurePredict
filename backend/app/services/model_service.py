import os
import json
import joblib
import pandas as pd
from typing import Dict, Any, List
from app.schemas.prediction import (
    PredictionInput,
    PredictionResponse,
    FactorDetail,
    WhatIfScenario,
    WhatIfResponse,
)


class ModelService:
    _instance = None

    def __init__(self):
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        self.model_path = os.path.join(base_dir, "model", "insurance_model.joblib")
        self.metrics_path = os.path.join(base_dir, "model", "model_metrics.json")
        self.pipeline = None
        self.metrics = {}
        self.load_model()

    def load_model(self):
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"Model file not found at {self.model_path}. Please run train_model.py first."
            )
        self.pipeline = joblib.load(self.model_path)

        if os.path.exists(self.metrics_path):
            with open(self.metrics_path, "r") as f:
                self.metrics = json.load(f)
        else:
            self.metrics = {
                "algorithm": "Random Forest Regressor",
                "feature_importance_percent": {
                    "smoker": 66.7,
                    "bmi": 19.0,
                    "age": 12.4,
                    "children": 1.2,
                    "region": 0.6,
                    "sex": 0.1,
                },
            }

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = ModelService()
        return cls._instance

    def _predict_raw(self, row_dict: Dict[str, Any]) -> float:
        df = pd.DataFrame([row_dict])
        prediction = self.pipeline.predict(df)[0]
        # In reality insurance charges cannot be lower than realistic minimums
        return max(500.0, float(prediction))

    def predict(self, input_data: PredictionInput) -> PredictionResponse:
        data_dict = {
            "age": input_data.age,
            "sex": input_data.sex,
            "bmi": input_data.bmi,
            "children": input_data.children,
            "smoker": input_data.smoker,
            "region": input_data.region,
        }

        cost = self._predict_raw(data_dict)
        cost_rounded = round(cost, 2)
        monthly_rounded = round(cost / 12.0, 2)

        importances = self.metrics.get("feature_importance_percent", {})

        # Compute factor breakdown
        factors: Dict[str, FactorDetail] = {
            "age": FactorDetail(
                value=input_data.age,
                display=f"{input_data.age} yrs",
                impact_level="Medium" if input_data.age > 40 else "Low",
                feature_importance_pct=importances.get("age", 12.4),
            ),
            "bmi": FactorDetail(
                value=input_data.bmi,
                display=f"{input_data.bmi:.1f}",
                impact_level="High" if input_data.bmi >= 30 else ("Moderate" if input_data.bmi >= 25 else "Normal"),
                feature_importance_pct=importances.get("bmi", 19.0),
            ),
            "smoking": FactorDetail(
                value=input_data.smoker.capitalize(),
                display="Yes" if input_data.smoker == "yes" else "No",
                impact_level="Critical" if input_data.smoker == "yes" else "Low",
                feature_importance_pct=importances.get("smoker", 66.7),
            ),
            "children": FactorDetail(
                value=input_data.children,
                display=str(input_data.children),
                impact_level="Low",
                feature_importance_pct=importances.get("children", 1.2),
            ),
            "region": FactorDetail(
                value=input_data.region.capitalize(),
                display=input_data.region.capitalize(),
                impact_level="Minimal",
                feature_importance_pct=importances.get("region", 0.6),
            ),
            "sex": FactorDetail(
                value=input_data.sex.capitalize(),
                display=input_data.sex.capitalize(),
                impact_level="Minimal",
                feature_importance_pct=importances.get("sex", 0.1),
            ),
        }

        return PredictionResponse(
            predicted_cost=cost_rounded,
            monthly_cost=monthly_rounded,
            confidence_label="Model Estimate",
            model_algorithm=self.metrics.get("algorithm", "Random Forest Regressor"),
            factors=factors,
        )

    def what_if_simulations(self, input_data: PredictionInput) -> WhatIfResponse:
        base_dict = {
            "age": input_data.age,
            "sex": input_data.sex,
            "bmi": input_data.bmi,
            "children": input_data.children,
            "smoker": input_data.smoker,
            "region": input_data.region,
        }
        base_cost = round(self._predict_raw(base_dict), 2)

        scenarios: List[WhatIfScenario] = []

        # 1. Smoker change
        if input_data.smoker == "yes":
            mod = base_dict.copy()
            mod["smoker"] = "no"
            sim_cost = round(self._predict_raw(mod), 2)
            diff = round(sim_cost - base_cost, 2)
            pct = round((diff / base_cost) * 100, 1)
            scenarios.append(
                WhatIfScenario(
                    id="smoker_quit",
                    title="Non-Smoker Status",
                    description="Quitting smoking or non-smoker rating",
                    modified_field="smoker",
                    original_value="Yes",
                    simulated_value="No",
                    simulated_cost=sim_cost,
                    difference=diff,
                    percent_change=pct,
                )
            )
        else:
            mod = base_dict.copy()
            mod["smoker"] = "yes"
            sim_cost = round(self._predict_raw(mod), 2)
            diff = round(sim_cost - base_cost, 2)
            pct = round((diff / base_cost) * 100, 1)
            scenarios.append(
                WhatIfScenario(
                    id="smoker_active",
                    title="If Active Smoker",
                    description="Impact of tobacco/smoking status",
                    modified_field="smoker",
                    original_value="No",
                    simulated_value="Yes",
                    simulated_cost=sim_cost,
                    difference=diff,
                    percent_change=pct,
                )
            )

        # 2. Healthy BMI (e.g., 22.5) if current BMI is high, or BMI = 30 if current is normal
        target_bmi = 22.5 if input_data.bmi > 25.0 else 30.0
        bmi_title = "Optimal BMI (22.5)" if input_data.bmi > 25.0 else "Elevated BMI (30.0)"
        mod_bmi = base_dict.copy()
        mod_bmi["bmi"] = target_bmi
        sim_cost = round(self._predict_raw(mod_bmi), 2)
        diff = round(sim_cost - base_cost, 2)
        pct = round((diff / base_cost) * 100, 1)
        scenarios.append(
            WhatIfScenario(
                id="bmi_change",
                title=bmi_title,
                description=f"Adjusting BMI from {input_data.bmi:.1f} to {target_bmi}",
                modified_field="bmi",
                original_value=round(input_data.bmi, 1),
                simulated_value=target_bmi,
                simulated_cost=sim_cost,
                difference=diff,
                percent_change=pct,
            )
        )

        # 3. Age + 5 years
        target_age = min(100, input_data.age + 5)
        mod_age = base_dict.copy()
        mod_age["age"] = target_age
        sim_cost = round(self._predict_raw(mod_age), 2)
        diff = round(sim_cost - base_cost, 2)
        pct = round((diff / base_cost) * 100, 1)
        scenarios.append(
            WhatIfScenario(
                id="age_plus_5",
                title=f"In 5 Years (Age {target_age})",
                description="Projected cost progression over the next 5 years",
                modified_field="age",
                original_value=input_data.age,
                simulated_value=target_age,
                simulated_cost=sim_cost,
                difference=diff,
                percent_change=pct,
            )
        )

        return WhatIfResponse(base_cost=base_cost, scenarios=scenarios)

    def get_model_info(self) -> Dict[str, Any]:
        return self.metrics
