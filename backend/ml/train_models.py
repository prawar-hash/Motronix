import os
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler

def generate_synthetic_data():
    """Generates synthetic CSV files for training listings and ride classifications in Indian metrics."""
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    # 1. Generate Listing Price data in Indian Rupees (₹)
    print("Generating synthetic price prediction data (INR)...")
    n_samples = 600
    np.random.seed(42)
    
    brands = [
        'royal enfield', 'ktm', 'yamaha', 'bajaj', 'hero', 
        'honda', 'suzuki', 'kawasaki', 'triumph', 'harley-davidson', 'other'
    ]
    brand_encoder = {b: i for i, b in enumerate(brands)}
    
    data_listings = []
    for _ in range(n_samples):
        brand = np.random.choice(brands)
        brand_val = brand_encoder[brand]
        age = np.random.randint(0, 15)
        mileage = float(np.random.exponential(scale=15000.0) + age * 2500.0) # km run
        cond_score = np.random.randint(1, 5) # 1=Poor, 4=Excellent
        
        # Calculate a reasonable base price in ₹
        brand_base = {
            'royal enfield': 220000.0, 'ktm': 310000.0, 'yamaha': 190000.0,
            'bajaj': 150000.0, 'hero': 80000.0, 'honda': 180000.0,
            'suzuki': 800000.0, 'kawasaki': 1200000.0, 'triumph': 950000.0,
            'harley-davidson': 105000.0, 'other': 100000.0
        }[brand]
        
        # Depreciate based on age and mileage
        depreciation = (age * 15000.0) + (mileage * 1.5)
        cond_multiplier = cond_score / 3.0
        
        price = (brand_base - depreciation) * cond_multiplier
        price = max(15000.0, round(price + np.random.normal(0, 8000.0), 2))
        
        data_listings.append({
            'brand': brand,
            'brand_encoded': brand_val,
            'age': age,
            'mileage': mileage,
            'condition_score': cond_score,
            'price': price
        })
        
    df_listings = pd.DataFrame(data_listings)
    listings_csv_path = os.path.join(data_dir, 'listings_train.csv')
    df_listings.to_csv(listings_csv_path, index=False)
    print(f"Saved synthetic listings to: {listings_csv_path}")
    
    # 2. Generate Riding Style data in km/h
    print("Generating synthetic riding style classifier data (km/h)...")
    n_rides = 300
    data_rides = []
    
    for _ in range(n_rides):
        style = np.random.choice(['Calm', 'Moderate', 'Aggressive'], p=[0.4, 0.4, 0.2])
        if style == 'Calm':
            avg_speed = np.random.uniform(15.0, 30.0) # km/h
            max_speed = avg_speed + np.random.uniform(5.0, 15.0)
            accel_var = np.random.uniform(0.1, 0.5)
            harsh_braking = np.random.randint(0, 2)
        elif style == 'Moderate':
            avg_speed = np.random.uniform(30.0, 50.0)
            max_speed = avg_speed + np.random.uniform(15.0, 25.0)
            accel_var = np.random.uniform(0.4, 1.2)
            harsh_braking = np.random.randint(1, 4)
        else: # Aggressive
            avg_speed = np.random.uniform(45.0, 75.0)
            max_speed = avg_speed + np.random.uniform(25.0, 45.0)
            accel_var = np.random.uniform(1.2, 3.5)
            harsh_braking = np.random.randint(3, 8)
            
        data_rides.append({
            'avg_speed': round(avg_speed, 2),
            'max_speed': round(max_speed, 2),
            'accel_variance': round(accel_var, 3),
            'harsh_braking_count': harsh_braking,
            'riding_style': style
        })
        
    df_rides = pd.DataFrame(data_rides)
    rides_csv_path = os.path.join(data_dir, 'rides_train.csv')
    df_rides.to_csv(rides_csv_path, index=False)
    print(f"Saved synthetic rides to: {rides_csv_path}")

def train_and_save_models():
    """Trains and serializes ML models for pricing, fraud detection, and riding style."""
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    models_dir = os.path.join(os.path.dirname(__file__), 'saved_models')
    os.makedirs(models_dir, exist_ok=True)
    
    # 1. Train Price Predictor
    listings_path = os.path.join(data_dir, 'listings_train.csv')
    if os.path.exists(listings_path):
        print("Training Price Predictor (Random Forest)...")
        df = pd.read_csv(listings_path)
        X = df[['age', 'mileage', 'condition_score', 'brand_encoded']]
        y = df['price']
        
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X, y)
        
        brands = [
            'royal enfield', 'ktm', 'yamaha', 'bajaj', 'hero', 
            'honda', 'suzuki', 'kawasaki', 'triumph', 'harley-davidson', 'other'
        ]
        brand_encoder = {b: i for i, b in enumerate(brands)}
        
        joblib.dump({
            'model': model,
            'brand_encoder': brand_encoder
        }, os.path.join(models_dir, 'price_model.joblib'))
        print("Price Predictor trained and saved.")
        
    # 2. Train Fraud Detector (Isolation Forest)
    print("Training Fraud Anomaly Detector (Isolation Forest)...")
    np.random.seed(42)
    n_fraud_train = 300
    
    # Normal listings behaviors
    price_ratio = np.random.normal(1.0, 0.1, n_fraud_train)
    trust_score = np.random.uniform(80.0, 100.0, n_fraud_train)
    listings_count = np.random.poisson(lam=1.5, size=n_fraud_train)
    days_active = np.random.uniform(10.0, 365.0, n_fraud_train)
    
    X_fraud = pd.DataFrame({
        'price_ratio': price_ratio,
        'trust_score': trust_score,
        'listings_count': listings_count.astype(float),
        'days_active': days_active
    })
    
    scaler = StandardScaler()
    X_fraud_scaled = scaler.fit_transform(X_fraud)
    
    # Train Isolation Forest on normal behavior data
    if_model = IsolationForest(contamination=0.05, random_state=42)
    if_model.fit(X_fraud_scaled)
    
    joblib.dump({
        'model': if_model,
        'scaler': scaler
    }, os.path.join(models_dir, 'fraud_model.joblib'))
    print("Fraud Anomaly Detector trained and saved.")

    # 3. Train Riding Style Classifier
    rides_path = os.path.join(data_dir, 'rides_train.csv')
    if os.path.exists(rides_path):
        print("Training Riding Style Classifier (Random Forest)...")
        df = pd.read_csv(rides_path)
        X = df[['avg_speed', 'max_speed', 'accel_variance', 'harsh_braking_count']]
        y = df['riding_style']
        
        scaler_ride = StandardScaler()
        X_scaled = scaler_ride.fit_transform(X)
        
        clf = RandomForestClassifier(n_estimators=50, random_state=42)
        clf.fit(X_scaled, y)
        
        joblib.dump({
            'model': clf,
            'scaler': scaler_ride
        }, os.path.join(models_dir, 'riding_style_model.joblib'))
        print("Riding Style Classifier trained and saved.")

if __name__ == '__main__':
    generate_synthetic_data()
    train_and_save_models()
    print("All ML models trained and saved successfully with Indian metrics.")
