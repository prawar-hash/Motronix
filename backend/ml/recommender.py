import os
import csv
import pandas as pd

# Global Specs Catalog loaded dynamically on module import
BIKE_CATALOG = []
CSV_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'bikes_dataset.csv')

# Load the dynamic 350+ entries used-bike catalog
if os.path.exists(CSV_PATH):
    try:
        with open(CSV_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader):
                price_val = float(row['Price'])
                cc_val = int(row['Engine CC'])
                comfort_score = float(row['Comfort Score'])
                sport_score = float(row['Sport Score'])
                city_score = float(row['City Score'])
                highway_score = float(row['Highway Score'])
                
                # Deduce primary bike type category based on best score match
                type_scores = {
                    'cruiser': float(row['Cruiser Score']),
                    'sports': float(row['Sport Score']),
                    'commuter': float(row['Street Score']),
                    'adventure': float(row['Adventure Score']),
                    'scooter': float(row['Scooter Score'])
                }
                primary_type = max(type_scores, key=type_scores.get)
                
                priority_val = 'comfort' if comfort_score >= 8 else 'performance' if sport_score >= 8 else 'balanced'
                area_val = 'city' if city_score >= 8 and highway_score < 8 else 'highway' if highway_score >= 8 and city_score < 8 else 'both'
                
                BIKE_CATALOG.append({
                    'id': -(idx + 1),
                    'brand': row['Brand'],
                    'model': row['Model'],
                    'variant': row['Variant'],
                    'type': primary_type,
                    'engine_cc': cc_val,
                    'power': row['Power'],
                    'torque': row['Torque'],
                    'fuel_economy': float(row['Mileage']),
                    'fuel_tank': float(row['Fuel Tank']),
                    'weight': float(row['Weight']),
                    'seat_height': float(row['Seat Height']),
                    'ground_clearance': float(row['Ground Clearance']),
                    'abs': row['ABS'],
                    'traction_control': row['Traction Control'],
                    'bluetooth': row['Bluetooth'],
                    'navigation': row['Navigation'],
                    'quick_shifter': row['Quick Shifter'],
                    'riding_modes': row['Riding Modes'],
                    'tyre_type': row['Tyre Type'],
                    'transmission': row['Transmission'],
                    'fuel_type': row['Fuel Type'],
                    'cooling_type': row['Cooling Type'],
                    'asking_price': price_val,
                    'top_speed': float(row['Top Speed']),
                    'maintenance_cost': float(row['Maintenance Cost']),
                    'resale_score': float(row['Resale Score']),
                    'reliability_score': float(row['Reliability Score']),
                    'comfort_score': comfort_score,
                    'touring_score': float(row['Touring Score']),
                    'highway_score': highway_score,
                    'city_score': city_score,
                    'offroad_score': float(row['Off-road Score']),
                    'beginner_friendly': row['Beginner Friendly'],
                    'sport_score': sport_score,
                    'adventure_score': float(row['Adventure Score']),
                    'cruiser_score': float(row['Cruiser Score']),
                    'street_score': float(row['Street Score']),
                    'scooter_score': float(row['Scooter Score']),
                    'manufacturer': row['Manufacturer'],
                    'launch_year': int(row['Launch Year']),
                    'is_imported': True if price_val > 500000 else False,
                    'priority': priority_val,
                    'area': area_val,
                    'key_features': f"{row['Brand']} {row['Model']} variant with {cc_val}cc, {row['Power']} power, and {row['ABS']} ABS."
                })
    except Exception as e:
        print("Failed to parse dynamic bikes database:", e)

# Fallback catalog in case dataset files fail to read
if not BIKE_CATALOG:
    BIKE_CATALOG = [
        {
            'id': -1,
            'brand': 'Royal Enfield',
            'model': 'Classic 350',
            'variant': 'Standard',
            'type': 'cruiser',
            'engine_cc': 349,
            'power': '20.2 bhp',
            'torque': '27 Nm',
            'fuel_economy': 35.0,
            'fuel_tank': 13.0,
            'weight': 195.0,
            'seat_height': 805.0,
            'ground_clearance': 170.0,
            'abs': 'Dual Channel',
            'traction_control': 'No',
            'bluetooth': 'No',
            'navigation': 'No',
            'quick_shifter': 'No',
            'riding_modes': 'No',
            'tyre_type': 'Tubeless',
            'transmission': 'Manual',
            'fuel_type': 'Petrol',
            'cooling_type': 'Air Cooled',
            'asking_price': 220000.0,
            'top_speed': 114.0,
            'maintenance_cost': 500.0,
            'resale_score': 9.0,
            'reliability_score': 9.0,
            'comfort_score': 9.0,
            'touring_score': 8.0,
            'highway_score': 8.0,
            'city_score': 9.0,
            'offroad_score': 2.0,
            'beginner_friendly': 'Yes',
            'sport_score': 3.0,
            'adventure_score': 2.0,
            'cruiser_score': 9.0,
            'street_score': 6.0,
            'scooter_score': 1.0,
            'manufacturer': 'Royal Enfield',
            'launch_year': 2021,
            'is_imported': False,
            'priority': 'comfort',
            'area': 'both',
            'key_features': 'Retro thumping cruiser with excellent riding comfort.'
        }
    ]

