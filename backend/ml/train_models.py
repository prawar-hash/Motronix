import os
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV, KFold, cross_val_score
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, IsolationForest, GradientBoostingRegressor, ExtraTreesRegressor
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error, mean_absolute_percentage_error

# Domain knowledge mapping catalog for Indian production motorcycles
BRAND_MODELS_MAP = {
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

def generate_synthetic_data():
    """Generates synthetic CSV files for training used motorcycle listings in Indian Rupees (₹)."""
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    # 1. Generate Listing Price data with realistic depreciation models
    print("Generating synthetic price prediction dataset (2500 samples)...")
    n_samples = 2500
    np.random.seed(42)
    
    states_cities = [
        ('MH', 'Mumbai'), ('MH', 'Pune'), ('DL', 'Delhi'), ('KA', 'Bangalore'),
        ('TN', 'Chennai'), ('TS', 'Hyderabad'), ('HR', 'Gurugram'), ('UP', 'Noida')
    ]
    
    service_histories = ['Excellent', 'Good', 'Average', 'Poor']
    accident_histories = ['None', 'Minor', 'Major']
    conditions = ['Excellent', 'Good', 'Fair', 'Poor']
    
    data_listings = []
    brands = list(BRAND_MODELS_MAP.keys())
    
    for _ in range(n_samples):
        brand = np.random.choice(brands)
        model_options = list(BRAND_MODELS_MAP[brand].keys())
        model = np.random.choice(model_options)
        
        specs = BRAND_MODELS_MAP[brand][model]
        original_price = specs['original_price']
        engine_cc = specs['engine_cc']
        demand_score = specs['demand'] + np.random.randint(-1, 2)
        resale_score = specs['resale'] + np.random.randint(-1, 2)
        
        # Keep values in boundary
        demand_score = max(1, min(10, demand_score))
        resale_score = max(1, min(10, resale_score))
        
        year = np.random.randint(2012, 2027)
        age = 2026 - year
        
        # Generate realistic mileage (km run) mapped to age
        if age == 0:
            mileage = np.random.randint(100, 1500)
        else:
            mileage = int(age * np.random.normal(6500, 1800))
            mileage = max(1000, mileage)
            
        fuel_type = 'Electric' if 'Activa' in model and np.random.rand() < 0.15 else 'Petrol'
        transmission = 'Automatic' if 'Activa' in model or 'Access' in model else 'Manual'
        
        # Multi-owner probabilities
        if age <= 2:
            owner_count = np.random.choice([1, 2], p=[0.9, 0.1])
        elif age <= 5:
            owner_count = np.random.choice([1, 2, 3], p=[0.7, 0.25, 0.05])
        else:
            owner_count = np.random.choice([1, 2, 3, 4], p=[0.4, 0.4, 0.15, 0.05])
            
        service_history = np.random.choice(service_histories, p=[0.25, 0.50, 0.20, 0.05])
        accident_history = np.random.choice(accident_histories, p=[0.85, 0.12, 0.03])
        insurance_validity = np.random.choice(['Active', 'Expired'], p=[0.75, 0.25])
        
        state, city = states_cities[np.random.randint(len(states_cities))]
        
        # Select variant type (Base, Mid, Top)
        variant_type = np.random.choice(['Base', 'Mid', 'Top'], p=[0.45, 0.35, 0.20])
        variant_mult = {'Base': 1.0, 'Mid': 1.08, 'Top': 1.18}[variant_type]
        
        # Deduce condition based on age, mileage and accident history
        cond_weights = [0.4, 0.4, 0.15, 0.05]
        if age > 7 or mileage > 50000 or accident_history == 'Major':
            cond_weights = [0.05, 0.15, 0.50, 0.30]
        elif age > 4 or mileage > 30000 or accident_history == 'Minor':
            cond_weights = [0.10, 0.40, 0.40, 0.10]
        condition = np.random.choice(conditions, p=cond_weights)
        
        # Expected annual maintenance cost (3-8% of ex-showroom, higher for older/poorer shape)
        base_maint_rate = np.random.uniform(0.03, 0.07)
        maint_modifier = 1.0 + (age * 0.05) + (3 - conditions.index(condition)) * 0.1
        annual_maintenance_cost = int(original_price * base_maint_rate * maint_modifier)
        
        # DEPRECIATION MODEL CALCULATION (Multiplicative)
        # Choose depreciation rate profile by brand category
        if brand in ['royal enfield', 'harley-davidson']:
            deprec_rate = 0.88  # Retains ~88% value per year
        elif brand in ['ktm', 'kawasaki']:
            deprec_rate = 0.83  # Sports/High mileage drops faster
        elif brand in ['hero', 'honda']:
            deprec_rate = 0.90  # High volume utility retains value best
        else:
            deprec_rate = 0.86
            
        base_deprec = deprec_rate ** age
        
        # Mileage Penalty
        expected_km = age * 8000
        mileage_factor = 1.0
        if age > 0 and mileage > expected_km:
            overage_ratio = (mileage - expected_km) / expected_km
            mileage_factor = 1.0 - min(0.25, overage_ratio * 0.1)
            
        # Condition Modifier
        cond_mult = {'Excellent': 1.10, 'Good': 1.00, 'Fair': 0.80, 'Poor': 0.55}[condition]
        
        # Service History Modifier
        service_mult = {'Excellent': 1.05, 'Good': 1.00, 'Average': 0.88, 'Poor': 0.70}[service_history]
        
        # Accident Penalty
        accident_mult = {'None': 1.00, 'Minor': 0.82, 'Major': 0.48}[accident_history]
        
        # Owner count Penalty
        owner_mult = {1: 1.00, 2: 0.92, 3: 0.84, 4: 0.72}[owner_count]
        
        # Insurance Modifier
        insurance_mult = 1.02 if insurance_validity == 'Active' else 0.97
        
        # Demand bonus (metro city adds slight markup)
        demand_bonus = (demand_score * 0.012) * original_price
        
        # Calculate market value
        calculated_price = (original_price * variant_mult * base_deprec * mileage_factor * cond_mult * 
                            service_mult * accident_mult * owner_mult * insurance_mult) + demand_bonus
        
        # Add normal statistical noise (+/- 4%)
        noise = np.random.normal(0, original_price * 0.02)
        price = max(10000.0, round(calculated_price + noise, 2))
        
        # Cap upper bounds under ex-showroom price
        price = min(original_price * 0.96, price)
        
        data_listings.append({
            'brand': brand,
            'model': model,
            'variant_type': variant_type,
            'year': year,
            'age': age,
            'mileage': mileage,
            'engine_cc': engine_cc,
            'fuel_type': fuel_type,
            'transmission': transmission,
            'owner_count': owner_count,
            'service_history': service_history,
            'accident_history': accident_history,
            'insurance_validity': insurance_validity,
            'registration_state': state,
            'city': city,
            'condition': condition,
            'annual_maintenance_cost': annual_maintenance_cost,
            'demand_score': demand_score,
            'resale_score': resale_score,
            'original_price': original_price,
            'price': price
        })
        
    df_listings = pd.DataFrame(data_listings)
    listings_csv_path = os.path.join(data_dir, 'listings_train.csv')
    df_listings.to_csv(listings_csv_path, index=False)
    print(f"Saved {n_samples} synthetic Indian bike listings to: {listings_csv_path}")
    
    # 2. Generate Riding Style data in km/h (preserved for backend compatibility)
    print("Generating synthetic riding style classifier data (km/h)...")
    n_rides = 300
    data_rides = []
    
    for _ in range(n_rides):
        style = np.random.choice(['Calm', 'Moderate', 'Aggressive'], p=[0.4, 0.4, 0.2])
        if style == 'Calm':
            avg_speed = np.random.uniform(15.0, 30.0)
            max_speed = avg_speed + np.random.uniform(5.0, 15.0)
            accel_var = np.random.uniform(0.1, 0.5)
            harsh_braking = np.random.randint(0, 2)
        elif style == 'Moderate':
            avg_speed = np.random.uniform(30.0, 50.0)
            max_speed = avg_speed + np.random.uniform(15.0, 25.0)
            accel_var = np.random.uniform(0.4, 1.2)
            harsh_braking = np.random.randint(1, 4)
        else:
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

def engineer_features(df):
    """Applies domain-knowledge feature engineering on listings data."""
    df_feat = df.copy()
    
    # 1. Age derived metric (prevent divide-by-zero)
    df_feat['vehicle_age'] = df_feat['age']
    
    # 2. Mileage run per year
    df_feat['mileage_per_year'] = df_feat['mileage'] / (df_feat['vehicle_age'] + 0.1)
    
    # 3. Numeric encoding modifiers for algorithms
    df_feat['service_score'] = df_feat['service_history'].map({'Excellent': 4, 'Good': 3, 'Average': 2, 'Poor': 1}).fillna(3)
    df_feat['condition_weight'] = df_feat['condition'].map({'Excellent': 4, 'Good': 3, 'Fair': 2, 'Poor': 1}).fillna(3)
    df_feat['accident_score'] = df_feat['accident_history'].map({'None': 0, 'Minor': 1, 'Major': 2}).fillna(0)
    df_feat['variant_score'] = df_feat['variant_type'].map({'Base': 1, 'Mid': 2, 'Top': 3}).fillna(1)
    
    # 4. Maintenance cost ratio to original ex-showroom price
    df_feat['maintenance_to_original_ratio'] = df_feat['annual_maintenance_cost'] / (df_feat['original_price'] + 0.1)
    
    return df_feat

def train_and_save_models():
    """Trains and serializes ML models with grid-search hyperparameter optimization."""
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    models_dir = os.path.join(os.path.dirname(__file__), 'saved_models')
    os.makedirs(models_dir, exist_ok=True)
    
    # 1. Train Price Predictor Pipeline
    listings_path = os.path.join(data_dir, 'listings_train.csv')
    if os.path.exists(listings_path):
        print("Starting Price Prediction Refactoring Pipeline...")
        df_raw = pd.read_csv(listings_path)
        
        # Target variable
        y = df_raw['price']
        X_raw = df_raw.drop(columns=['price'])
        
        # Apply Feature Engineering
        X = engineer_features(X_raw)
        
        # Define Columns for Transformers
        categorical_cols = [
            'brand', 'model', 'variant_type', 'fuel_type', 'transmission', 
            'service_history', 'accident_history', 'insurance_validity', 
            'registration_state', 'city', 'condition'
        ]
        numerical_cols = [
            'age', 'mileage', 'engine_cc', 'owner_count', 
            'annual_maintenance_cost', 'demand_score', 'resale_score', 
            'original_price', 'mileage_per_year', 'service_score', 
            'condition_weight', 'accident_score', 'maintenance_to_original_ratio',
            'variant_score'
        ]
        
        # Preprocessing Transformers
        numerical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])
        
        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ])
        
        preprocessor = ColumnTransformer(transformers=[
            ('num', numerical_transformer, numerical_cols),
            ('cat', categorical_transformer, categorical_cols)
        ])
        
        # Split Train/Test
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Define models to compare
        regressors = {
            'RandomForest': (RandomForestRegressor(random_state=42), {
                'regressor__n_estimators': [100, 200],
                'regressor__max_depth': [10, 15, None],
                'regressor__min_samples_split': [2, 5]
            }),
            'GradientBoosting': (GradientBoostingRegressor(random_state=42), {
                'regressor__n_estimators': [100, 150],
                'regressor__learning_rate': [0.05, 0.1],
                'regressor__max_depth': [4, 6]
            }),
            'ExtraTrees': (ExtraTreesRegressor(random_state=42), {
                'regressor__n_estimators': [100, 200],
                'regressor__max_depth': [10, 15, None]
            })
        }
        
        best_r2 = -1.0
        best_pipeline = None
        best_name = ""
        best_metrics = {}
        
        for name, (reg, params) in regressors.items():
            print(f"Tuning hyperparameters for {name} Regressor...")
            full_pipeline = Pipeline(steps=[
                ('preprocessor', preprocessor),
                ('regressor', reg)
            ])
            
            grid = GridSearchCV(full_pipeline, param_grid=params, cv=3, scoring='r2', n_jobs=-1)
            grid.fit(X_train, y_train)
            
            # Predict and evaluate on testing split
            y_pred = grid.predict(X_test)
            r2 = r2_score(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            mape = mean_absolute_percentage_error(y_test, y_pred)
            
            print(f"{name} GridSearch Results -> R2: {r2:.4f} | MAE: {mae:.2f}")
            
            if r2 > best_r2:
                best_r2 = r2
                best_pipeline = grid.best_estimator_
                best_name = name
                best_metrics = {
                    'r2': r2,
                    'mae': mae,
                    'rmse': rmse,
                    'mape': mape,
                    'best_params': grid.best_params_
                }
                
        # Perform 5-Fold Cross Validation on Best Pipeline
        print(f"\nEvaluating Best Model: {best_name} using 5-Fold CV...")
        cv_scores = cross_val_score(best_pipeline, X, y, cv=5, scoring='r2', n_jobs=-1)
        
        # Calculate residual statistics
        y_test_pred = best_pipeline.predict(X_test)
        residuals = y_test - y_test_pred
        residual_mean = np.mean(residuals)
        residual_std = np.std(residuals)
        
        print("\n" + "="*40)
        print("ML PRICE PREDICTION METRICS")
        print("="*40)
        print(f"Best Model Selected:   {best_name}")
        print(f"Testing R2 Score:      {best_metrics['r2']:.4f}")
        print(f"Mean Absolute Error:  Rs. {best_metrics['mae']:.2f}")
        print(f"Root Mean Sq Error:    Rs. {best_metrics['rmse']:.2f}")
        print(f"Mean Abs Pct Error:    {best_metrics['mape']*100:.2f}%")
        print(f"5-Fold CV R2 Mean:     {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
        print(f"Residual Mean Error:  Rs. {residual_mean:.2f} (+/- Rs. {residual_std:.2f})")
        print("="*40)
        
        # Save complete pipeline to models directory
        model_save_path = os.path.join(models_dir, 'price_model.joblib')
        joblib.dump({
            'pipeline': best_pipeline,
            'feature_names': X.columns.tolist(),
            'metadata': {
                'model_name': best_name,
                'r2': best_metrics['r2'],
                'mae': best_metrics['mae'],
                'rmse': best_metrics['rmse'],
                'mape': best_metrics['mape'],
                'cv_mean': cv_scores.mean()
            }
        }, model_save_path)
        print(f"Pipeline saved successfully to: {model_save_path}")
        
    # 2. Train Fraud Detector (Isolation Forest - preserved for backend compatibility)
    print("Training Fraud Anomaly Detector (Isolation Forest)...")
    np.random.seed(42)
    n_fraud_train = 300
    
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
    
    if_model = IsolationForest(contamination=0.05, random_state=42)
    if_model.fit(X_fraud_scaled)
    
    joblib.dump({
        'model': if_model,
        'scaler': scaler
    }, os.path.join(models_dir, 'fraud_model.joblib'))
    print("Fraud Anomaly Detector trained and saved.")
 
    # 3. Train Riding Style Classifier (preserved for backend compatibility)
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
