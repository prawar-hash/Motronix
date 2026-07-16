import os
import joblib
import pandas as pd
import numpy as np

# Price predictor configuration
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'saved_models', 'price_model.joblib')

# Pre-defined mapping for bike condition scores
CONDITION_MAPPING = {'Poor': 1, 'Fair': 2, 'Good': 3, 'Excellent': 4}
# Pre-defined brand multipliers for fallback calculation
BRAND_MULTIPLIERS = {
    'trek': 1.0, 'specialized': 1.1, 'giant': 0.9,
    'cannondale': 1.05, 'santa cruz': 1.3, 'other': 0.8
}

def predict_fair_price(brand: str, model: str, year: int, mileage: float, condition: str) -> float:
    """Predicts a fair market price for a bicycle based on age, mileage, brand, and condition."""
    brand_clean = str(brand).strip().lower()
    condition_clean = str(condition).strip()
    
    # Calculate age relative to current year (2026)
    current_year = 2026
    age = max(0, current_year - int(year))
    
    cond_score = CONDITION_MAPPING.get(condition_clean, 3) # Default to Good (3)
    
    # Check if a serialized scikit-learn model is available
    if os.path.exists(MODEL_PATH):
        try:
            model_data = joblib.load(MODEL_PATH)
            model_obj = model_data['model']
            brand_encoder = model_data['brand_encoder']
            
            # Map brand or default to 'other'
            brand_encoded = brand_encoder.get(brand_clean, brand_encoder.get('other', 0))
            
            # Prepare features matching the training shape
            features = pd.DataFrame([{
                'age': age,
                'mileage': float(mileage),
                'condition_score': cond_score,
                'brand_encoded': brand_encoded
            }])
            
            prediction = float(model_obj.predict(features)[0])
            return max(50.0, round(prediction, 2))
        except Exception:
            # Fall back to rule-based logic in case of load/prediction error
            pass
            
    # Rule-based fallback calculation
    base_price = 1000.0
    brand_mult = BRAND_MULTIPLIERS.get(brand_clean, BRAND_MULTIPLIERS['other'])
    
    # Depreciate by age and mileage
    age_depreciation = age * 80.0
    mileage_depreciation = float(mileage) * 0.05
    condition_mult = cond_score / 3.0 # Good condition maintains 100% of standard base
    
    predicted = (base_price * brand_mult - age_depreciation - mileage_depreciation) * condition_mult
    return max(50.0, round(predicted, 2))

def evaluate_asking_price(asking_price: float, predicted_price: float) -> str:
    """Classifies the asking price compared to predicted fair market price with a 15% threshold."""
    price = float(asking_price)
    pred = float(predicted_price)
    
    if pred <= 0:
        return 'Fair'
        
    diff_percent = (price - pred) / pred
    
    if diff_percent > 0.15:
        return 'Overpriced'
    elif diff_percent < -0.15:
        return 'Underpriced'
    return 'Fair'