def recommend_bikes_indian(
    budget_min: float,
    budget_max: float,
    usage: str,
    mileage_importance: str,
    preferred_bike_type: str,
    engine_power: str,
    riding_priority: str,
    resale_importance: str,
    riding_area: str,
    candidates: list,
    brand_preference: str = '',
    maintenance_budget: float = None,
    # Step 7 Filter Parameters
    brand: str = None,
    engine_cc: int = None,
    bike_type: str = None,
    purpose: str = None,
    fuel_type: str = None,
    city: str = None,
    state: str = None,
    mileage: float = None,
    seat_height: int = None,
    weight: int = None,
    abs_type: str = None,
    bluetooth: str = None,
    touring: bool = None,
    adventure: bool = None,
    sports: bool = None,
    cruiser: bool = None,
    scooter: bool = None,
    beginner: bool = None,
    intermediate: bool = None,
    expert: bool = None,
    **kwargs
) -> list:
    """Ranks listings & catalog specs using a dynamic 100-point hybrid weighted compatibility model."""
    
    combined_catalog = []
    
    # 1. Format and map active listings candidates from DB
    for c in candidates:
        model_lower = str(c.get('model', '')).lower()
        brand_clean = str(c.get('brand', '')).lower()
        
        # Match nearest specs mapping profile to listing
        specs = None
        for b in BIKE_CATALOG:
            if b['brand'].lower() == brand_clean and b['model'].lower() in model_lower:
                specs = b
                break
                
        if specs:
            item = specs.copy()
            item['id'] = c.get('id')
            item['asking_price'] = float(c.get('asking_price', 0))
            item['city'] = c.get('city', 'Mumbai')
            item['key_features'] = f"Marketplace listing: {c.get('condition', 'Good')} condition."
        else:
            # Fallback baseline specs for listings not matched in CSV catalog
            item = {
                'id': c.get('id'),
                'brand': c.get('brand'),
                'model': c.get('model'),
                'variant': 'Standard',
                'type': 'commuter' if 'pulsar' not in model_lower else 'sports',
                'engine_cc': 150,
                'power': '14 bhp',
                'torque': '13 Nm',
                'fuel_economy': 45.0,
                'fuel_tank': 12.0,
                'weight': 145.0,
                'seat_height': 790.0,
                'ground_clearance': 165.0,
                'abs': 'Single Channel',
                'traction_control': 'No',
                'bluetooth': 'No',
                'navigation': 'No',
                'quick_shifter': 'No',
                'riding_modes': 'No',
                'tyre_type': 'Tubeless',
                'transmission': 'Manual',
                'fuel_type': 'Petrol',
                'cooling_type': 'Air Cooled',
                'asking_price': float(c.get('asking_price', 0)),
                'top_speed': 115.0,
                'maintenance_cost': 400.0,
                'resale_score': 8.0,
                'reliability_score': 8.0,
                'comfort_score': 7.0,
                'touring_score': 6.0,
                'highway_score': 6.0,
                'city_score': 8.0,
                'offroad_score': 3.0,
                'beginner_friendly': 'Yes',
                'sport_score': 5.0,
                'adventure_score': 4.0,
                'cruiser_score': 5.0,
                'street_score': 8.0,
                'scooter_score': 1.0,
                'manufacturer': c.get('brand'),
                'launch_year': 2022,
                'is_imported': False,
                'priority': 'balanced',
                'area': 'city',
                'city_listed': c.get('city', 'Mumbai'),
                'key_features': 'Marketplace listing.'
            }
        combined_catalog.append(item)
        
    # 2. Append all static catalog items
    combined_catalog.extend(BIKE_CATALOG)
    
    # 3. Apply Multi-Criteria Filters (Step 7)
    filtered_catalog = []
    for item in combined_catalog:
        # Brand filter
        if brand and brand.lower() not in item['brand'].lower():
            continue
        # Engine capacity filter
        if engine_cc and not (engine_cc - 50 <= item['engine_cc'] <= engine_cc + 50):
            continue
        # Bike type category filter
        if bike_type and bike_type.lower() != item['type'].lower():
            continue
        # Purpose match filter
        if purpose:
            p_lower = purpose.lower()
            if p_lower == 'commute' and item['street_score'] < 6: continue
            if p_lower == 'touring' and item['touring_score'] < 6: continue
            if p_lower == 'sports' and item['sport_score'] < 6: continue
            if p_lower == 'off-road' and item['offroad_score'] < 6: continue
        # Fuel Type filter
        if fuel_type and fuel_type.lower() != item['fuel_type'].lower():
            continue
        # Location filter (applies only to active listings)
        if city and item.get('id', 0) > 0 and city.lower() != item.get('city_listed', '').lower():
            continue
        # Fuel economy filter
        if mileage and item['fuel_economy'] < mileage:
            continue
        # Ergonomics filters
        if seat_height and item['seat_height'] > seat_height:
            continue
        if weight and item['weight'] > weight:
            continue
        # ABS safety filter
        if abs_type and abs_type.lower() not in item['abs'].lower():
            continue
        # Features filter
        if bluetooth and bluetooth.lower() != item['bluetooth'].lower():
            continue
            
        # Boolean score thresholds
        if touring and item['touring_score'] < 7: continue
        if adventure and item['adventure_score'] < 7: continue
        if sports and item['sport_score'] < 7: continue
        if cruiser and item['cruiser_score'] < 7: continue
        if scooter and item['scooter_score'] < 7: continue
        
        # User experience level thresholds
        if beginner and item['beginner_friendly'] != 'Yes': continue
        if intermediate and not (125 <= item['engine_cc'] <= 400): continue
        if expert and item['engine_cc'] < 400: continue
        
        filtered_catalog.append(item)
        
    ranked_results = []
    
    # 4. Perform Hybrid Compatibility Scoring
    for item in filtered_catalog:
        score = 0.0
        reasons = []
        
        # 1. Budget Match (20 pts)
        price = float(item['asking_price'])
        if budget_min <= price <= budget_max:
            score += 20.0
            reasons.append("Fits budget")
        elif price < budget_min:
            # Under budget is acceptable with minor rating scaling
            pct_under = (budget_min - price) / budget_min
            score += max(12.0, 20.0 - pct_under * 10)
            reasons.append("Under budget")
        else:
            # Decay score for over-budget items
            pct_over = (price - budget_max) / budget_max
            over_val = max(0.0, 20.0 - pct_over * 60)
            score += over_val
            if over_val > 5:
                reasons.append("Slightly over budget")
                
        # 2. Purpose Match (15 pts)
        usage_clean = usage.lower()
        if usage_clean == 'daily commute':
            purpose_val = max(item['street_score'], item['scooter_score'])
        elif usage_clean == 'long rides':
            purpose_val = max(item['touring_score'], item['cruiser_score'])
        elif usage_clean == 'sports':
            purpose_val = item['sport_score']
        else: # off-road
            purpose_val = max(item['adventure_score'], item['offroad_score'])
            
        score += (purpose_val / 10.0) * 15.0
        if purpose_val >= 8:
            reasons.append(f"Highly optimized for {usage_clean}")
            
        # 3. Preferred Bike Type (10 pts)
        if preferred_bike_type.lower() == item['type']:
            score += 10.0
            reasons.append(f"Matches preferred {preferred_bike_type} type")
        else:
            # partial credit based on scores
            type_field = preferred_bike_type.lower()
            if type_field == 'commuter': type_field = 'street'
            score_col = f"{type_field}_score"
            if score_col in item:
                score += (item[score_col] / 10.0) * 8.0
                
        # 4. City & Highway Area compatibility (10 pts)
        area_clean = riding_area.lower()
        if area_clean == 'city':
            score += (item['city_score'] / 10.0) * 10.0
            if item['city_score'] >= 8: reasons.append("Comfortable city ride")
        elif area_clean == 'highway':
            score += (item['highway_score'] / 10.0) * 10.0
            if item['highway_score'] >= 8: reasons.append("Strong highway performance")
        else:
            score += ((item['city_score'] + item['highway_score']) / 20.0) * 10.0
            if item['city_score'] >= 8 and item['highway_score'] >= 8:
                reasons.append("Versatile in city & highway")
                
        # 5. Maintenance Budget Match (10 pts)
        maint_cost = item['maintenance_cost']
        if maintenance_budget:
            monthly_limit = float(maintenance_budget) / 12.0
            if maint_cost <= monthly_limit:
                score += 10.0
                reasons.append("Low maintenance cost")
            else:
                pct = (maint_cost - monthly_limit) / monthly_limit
                score += max(0.0, 10.0 - pct * 10)
        else:
            # cheaper is better
            score += (1.0 - min(1.0, maint_cost / 4000.0)) * 10.0
            if maint_cost <= 500:
                reasons.append("Very economical maintenance")
                
        # 6. Resale Value (5 pts)
        if resale_importance == 'yes':
            score += (item['resale_score'] / 10.0) * 5.0
            if item['resale_score'] >= 8: reasons.append("Excellent resale value")
        else:
            score += 5.0
            
        # 7. Fuel Economy / Mileage (10 pts)
        mileage_imp = mileage_importance.lower()
        economy = item['fuel_economy']
        if mileage_imp == 'high':
            score += min(10.0, (economy / 65.0) * 10.0)
            if economy >= 45: reasons.append(f"High fuel economy ({int(economy)} km/l)")
        elif mileage_imp == 'balanced':
            if economy >= 30:
                score += 10.0
                reasons.append(f"Decent mileage ({int(economy)} km/l)")
            else:
                score += 4.0
        else:
            score += 10.0
            
        # 8. Engine Power (10 pts)
        power_imp = engine_power.lower()
        cc = item['engine_cc']
        if power_imp == 'low':
            if cc < 150:
                score += 10.0
                reasons.append("Easy-to-handle power output")
            else:
                score += max(0.0, 10.0 - (cc - 150) * 0.02)
        elif power_imp == 'medium':
            if 150 <= cc <= 400:
                score += 10.0
                reasons.append("Good balance of mid-range power")
            else:
                score += 5.0
        else: # high
            if cc > 400:
                score += 10.0
                reasons.append("Powerful engine displacement")
            else:
                score += max(0.0, (cc / 400.0) * 10.0)
                
        # 9. Comfort & Reliability (5 pts)
        score += ((item['comfort_score'] + item['reliability_score']) / 20.0) * 5.0
        if item['comfort_score'] >= 8:
            reasons.append("Very comfortable thumping ride")
            
        # 10. Features Match (5 pts)
        feat_points = 0.0
        if item['abs'] != 'None': feat_points += 1.0
        if item['bluetooth'] == 'Yes': feat_points += 1.0
        if item['navigation'] == 'Yes': feat_points += 1.0
        if item['traction_control'] == 'Yes': feat_points += 1.0
        if item['riding_modes'] == 'Yes': feat_points += 1.0
        score += (feat_points / 5.0) * 5.0
        
        # Compile match percentage
        match_percentage = min(100.0, max(10.0, round(score, 1)))
        
        # Compile structured explanations (checkmark verdict)
        reasons_uniq = []
        for r in reasons:
            if r not in reasons_uniq:
                reasons_uniq.append(r)
        
        # Return at most 4 reasons, joined as checkmarks
        verdict_str = " | ".join([f"✓ {r}" for r in reasons_uniq[:4]])
        if not verdict_str:
            verdict_str = "✓ Matches core budget and riding requirements"
            
        ranked_results.append({
            'id': item['id'],
            'brand': item['brand'],
            'model': item['model'],
            'variant': item['variant'],
            'type': item['type'],
            'engine_cc': item['engine_cc'],
            'asking_price': item['asking_price'],
            'fuel_economy': item['fuel_economy'],
            'key_features': item['key_features'],
            'is_imported': item['is_imported'],
            'match_score': match_percentage,
            'why_recommended': verdict_str
        })
        
    # Sort results by compatibility rating
    ranked_results.sort(key=lambda x: x['match_score'], reverse=True)
    
    # 5. Apply Variant De-duplication Diversity Filter (Step 6)
    diverse_results = []
    seen_models = set()
    for item in ranked_results:
        model_key = f"{item['brand']}_{item['model']}".lower()
        if model_key not in seen_models:
            seen_models.add(model_key)
            diverse_results.append(item)
        if len(diverse_results) >= 8:
            break
            
    return diverse_results[:5]
