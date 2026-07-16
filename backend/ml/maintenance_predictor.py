import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Recommended replacement thresholds (in Kilometers)
MAINTENANCE_INTERVALS = {
    'Chain Lube & Tension': 800,
    'Brake Pads Replacement': 2500,
    'Tire Replacement': 5000,
    'Chain & Cassette Replacement': 6000,
    'General Tuning & Safety Check': 3000
}

# Standard baseline cost estimates for each service type in Indian Rupees (₹)
SERVICE_COSTS = {
    'Chain Lube & Tension': 250.0,
    'Brake Pads Replacement': 850.0,
    'Tire Replacement': 3500.0,
    'Chain & Cassette Replacement': 5200.0,
    'General Tuning & Safety Check': 1200.0
}

def predict_next_maintenance(current_mileage: float, service_history: list) -> dict:
    """Predicts next due service distance (km), date, estimated cost (₹), and likely failures based on history."""
    current_date = datetime.now()
    
    # 1. Handle empty history case
    if not service_history:
        next_mileage = current_mileage + 1500.0 # 1500 km baseline
        next_date = current_date + timedelta(days=90) # Default to 3 months
        
        return {
            'next_service_mileage': round(next_mileage, 1),
            'next_service_date': next_date.strftime('%Y-%m-%d'),
            'estimated_cost': 1200.0, # Default tune-up cost in ₹
            'likely_failures': ['General Tuning & Safety Check'],
            'explanation': "Prediction based on general manufacture check-up intervals (1,500 km or 3 months)."
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
            
    # Also adjust usage rate if current mileage is much higher than last service
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
                estimated_cost += SERVICE_COSTS[service_type]
        else:
            last_type_mileage = type_history['mileage'].max()
            if (current_mileage - last_type_mileage) >= interval:
                critical_failures.append(service_type)
                estimated_cost += SERVICE_COSTS[service_type]
                
    # If no specific parts exceed threshold, recommend general tuning
    if not critical_failures:
        critical_failures.append('General Tuning & Safety Check')
        estimated_cost = SERVICE_COSTS['General Tuning & Safety Check']
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
        'likely_failures': critical_failures,
        'explanation': f"Extrapolated from {len(df)} logged service logs. Projected usage: {round(usage_rate, 2)} km/day."
    }
