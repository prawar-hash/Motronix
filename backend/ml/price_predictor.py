import os
import joblib
import pandas as pd
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'saved_models', 'price_model.joblib')

# Pre-defined mapping for bike condition scores
CONDITION_MAPPING = {'Poor': 1, 'Fair': 2, 'Good': 3, 'Excellent': 4}
# Pre-defined brand multipliers for fallback calculation in Indian Rupees (₹)
BRAND_MULTIPLIERS = {
    'royal enfield': 1.1, 'ktm': 1.05, 'yamaha': 1.0,
    'bajaj': 0.85, 'hero': 0.8, 'honda': 1.0,
    'suzuki': 1.2, 'kawasaki': 1.3, 'triumph': 1.4,
    'harley-davidson': 1.5, 'other': 0.75
}

def predict_fair_price(brand: str, model: str, year: int, mileage: float, condition: str) -> float:
    """Predicts a fair market price in Indian Rupees (₹) based on age, distance run (km), and condition."""
    brand_clean = str(brand).strip().lower()
    condition_clean = str(condition).strip()
    
    current_year = 2026
    age = max(0, current_year - int(year))
    
    cond_score = CONDITION_MAPPING.get(condition_clean, 3) # Default to Good (3)
    
    if os.path.exists(MODEL_PATH):
        try:
            model_data = joblib.load(MODEL_PATH)
            model_obj = model_data['model']
            brand_encoder = model_data['brand_encoder']
            
            brand_encoded = brand_encoder.get(brand_clean, brand_encoder.get('other', 0))
            
            features = pd.DataFrame([{
                'age': age,
                'mileage': float(mileage), # Mileage here is distance run in km
                'condition_score': cond_score,
                'brand_encoded': brand_encoded
            }])
            
            prediction = float(model_obj.predict(features)[0])
            return max(15000.0, round(prediction, 2))
        except Exception:
            pass
            
    # Rule-based fallback calculation (in Indian Rupees ₹)
    # Base baseline is ₹ 1,50,000 for standard Indian mid-range
    base_price = 150000.0
    brand_mult = BRAND_MULTIPLIERS.get(brand_clean, BRAND_MULTIPLIERS['other'])
    
    # Depreciate by age and kilometers run (km)
    age_depreciation = age * 12000.0
    mileage_depreciation = float(mileage) * 1.50 # ₹ 1.5 per km run
    condition_mult = cond_score / 3.0
    
    predicted = (base_price * brand_mult - age_depreciation - mileage_depreciation) * condition_mult
    return max(15000.0, round(predicted, 2))

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
