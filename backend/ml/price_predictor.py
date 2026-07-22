import os
import joblib
import pandas as pd
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'saved_models', 'price_model.joblib')
# Domain specs lookup catalog for pre-populating inference inputs
INFERENCE_BRAND_MODELS = {
    'royal enfield': {
        'Classic 350': {'original_price': 220000.0, 'engine_cc': 349, 'demand': 9, 'resale': 9, 'type': 'cruiser'},
        'Bullet 350': {'original_price': 175000.0, 'engine_cc': 349, 'demand': 8, 'resale': 9, 'type': 'cruiser'},
        'Hunter 350': {'original_price': 150000.0, 'engine_cc': 349, 'demand': 9, 'resale': 8, 'type': 'commuter'},
        'Meteor 350': {'original_price': 205000.0, 'engine_cc': 349, 'demand': 8, 'resale': 8, 'type': 'cruiser'},
        'Himalayan 450': {'original_price': 285000.0, 'engine_cc': 452, 'demand': 8, 'resale': 8, 'type': 'adventure'},
        'Interceptor 650': {'original_price': 305000.0, 'engine_cc': 648, 'demand': 7, 'resale': 8, 'type': 'cruiser'}
    },
    'ktm': {
        'Duke 125': {'original_price': 178000.0, 'engine_cc': 124, 'demand': 7, 'resale': 6, 'type': 'sports'},
        'Duke 200': {'original_price': 196000.0, 'engine_cc': 199, 'demand': 8, 'resale': 6, 'type': 'sports'},
        'Duke 250': {'original_price': 239000.0, 'engine_cc': 248, 'demand': 7, 'resale': 7, 'type': 'sports'},
        'Duke 390': {'original_price': 311000.0, 'engine_cc': 373, 'demand': 8, 'resale': 7, 'type': 'sports'},
        'RC 200': {'original_price': 218000.0, 'engine_cc': 199, 'demand': 8, 'resale': 6, 'type': 'sports'},
        'RC 390': {'original_price': 318000.0, 'engine_cc': 373, 'demand': 8, 'resale': 7, 'type': 'sports'}
    },
    'yamaha': {
        'R15 V4': {'original_price': 182000.0, 'engine_cc': 155, 'demand': 9, 'resale': 8, 'type': 'sports'},
        'MT-15 V2': {'original_price': 168000.0, 'engine_cc': 155, 'demand': 9, 'resale': 8, 'type': 'sports'},
        'FZ-S FI': {'original_price': 122000.0, 'engine_cc': 149, 'demand': 8, 'resale': 7, 'type': 'commuter'},
        'FZ-X': {'original_price': 136000.0, 'engine_cc': 149, 'demand': 7, 'resale': 7, 'type': 'commuter'},
        'R3': {'original_price': 465000.0, 'engine_cc': 321, 'demand': 6, 'resale': 6, 'type': 'sports'}
    },
    'bajaj': {
        'Pulsar 125': {'original_price': 90000.0, 'engine_cc': 124, 'demand': 8, 'resale': 8, 'type': 'commuter'},
        'Pulsar 150': {'original_price': 115000.0, 'engine_cc': 149, 'demand': 8, 'resale': 8, 'type': 'commuter'},
        'Pulsar NS200': {'original_price': 142000.0, 'engine_cc': 199, 'demand': 8, 'resale': 7, 'type': 'sports'},
        'Pulsar N250': {'original_price': 150000.0, 'engine_cc': 249, 'demand': 7, 'resale': 7, 'type': 'sports'},
        'Dominar 400': {'original_price': 230000.0, 'engine_cc': 373, 'demand': 7, 'resale': 7, 'type': 'cruiser'}
    },
    'hero': {
        'Splendor Plus': {'original_price': 75000.0, 'engine_cc': 97, 'demand': 10, 'resale': 10, 'type': 'commuter'},
        'HF Deluxe': {'original_price': 65000.0, 'engine_cc': 97, 'demand': 9, 'resale': 9, 'type': 'commuter'},
        'Glamour': {'original_price': 82000.0, 'engine_cc': 124, 'demand': 8, 'resale': 8, 'type': 'commuter'},
        'Xpulse 200 4V': {'original_price': 145000.0, 'engine_cc': 199, 'demand': 8, 'resale': 8, 'type': 'adventure'}
    },
    'honda': {
        'Activa 6G': {'original_price': 78000.0, 'engine_cc': 109, 'demand': 10, 'resale': 9, 'type': 'commuter'},
        'SP 125': {'original_price': 86000.0, 'engine_cc': 124, 'demand': 9, 'resale': 9, 'type': 'commuter'},
        'Shine 125': {'original_price': 80000.0, 'engine_cc': 124, 'demand': 9, 'resale': 9, 'type': 'commuter'},
        'CB350 H\'ness': {'original_price': 210000.0, 'engine_cc': 348, 'demand': 8, 'resale': 8, 'type': 'cruiser'}
    },
    'suzuki': {
        'Access 125': {'original_price': 80000.0, 'engine_cc': 124, 'demand': 9, 'resale': 9, 'type': 'commuter'},
        'Gixxer SF 250': {'original_price': 192000.0, 'engine_cc': 249, 'demand': 7, 'resale': 7, 'type': 'sports'},
        'Hayabusa': {'original_price': 1695000.0, 'engine_cc': 1340, 'demand': 6, 'resale': 7, 'type': 'sports'}
    },
    'kawasaki': {
        'Ninja 300': {'original_price': 343000.0, 'engine_cc': 296, 'demand': 7, 'resale': 6, 'type': 'sports'},
        'Ninja 650': {'original_price': 716000.0, 'engine_cc': 649, 'demand': 7, 'resale': 7, 'type': 'sports'},
        'Z900': {'original_price': 920000.0, 'engine_cc': 948, 'demand': 7, 'resale': 7, 'type': 'sports'}
    },
    'triumph': {
        'Speed 400': {'original_price': 233000.0, 'engine_cc': 398, 'demand': 8, 'resale': 8, 'type': 'cruiser'},
        'Scrambler 400X': {'original_price': 263000.0, 'engine_cc': 398, 'demand': 8, 'resale': 8, 'type': 'adventure'}
    },
    'harley-davidson': {
        'X440': {'original_price': 240000.0, 'engine_cc': 440, 'demand': 8, 'resale': 8, 'type': 'cruiser'}
    },
    'other': {
        'Other': {'original_price': 100000.0, 'engine_cc': 150, 'demand': 6, 'resale': 6, 'type': 'commuter'}
    }
}

