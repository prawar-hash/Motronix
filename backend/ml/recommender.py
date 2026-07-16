import numpy as np

# Standard catalog of popular Indian & imported bikes to enrich recommendations
BIKE_CATALOG = [
    {
        'id': -1,
        'brand': 'Royal Enfield',
        'model': 'Classic 350',
        'type': 'cruiser',
        'engine_cc': 349,
        'asking_price': 220000,
        'fuel_economy': 35, # km/l
        'priority': 'comfort',
        'area': 'both',
        'maintenance_cost': 500, # monthly avg in ₹
        'resale_value': 'high',
        'key_features': 'Retro styling, thumping exhaust note, upright comfortable riding posture, dual-channel ABS.',
        'is_imported': False
    },
    {
        'id': -2,
        'brand': 'KTM',
        'model': 'Duke 390',
        'type': 'sports',
        'engine_cc': 373,
        'asking_price': 310000,
        'fuel_economy': 28,
        'priority': 'performance',
        'area': 'highway',
        'maintenance_cost': 1200,
        'resale_value': 'medium',
        'key_features': 'Aggressive acceleration, liquid-cooled, TFT display, slipper clutch, WP apex suspension.',
        'is_imported': False
    },
    {
        'id': -3,
        'brand': 'Yamaha',
        'model': 'R15 V4',
        'type': 'sports',
        'engine_cc': 155,
        'asking_price': 185000,
        'fuel_economy': 45,
        'priority': 'performance',
        'area': 'both',
        'maintenance_cost': 600,
        'resale_value': 'high',
        'key_features': 'Aerodynamic racing fairing, VVA engine, traction control system, quick shifter.',
        'is_imported': False
    },
    {
        'id': -4,
        'brand': 'Hero',
        'model': 'Splendor Plus',
        'type': 'commuter',
        'engine_cc': 97,
        'asking_price': 75000,
        'fuel_economy': 65,
        'priority': 'comfort',
        'area': 'city',
        'maintenance_cost': 250,
        'resale_value': 'high',
        'key_features': 'Extremely reliable, high fuel efficiency, low maintenance cost, massive service network.',
        'is_imported': False
    },
    {
        'id': -5,
        'brand': 'Bajaj',
        'model': 'Pulsar 150',
        'type': 'commuter',
        'engine_cc': 149,
        'asking_price': 115000,
        'fuel_economy': 50,
        'priority': 'balanced',
        'area': 'city',
        'maintenance_cost': 400,
        'resale_value': 'high',
        'key_features': 'Sporty commuter styling, DTS-i engine, comfortable double seat, responsive braking.',
        'is_imported': False
    },
    {
        'id': -6,
        'brand': 'Honda',
        'model': 'CB350 H\'ness',
        'type': 'cruiser',
        'engine_cc': 348,
        'asking_price': 210000,
        'fuel_economy': 35,
        'priority': 'comfort',
        'area': 'both',
        'maintenance_cost': 600,
        'resale_value': 'high',
        'key_features': 'Smooth counterbalanced engine, slip-assist clutch, Honda Selectable Torque Control (HSTC).',
        'is_imported': False
    },
    {
        'id': -7,
        'brand': 'Suzuki',
        'model': 'Hayabusa',
        'type': 'sports',
        'engine_cc': 1340,
        'asking_price': 1690000,
        'fuel_economy': 15,
        'priority': 'performance',
        'area': 'highway',
        'maintenance_cost': 4500,
        'resale_value': 'low',
        'key_features': 'Superbike icon, 190 HP engine, aerodynamic bodywork, advanced Suzuki Intelligent Ride System (SIRS).',
        'is_imported': True
    },
    {
        'id': -8,
        'brand': 'Kawasaki',
        'model': 'Ninja ZX-10R',
        'type': 'sports',
        'engine_cc': 998,
        'asking_price': 1650000,
        'fuel_economy': 12,
        'priority': 'performance',
        'area': 'highway',
        'maintenance_cost': 4000,
        'resale_value': 'low',
        'key_features': 'Track-focused handling, launch control, cornering management, Showa balance free suspension.',
        'is_imported': True
    },
    {
        'id': -9,
        'brand': 'Triumph',
        'model': 'Tiger 900 GT',
        'type': 'adventure',
        'engine_cc': 888,
        'asking_price': 1400000,
        'fuel_economy': 18,
        'priority': 'balanced',
        'area': 'both',
        'maintenance_cost': 3500,
        'resale_value': 'low',
        'key_features': 'Premium adventure tourer, adjustable seat height, Marzocchi suspension, 7-inch TFT display.',
        'is_imported': True
    },
    {
        'id': -10,
        'brand': 'Royal Enfield',
        'model': 'Himalayan 450',
        'type': 'adventure',
        'engine_cc': 452,
        'asking_price': 285000,
        'fuel_economy': 30,
        'priority': 'balanced',
        'area': 'both',
        'maintenance_cost': 800,
        'resale_value': 'high',
        'key_features': 'Sherpa 450 liquid-cooled engine, ride-by-wire, long-travel USD suspension, tubeless spoke rims.',
        'is_imported': False
    }
]

