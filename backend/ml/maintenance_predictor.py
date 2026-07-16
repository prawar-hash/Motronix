import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Recommended replacement thresholds (in Kilometers)
MAINTENANCE_INTERVALS = {
    'Chain Lube & Tension': 800,
    'Brake Pads Replacement': 2500,
    'Tire Replacement': 5000,
    'Chain & Cassette Replacement': 6000,
    'General Tuning & Safety Check': 3000,
    'Scheduled Service': 4000
}

# Standard baseline cost estimates for each service type in Indian Rupees (₹)
SERVICE_COSTS = {
    'Chain Lube & Tension': 250.0,
    'Brake Pads Replacement': 850.0,
    'Tire Replacement': 3500.0,
    'Chain & Cassette Replacement': 5200.0,
    'General Tuning & Safety Check': 1200.0,
    'Scheduled Service': 2500.0
}

def predict_next_maintenance(current_mileage: float, service_history: list, brand: str = 'Other', model: str = 'Other') -> dict:
    """Predicts next due service distance, date, cost (₹), and likely failures based on history and bike brand/model."""
    current_date = datetime.now()
    brand_clean = str(brand).strip().lower()
    model_clean = str(model).strip().lower()
    
    # 1. Handle empty history case
    if not service_history:
        next_mileage = current_mileage + 1500.0 # 1500 km baseline
        next_date = current_date + timedelta(days=90) # Default to 3 months
        
        # Calculate model specific defaults
        est_cost = 1200.0
        failures = ['General Tuning & Safety Check']
        
        if 'royal enfield' in brand_clean:
            failures.append('Tappet & Valve Clearance Check')
            est_cost = 1800.0
        elif 'ktm' in brand_clean:
            failures.append('Coolant Level Check')
            est_cost = 2200.0
        elif 'hero' in brand_clean:
            failures.append('Drum Brake Adjustment')
            est_cost = 450.0
        elif brand_clean in ['kawasaki', 'suzuki', 'triumph', 'harley-davidson'] or 'zx' in model_clean or 'hayabusa' in model_clean:
            failures.append('Fork Seal Inspection')
            failures.append('Synthetic Engine Flush')
            est_cost = 6500.0
            
        return {
            'next_service_mileage': round(next_mileage, 1),
            'next_service_date': next_date.strftime('%Y-%m-%d'),
            'estimated_cost': est_cost,
            'likely_failures': failures,
            'explanation': f"First scan for {brand} {model}. Estimates loaded from brand baseline defaults."
        }
        
    # 2. Convert service history to pandas DataFrame for analysis
    df = pd.DataFrame(service_history)
    df['service_date'] = pd.to_datetime(df['service_date'])
    df['mileage'] = df['mileage'].astype(float)
    df['cost'] = df['cost'].astype(float)
    
    df = df.sort_values(by='mileage')
    
    # 3. Calculate average usage rate (kilometers per day)
    usage_rate = 10.0 # Default fallback: 10 km per day
    if len(df) >= 2:
        mileage_diff = df['mileage'].max() - df['mileage'].min()
        days_diff = (df['service_date'].max() - df['service_date'].min()).days
        if days_diff > 0 and mileage_diff > 0:
            usage_rate = max(2.0, mileage_diff / days_diff)
            
    # Adjust usage rate based on current mileage vs last service
    last_service_mileage = df['mileage'].max()
    last_service_date = df['service_date'].max()
    days_since_last = (current_date - last_service_date).days
    mileage_since_last = current_mileage - last_service_mileage
    
    if days_since_last > 15 and mileage_since_last > 0:
        usage_rate = max(2.0, (usage_rate + (mileage_since_last / days_since_last)) / 2.0)

    # 4. Check status of individual wear parts
    critical_failures = []
    estimated_cost = 0.0
    
    for service_type, interval in MAINTENANCE_INTERVALS.items():
        type_history = df[df['service_type'] == service_type]
        
        if type_history.empty:
            if current_mileage >= interval:
                critical_failures.append(service_type)
                estimated_cost += SERVICE_COSTS.get(service_type, 1200.0)
        else:
            last_type_mileage = type_history['mileage'].max()
            if (current_mileage - last_type_mileage) >= interval:
                critical_failures.append(service_type)
                estimated_cost += SERVICE_COSTS.get(service_type, 1200.0)
                
    # Model-specific custom alerts
    if 'royal enfield' in brand_clean:
        if current_mileage >= 3000:
            critical_failures.append('Tappet & Valve Clearance Check')
            estimated_cost += 600.0
        critical_failures.append('Engine Oil Leak Check')
    elif 'ktm' in brand_clean:
        critical_failures.append('Coolant Level Check')
        if current_mileage >= 5000:
            critical_failures.append('Fuel Injector Flush')
            estimated_cost += 1000.0
    elif 'hero' in brand_clean:
        critical_failures.append('Drum Brake Line Tensioning')
        estimated_cost += 150.0
    elif brand_clean in ['kawasaki', 'suzuki', 'triumph', 'harley-davidson'] or 'zx' in model_clean or 'hayabusa' in model_clean:
        critical_failures.append('Fork Seal & USD Inspection')
        critical_failures.append('High-CC Radiator Flush')
        estimated_cost += 3500.0 # premium multiplier
        
    # If no specific parts exceed threshold, recommend general checkup
    if not critical_failures:
        critical_failures.append('Scheduled Service')
        estimated_cost = SERVICE_COSTS['Scheduled Service']
        next_interval = 1500.0
    else:
        next_interval = 300.0
        
    next_mileage = current_mileage + next_interval
    
    # Forecast service date
    days_to_service = int(next_interval / usage_rate)
    next_date = current_date + timedelta(days=max(7, days_to_service))
    
    avg_past_cost = df['cost'].mean()
    if avg_past_cost > 0:
        estimated_cost = round((estimated_cost + avg_past_cost) / 2.0, 2)
        
    return {
        'next_service_mileage': round(next_mileage, 1),
        'next_service_date': next_date.strftime('%Y-%m-%d'),
        'estimated_cost': round(estimated_cost, 2),
        'likely_failures': list(set(critical_failures)), # unique
        'explanation': f"Diagnostics compiled for {brand} {model}. Historical usage logs calculate to {round(usage_rate, 2)} km/day."
    }
