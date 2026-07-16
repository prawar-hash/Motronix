import numpy as np

def recommend_bikes(
    budget: float,
    usage: str,
    preferred_mileage: float,
    candidates: list
) -> list:
    """Ranks bike listing candidates by similarity to user preferences (budget, usage, mileage)."""
    if not candidates:
        return []
        
    ranked_candidates = []
    
    # Pre-defined mapping of brands suited to usage types
    usage_brand_suitability = {
        'commute': {'trek': 1.0, 'giant': 1.0, 'cannondale': 0.8, 'specialized': 0.8, 'santa cruz': 0.2},
        'sport': {'specialized': 1.0, 'cannondale': 1.0, 'santa cruz': 0.8, 'trek': 0.7, 'giant': 0.7},
        'off-road': {'santa cruz': 1.0, 'giant': 0.8, 'specialized': 0.8, 'trek': 0.6, 'cannondale': 0.5},
        'touring': {'trek': 1.0, 'cannondale': 0.9, 'giant': 0.8, 'specialized': 0.7, 'santa cruz': 0.3}
    }
    
    usage_clean = str(usage).strip().lower()
    brand_suitability = usage_brand_suitability.get(usage_clean, {})
    
    # Calculate similarity score for each candidate
    for item in candidates:
        # 1. Price match score (optimal if price <= budget, depreciates as price exceeds budget)
        price = float(item.get('asking_price', 0))
        if price <= budget:
            # Score near 1.0 if within budget, slightly lower if way below budget (user might want better quality)
            price_score = 1.0 - 0.2 * ((budget - price) / budget)
        else:
            # Drop score quickly if price exceeds budget
            price_score = max(0.0, 1.0 - 1.5 * ((price - budget) / budget))
            
        # 2. Mileage match score
        mileage = float(item.get('mileage', 0))
        if mileage <= preferred_mileage:
            mileage_score = 1.0
        else:
            # Drop score as mileage exceeds target
            mileage_score = max(0.0, 1.0 - 0.5 * ((mileage - preferred_mileage) / max(preferred_mileage, 1000.0)))
            
        # 3. Brand/Usage suitability score
        brand = str(item.get('brand', '')).strip().lower()
        suitability_score = brand_suitability.get(brand, 0.6) # Default to neutral (0.6)
        
        # 4. Condition score
        cond = str(item.get('condition', 'Good')).strip()
        cond_scores = {'Excellent': 1.0, 'Good': 0.8, 'Fair': 0.6, 'Poor': 0.3}
        cond_score = cond_scores.get(cond, 0.8)
        
        # Weighted similarity score
        # Budget/Price: 40%, Mileage: 25%, Brand Suitability: 20%, Condition: 15%
        total_score = (
            (price_score * 0.40) +
            (mileage_score * 0.25) +
            (suitability_score * 0.20) +
            (cond_score * 0.15)
        )
        
        # Round final score
        match_percentage = round(total_score * 100, 1)
        
        # Append candidate with rating
        item_copy = dict(item)
        item_copy['match_score'] = match_percentage
        ranked_candidates.append(item_copy)
        
    # Sort candidate listings by match score descending
    ranked_candidates.sort(key=lambda x: x['match_score'], reverse=True)
    return ranked_candidates