def recommend_bikes_indian(
    budget_min: float,
    budget_max: float,
    usage: str,
    mileage_importance: str,
    preferred_bike_type: str,
    brand_preference: str,
    engine_power: str,
    riding_priority: str,
    maintenance_budget: float,
    resale_importance: str,
    riding_area: str,
    candidates: list
) -> list:
    """Ranks bike listing candidates & static Indian/imported catalog models using a 10-parameter matching system."""
    
    # 1. Merge database listings with static catalog so there's always items to recommend
    combined_catalog = []
    
    # Format candidates list to match the schema
    for c in candidates:
        # Map condition choices to specs for matching
        cond = c.get('condition', 'Good')
        priority_val = 'comfort' if cond in ['Good', 'Excellent'] else 'balanced'
        
        # Deduce type based on model keywords
        model_lower = str(c.get('model', '')).lower()
        brand_lower = str(c.get('brand', '')).lower()
        
        btype = 'commuter'
        if any(x in model_lower for x in ['bullet', 'classic', 'hness', 'cruiser', 'meteor']):
            btype = 'cruiser'
        elif any(x in model_lower for x in ['rc', 'r15', 'ninja', 'zx', 'duke', 'pulsar', 'apache']):
            btype = 'sports'
        elif any(x in model_lower for x in ['tiger', 'adventure', 'himalayan', 'xpulse']):
            btype = 'adventure'
            
        cc_val = 150
        if '350' in model_lower: cc_val = 350
        elif '390' in model_lower: cc_val = 373
        elif '450' in model_lower: cc_val = 450
        elif '1000' in model_lower or 'zx' in model_lower: cc_val = 1000
        
        economy = 40
        if cc_val < 150: economy = 55
        elif cc_val <= 350: economy = 35
        elif cc_val <= 500: economy = 28
        else: economy = 15
        
        # Determine if imported
        is_imp = brand_lower in ['kawasaki', 'suzuki', 'triumph', 'harley-davidson'] and cc_val > 500

        combined_catalog.append({
            'id': c.get('id'),
            'brand': c.get('brand'),
            'model': c.get('model'),
            'type': btype,
            'engine_cc': cc_val,
            'asking_price': float(c.get('asking_price', 0)),
            'fuel_economy': economy,
            'priority': priority_val,
            'area': 'both',
            'maintenance_cost': 500 if cc_val < 350 else 1500,
            'resale_value': 'high' if not is_imp else 'low',
            'key_features': f"Verification item listed in {c.get('city', 'India')}.",
            'is_imported': is_imp,
            'listing_url': f"/listings/{c.get('id')}"
        })

    # Add the pre-defined static catalog
    combined_catalog.extend(BIKE_CATALOG)

    ranked_results = []
    
    # Process each item against the 10 parameters
    for item in combined_catalog:
        score = 0.0
        reasons = []
        
        # 1. Budget Range check (30% weight)
        price = float(item['asking_price'])
        if price >= budget_min and price <= budget_max:
            score += 30.0
            reasons.append("Fits perfectly within your budget range.")
        elif price < budget_min:
            # Under budget is acceptable, minor penalty
            score += 25.0
            reasons.append("Significantly below your target budget.")
        else:
            # Over budget, heavy penalty
            pct_over = (price - budget_max) / budget_max
            over_score = max(0.0, 30.0 - (pct_over * 60.0))
            score += over_score
            if over_score > 10:
                reasons.append("Slightly over your budget threshold.")

        # 2. Usage type match (10% weight)
        # commute -> commuter, long rides -> cruiser/adventure, sports -> sports, off-road -> adventure
        item_type = item['type']
        if usage == 'daily commute' and item_type == 'commuter':
            score += 10.0
        elif usage == 'long rides' and item_type in ['cruiser', 'adventure']:
            score += 10.0
        elif usage == 'sports' and item_type == 'sports':
            score += 10.0
        elif usage == 'off-road' and item_type == 'adventure':
            score += 10.0
        else:
            score += 5.0 # partial match

        # 3. Preferred Bike Type match (10% weight)
        if preferred_bike_type.lower() == item_type:
            score += 10.0
            reasons.append(f"Matches your preferred {preferred_bike_type} category.")
        else:
            score += 2.0

        # 4. Engine Power CC Match (10% weight)
        # low -> <150cc, medium -> 150-400cc, high -> >400cc
        cc = item['engine_cc']
        if engine_power == 'low' and cc < 150:
            score += 10.0
            reasons.append("Matches your preference for a light, easy-to-handle engine (under 150cc).")
        elif engine_power == 'medium' and cc >= 150 and cc <= 400:
            score += 10.0
            reasons.append("Features a solid mid-range engine (150cc-400cc) suited to your power preference.")
        elif engine_power == 'high' and cc > 400:
            score += 10.0
            reasons.append("Features a high-displacement engine (400cc+) giving maximum highway power.")
        else:
            score += 3.0

        # 5. Fuel Economy (Mileage) Match (10% weight)
        economy = item['fuel_economy']
        if mileage_importance == 'high':
            if economy >= 45:
                score += 10.0
                reasons.append(f"Outstanding fuel economy ({economy} km/l) matching your high priority.")
            elif economy >= 30:
                score += 6.0
                reasons.append(f"Decent fuel economy ({economy} km/l).")
            else:
                score += 1.0
        elif mileage_importance == 'balanced':
            if economy >= 30 and economy < 50:
                score += 10.0
                reasons.append(f"Balanced mileage rating of {economy} km/l fits your profile.")
            else:
                score += 5.0
        else: # low importance
            score += 10.0 # no penalty

        # 6. Riding Priority Match (10% weight)
        # comfort -> comfort, performance -> performance, balanced -> balanced
        item_priority = item['priority']
        if riding_priority == item_priority:
            score += 10.0
            reasons.append(f"Optimized for your riding priority: {riding_priority}.")
        else:
            score += 5.0

        # 7. Riding Area match (5% weight)
        # city -> commuter/cruiser, highway -> sports/cruiser, both -> adventure
        item_area = item['area']
        if riding_area == 'city' and item_type in ['commuter', 'cruiser']:
            score += 5.0
        elif riding_area == 'highway' and item_type in ['sports', 'cruiser']:
            score += 5.0
        elif riding_area == 'both':
            score += 5.0
        else:
            score += 2.0

        # 8. Maintenance Budget penalty (5% weight)
        maint_cost = item['maintenance_cost']
        if maintenance_budget:
            # Let's say maintenance_budget is yearly budget (convert to monthly by dividing by 12)
            monthly_budget = float(maintenance_budget) / 12.0
            if maint_cost <= monthly_budget:
                score += 5.0
            else:
                pct_over = (maint_cost - monthly_budget) / monthly_budget
                score += max(0.0, 5.0 - (pct_over * 5.0))
                reasons.append("Maintenance bills may slightly exceed your target budget.")
        else:
            score += 5.0 # no constraint

        # 9. Resale Value match (5% weight)
        item_resale = item['resale_value']
        if resale_importance == 'yes':
            if item_resale == 'high':
                score += 5.0
                reasons.append("Retains strong resale value in the Indian market.")
            else:
                score += 1.0
        else:
            score += 5.0

        # 10. Optional Brand Preference match (5% weight)
        if brand_preference:
            item_brand = item['brand'].lower()
            if brand_preference.lower() in item_brand:
                score += 5.0
                reasons.append(f"Made by your preferred brand: {item['brand']}.")
            else:
                score += 0.0
        else:
            score += 5.0 # neutral weight if no preference

        # Compile final match rating
        match_percentage = min(100.0, max(10.0, round(score, 1)))
        
        # Draft a personalized explanation summary
        if len(reasons) > 2:
            justification = f"This model is recommended because it {reasons[0].lower()} Also, it {reasons[1].lower()} and {reasons[2].lower()}"
        elif len(reasons) > 0:
            justification = f"Recommended because it {reasons[0].lower()}"
        else:
            justification = "Matches your core budget and riding layout requirements."
            
        ranked_results.append({
            'id': item['id'],
            'brand': item['brand'],
            'model': item['model'],
            'type': item['type'],
            'engine_cc': item['engine_cc'],
            'asking_price': item['asking_price'],
            'fuel_economy': item['fuel_economy'],
            'key_features': item['key_features'],
            'is_imported': item['is_imported'],
            'match_score': match_percentage,
            'why_recommended': justification
        })

    # Sort results by match percentage descending
    ranked_results.sort(key=lambda x: x['match_score'], reverse=True)
    
    # Return top 3-5 matches
    return ranked_results[:5]
