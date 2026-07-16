import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Recommended replacement thresholds (in miles)
MAINTENANCE_INTERVALS = {
    'Chain Lube & Tension': 500,
    'Brake Pads Replacement': 1500,
    'Tire Replacement': 3000,
    'Chain & Cassette Replacement': 4000,
    'General Tuning & Safety Check': 2000
}

# Standard baseline cost estimates for each service type
SERVICE_COSTS = {
    'Chain Lube & Tension': 25.0,
    'Brake Pads Replacement': 60.0,
    'Tire Replacement': 120.0,
    'Chain & Cassette Replacement': 180.0,
    'General Tuning & Safety Check': 90.0
}

def predict_next_maintenance(current_mileage: float, service_history: list) -> dict:
    """Predicts next due service mileage, date, estimated cost, and likely failures based on service history."""
    current_date = datetime.now()
    
    # 1. Handle empty history case
    if not service_history:
        next_mileage = current_mileage + 1000.0
        next_date = current_date + timedelta(days=90) # Default to 3 months
        
        return {
            'next_service_mileage': round(next_mileage, 1),
            'next_service_date': next_date.strftime('%Y-%m-%d'),
            'estimated_cost': 90.0, # Default tune-up cost
            'likely_failures': ['General Tuning & Safety Check'],
            'explanation': "Prediction based on general manufacturer recommendation (1,000 miles or 3 months)."
        }
        
    # 2. Convert service history to pandas DataFrame for analysis
    df = pd.DataFrame(service_history)
    df['service_date'] = pd.to_datetime(df['service_date'])
    df['mileage'] = df['mileage'].astype(float)
    df['cost'] = df['cost'].astype(float)
    
    df = df.sort_values(by='mileage')
    
    # 3. Calculate average usage rate (mileage per day)
    usage_rate = 5.0 # Default fallback: 5 miles per day
    if len(df) >= 2:
        mileage_diff = df['mileage'].max() - df['mileage'].min()
        days_diff = (df['service_date'].max() - df['service_date'].min()).days
        if days_diff > 0 and mileage_diff > 0:
            usage_rate = max(1.0, mileage_diff / days_diff)
            
    # Also adjust usage rate if current mileage is much higher than last service
    last_service_mileage = df['mileage'].max()
    last_service_date = df['service_date'].max()
    days_since_last = (current_date - last_service_date).days
    mileage_since_last = current_mileage - last_service_mileage
    
    if days_since_last > 15 and mileage_since_last > 0:
        usage_rate = max(1.0, (usage_rate + (mileage_since_last / days_since_last)) / 2.0)

    # 4. Check status of individual wear parts
    critical_failures = []
    estimated_cost = 0.0
    
    for service_type, interval in MAINTENANCE_INTERVALS.items():
        # Find last service of this type
        type_history = df[df['service_type'] == service_type]
        
        if type_history.empty:
            # Service never logged, check if current mileage exceeds threshold
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
        next_interval = 1000.0
    else:
        # Next service is due immediately or very soon
        next_interval = 200.0
        
    next_mileage = current_mileage + next_interval
    
    # Forecast service date
    days_to_service = int(next_interval / usage_rate)
    next_date = current_date + timedelta(days=max(7, days_to_service))
    
    # Historical cost baseline adjustor
    avg_past_cost = df['cost'].mean()
    if avg_past_cost > 0:
        estimated_cost = round((estimated_cost + avg_past_cost) / 2.0, 2)
        
    return {
        'next_service_mileage': round(next_mileage, 1),
        'next_service_date': next_date.strftime('%Y-%m-%d'),
        'estimated_cost': round(estimated_cost, 2),
        'likely_failures': critical_failures,
        'explanation': f"Extrapolated from {len(df)} logged service records. Projected daily usage: {round(usage_rate, 2)} miles/day."
    }
