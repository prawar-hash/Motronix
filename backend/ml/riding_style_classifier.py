import os
import joblib
import pandas as pd
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'saved_models', 'riding_style_model.joblib')

# Sample CSV template content
CSV_TEMPLATE_CONTENT = """timestamp,speed,acceleration,braking_event
0,5.0,0.5,0
1,8.0,3.0,0
2,12.0,4.0,0
3,15.0,3.0,0
4,16.5,1.5,0
5,17.0,0.5,0
6,17.2,0.2,0
7,12.0,-5.2,1
8,6.0,-6.0,1
9,7.5,1.5,0
10,8.0,0.5,0
"""

def get_csv_template() -> str:
    """Returns the raw CSV template string for riding data."""
    return CSV_TEMPLATE_CONTENT

def classify_riding_style(file_path: str) -> dict:
    """Parses a ride data CSV, extracts key features, and classifies the riding style."""
    try:
        # Load CSV using pandas
        df = pd.read_csv(file_path)
        
        # Verify columns exist
        required_cols = {'timestamp', 'speed', 'acceleration', 'braking_event'}
        if not required_cols.issubset(df.columns):
            raise ValueError(f"CSV file must contain all required columns: {required_cols}")
            
        # Feature extraction
        avg_speed = float(df['speed'].mean())
        max_speed = float(df['speed'].max())
        accel_var = float(df['acceleration'].var())
        if np.isnan(accel_var):
            accel_var = 0.0
            
        # Count harsh braking (where braking_event is 1 and acceleration is negative)
        harsh_braking_count = int(((df['braking_event'] == 1) & (df['acceleration'] < -2.0)).sum())
        
        features_dict = {
            'avg_speed': round(avg_speed, 2),
            'max_speed': round(max_speed, 2),
            'accel_variance': round(accel_var, 3),
            'harsh_braking_count': harsh_braking_count
        }
        
        # Check if Random Forest classifier model exists
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
                
        # Rule-based fallback if model is missing or fails
        if not classification:
            if harsh_braking_count >= 5 or accel_var > 1.5 or max_speed > 25.0:
                classification = 'Aggressive'
            elif harsh_braking_count >= 2 or accel_var > 0.6 or max_speed > 16.0:
                classification = 'Moderate'
            else:
                classification = 'Calm'
                
        # Define actionable suggestions based on classification and features
        suggestions = []
        if classification == 'Aggressive':
            suggestions.append("Your riding style is Aggressive. Try to reduce rapid throttle/pedal transitions.")
            suggestions.append("High brake wear: You logged multiple harsh braking events. Anticipate stops ahead to brake smoothly.")
            suggestions.append("Tire preservation: Easing acceleration variance will extend tire life by up to 25%.")
        elif classification == 'Moderate':
            suggestions.append("Your riding style is Moderate. Maintain steady speeds for better efficiency.")
            suggestions.append("Brake optimization: Try to limit braking events above 3m/s^2 deceleration.")
            suggestions.append("Drivetrain care: Clean and lube your chain to ensure smooth shifting.")
        else:
            suggestions.append("Your riding style is Calm. Excellent pacing and smooth handling!")
            suggestions.append("Fuel/Battery efficiency: Your smooth speed curve maximizes energy range.")
            suggestions.append("Component durability: Minimal stress detected on brake pads and tires.")
            
        return {
            'riding_style': classification,
            'features': features_dict,
            'suggestions': suggestions
        }
    except Exception as e:
        raise ValueError(f"Failed to analyze ride data: {str(e)}")