def predict_fair_price(brand: str, model: str, year: int, mileage: float, condition: str, variant_type: str = 'Base') -> float:
    """Predicts a fair market price in Indian Rupees (₹) using a robust scikit-learn ML pipeline."""
    # 1. Standardize input parameters
    brand_clean = str(brand).strip().lower()
    model_clean = str(model).strip()
    condition_clean = str(condition).strip()
    
    current_year = 2026
    age = max(0, current_year - int(year))
    mileage_val = max(0.0, float(mileage))
    
    # 2. Look up vehicle profile specs or fall back
    brand_specs = INFERENCE_BRAND_MODELS.get(brand_clean, INFERENCE_BRAND_MODELS['other'])
    model_specs = brand_specs.get(model_clean, list(brand_specs.values())[0])
    
    original_price = model_specs['original_price']
    engine_cc = model_specs['engine_cc']
    demand_score = model_specs['demand']
    resale_score = model_specs['resale']
    bike_type = model_specs['type']
    
    # Mapped categorical defaults
    fuel_type = 'Petrol'
    transmission = 'Automatic' if 'Activa' in model_clean or 'Access' in model_clean else 'Manual'
    owner_count = 1
    service_history = 'Good'
    accident_history = 'None'
    insurance_validity = 'Active'
    registration_state = 'MH'
    city = 'Mumbai'
    
    # Calculate estimated maintenance cost
    annual_maintenance_cost = int(original_price * 0.05 * (1.0 + age * 0.04))
    
    # 3. Engineered features calculation
    vehicle_age = age
    mileage_per_year = mileage_val / (vehicle_age + 0.1)
    service_score = 3
    condition_weight = {'Excellent': 4, 'Good': 3, 'Fair': 2, 'Poor': 1}.get(condition_clean, 3)
    accident_score = 0
    maintenance_to_original_ratio = annual_maintenance_cost / (original_price + 0.1)
    variant_score = {'Base': 1, 'Mid': 2, 'Top': 3}.get(variant_type, 1)
    
    # 4. Pipeline execution
    if os.path.exists(MODEL_PATH):
        try:
            model_package = joblib.load(MODEL_PATH)
            pipeline = model_package['pipeline']
            
            features = pd.DataFrame([{
                'brand': brand_clean,
                'model': model_clean,
                'variant_type': variant_type,
                'year': int(year),
                'age': age,
                'mileage': mileage_val,
                'engine_cc': engine_cc,
                'fuel_type': fuel_type,
                'transmission': transmission,
                'owner_count': owner_count,
                'service_history': service_history,
                'accident_history': accident_history,
                'insurance_validity': insurance_validity,
                'registration_state': registration_state,
                'city': city,
                'condition': condition_clean,
                'annual_maintenance_cost': annual_maintenance_cost,
                'demand_score': demand_score,
                'resale_score': resale_score,
                'original_price': original_price,
                'vehicle_age': vehicle_age,
                'mileage_per_year': mileage_per_year,
                'service_score': service_score,
                'condition_weight': condition_weight,
                'accident_score': accident_score,
                'maintenance_to_original_ratio': maintenance_to_original_ratio,
                'variant_score': variant_score
            }])
            
            prediction = float(pipeline.predict(features)[0])
            # Bound prediction reasonably
            return max(10000.0, min(original_price * 1.25, round(prediction, 2)))
        except Exception:
            pass
            
    # 5. Multiplicative Fallback Depreciation Model
    # Determine base rate of decay by brand
    if brand_clean in ['royal enfield', 'harley-davidson']:
        decay = 0.88
    elif brand_clean in ['ktm', 'kawasaki']:
        decay = 0.83
    elif brand_clean in ['hero', 'honda']:
        decay = 0.90
    else:
        decay = 0.86
        
    variant_mult = {'Base': 1.0, 'Mid': 1.08, 'Top': 1.18}.get(variant_type, 1.0)
    base_val = original_price * variant_mult * (decay ** age)
    
    # Apply conditions
    cond_factor = {'Excellent': 1.1, 'Good': 1.0, 'Fair': 0.8, 'Poor': 0.55}.get(condition_clean, 1.0)
    mileage_factor = max(0.75, 1.0 - (mileage_val / (age * 8000.0 + 0.1)) * 0.05 if age > 0 else 1.0)
    
    predicted_val = base_val * cond_factor * mileage_factor + (demand_score * 0.01) * original_price
    return max(10000.0, min(original_price * 1.22, round(predicted_val, 2)))

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
