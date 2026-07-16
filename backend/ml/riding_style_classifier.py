import os
import joblib
import pandas as pd
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'saved_models', 'riding_style_model.joblib')

# Sample CSV template content in km/h
CSV_TEMPLATE_CONTENT = """timestamp,speed,acceleration,braking_event
0,10.0,0.5,0
1,18.0,3.0,0
2,25.0,4.0,0
3,30.0,3.0,0
4,35.5,1.5,0
5,40.0,0.5,0
6,42.2,0.2,0
7,25.0,-5.2,1
8,10.0,-6.0,1
9,15.5,1.5,0
10,20.0,0.5,0
"""

def get_csv_template() -> str:
    """Returns the raw CSV template string for riding data in km/h."""
    return CSV_TEMPLATE_CONTENT

def classify_riding_style(file_path: str) -> dict:
    """Parses a ride data CSV, extracts key features, and classifies the riding style (speeds in km/h)."""
    try:
        df = pd.read_csv(file_path)
        
        required_cols = {'timestamp', 'speed', 'acceleration', 'braking_event'}
        if not required_cols.issubset(df.columns):
            raise ValueError(f"CSV file must contain all required columns: {required_cols}")
            
        avg_speed = float(df['speed'].mean())
        max_speed = float(df['speed'].max())
        accel_var = float(df['acceleration'].var())
        if np.isnan(accel_var):
            accel_var = 0.0
            
        harsh_braking_count = int(((df['braking_event'] == 1) & (df['acceleration'] < -2.0)).sum())
        
        features_dict = {
            'avg_speed': round(avg_speed, 2), # km/h
            'max_speed': round(max_speed, 2), # km/h
            'accel_variance': round(accel_var, 3),
            'harsh_braking_count': harsh_braking_count
        }
        
        classification = None
        if os.path.exists(MODEL_PATH):
            try:
                model_data = joblib.load(MODEL_PATH)
                clf = model_data['model']
                scaler = model_data['scaler']
                
                raw_features = np.array([[
                    avg_speed,
                    max_speed,
                    accel_var,
                    float(harsh_braking_count)
                ]])
                
                scaled_features = scaler.transform(raw_features)
                classification = str(clf.predict(scaled_features)[0])
            except Exception:
                pass
                
        # Rule-based fallback if model is missing or fails (calibrated in km/h)
        if not classification:
            if harsh_braking_count >= 5 or accel_var > 1.5 or max_speed > 75.0:
                classification = 'Aggressive'
            elif harsh_braking_count >= 2 or accel_var > 0.6 or max_speed > 45.0:
                classification = 'Moderate'
            else:
                classification = 'Calm'
                
        suggestions = []
        if classification == 'Aggressive':
            suggestions.append("Your riding style is Aggressive. Easing acceleration variance will save tire rubber and chain stress.")
            suggestions.append("Anticipate traffic: Hard deceleration and braking detected. Slow down in advance to save brake pads.")
            suggestions.append("Fuel efficiency: Smooth throttle control can improve fuel economy by up to 15% (3-5 km/l).")
        elif classification == 'Moderate':
            suggestions.append("Your riding style is Moderate. Maintain a steady throttle for optimal km/l mileage.")
            suggestions.append("Safety: Try to avoid hard braking events on wet or gravel road conditions.")
            suggestions.append("Chassis care: Inspect chain slack and lube every 800 km.")
        else:
            suggestions.append("Your riding style is Calm. Great job! Smooth pacing maximizes safety and economy.")
            suggestions.append("Engine lifespan: Low heat generated in the engine ensures oil retains viscosity longer.")
            suggestions.append("Cost savings: Minimum wear and tear detected on tires and brake components.")
            
        return {
            'riding_style': classification,
            'features': features_dict,
            'suggestions': suggestions
        }
    except Exception as e:
        raise ValueError(f"Failed to analyze ride data: {str(e)}")
