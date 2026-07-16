import os
import joblib
import pandas as pd
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'saved_models', 'fraud_model.joblib')

SPAM_KEYWORDS = [
    'wire transfer', 'western union', 'moneygram', 'cashier check',
    'shipping only', 'no local pickup', 'gift card', 'whatsapp me'
]

def analyze_fraud_risk(
    asking_price: float,
    predicted_price: float,
    seller_trust_score: float,
    seller_listings_count: int,
    description: str,
    seller_days_active: int
) -> dict:
    """Evaluates fraud risk of a listing and returns a numeric risk score, label, and detailed reasons."""
    reasons = []
    score_rules = 0.0
    
    # 1. Pricing Anomaly check
    if predicted_price > 0:
        price_ratio = asking_price / predicted_price
        if price_ratio < 0.6:
            # Underpriced by > 40%
            score_rules += 35.0
            reasons.append("Asking price is suspiciously low compared to the fair market value (over 40% below).")
        elif price_ratio < 0.75:
            score_rules += 15.0
            reasons.append("Asking price is moderately low (25%-40% below fair market value).")
        elif price_ratio > 1.8:
            score_rules += 10.0
            reasons.append("Asking price is extremely high (over 80% above fair market value).")

    # 2. Seller Trust Score check
    if seller_trust_score < 50.0:
        score_rules += 30.0
        reasons.append("Seller trust score is low.")
    elif seller_trust_score < 75.0:
        score_rules += 10.0
        reasons.append("Seller trust score is moderate.")

    # 3. Seller listings velocity
    if seller_listings_count > 10:
        score_rules += 15.0
        reasons.append("Seller has a high volume of active listings (velocity anomaly).")

    # 4. New Account check
    if seller_days_active < 3:
        score_rules += 20.0
        reasons.append("Seller account is extremely new (created in the last 3 days).")
    elif seller_days_active < 14:
        score_rules += 10.0
        reasons.append("Seller account is relatively new (created in the last 2 weeks).")

    # 5. Spam Keyword check
    desc_lower = str(description).lower()
    found_spam = [kw for kw in SPAM_KEYWORDS if kw in desc_lower]
    if found_spam:
        score_rules += 25.0
        reasons.append(f"Description contains suspicious payment or pickup keywords: {', '.join(found_spam)}.")

    # Check for Isolation Forest model to combine with rule score
    score_if = 0.0
    if os.path.exists(MODEL_PATH):
        try:
            model_data = joblib.load(MODEL_PATH)
            if_model = model_data['model']
            scaler = model_data['scaler']
            
            # Form features for Isolation Forest
            price_ratio = asking_price / predicted_price if predicted_price > 0 else 1.0
            raw_features = np.array([[
                float(price_ratio),
                float(seller_trust_score),
                float(seller_listings_count),
                float(seller_days_active)
            ]])
            
            scaled_features = scaler.transform(raw_features)
            
            # Isolation forest decision function (returns value proportional to anomaly degree)
            # Higher negative value = more anomalous
            anomaly_score = float(if_model.decision_function(scaled_features)[0])
            
            # Map anomaly score (which is typically between -0.5 and 0.5) to a 0-100 scale
            # -0.2 and below is heavily anomalous
            if anomaly_score < 0:
                score_if = min(100.0, abs(anomaly_score) * 200.0)
        except Exception:
            pass

    # Final combined score: weighted average of rule score and isolation forest score
    if score_if > 0:
        final_score = (score_rules * 0.7) + (score_if * 0.3)
    else:
        final_score = score_rules
        
    final_score = min(100.0, max(0.0, round(final_score, 2)))
    
    # Classify into label
    if final_score >= 60.0:
        label = 'High'
    elif final_score >= 30.0:
        label = 'Medium'
    else:
        label = 'Low'
        
    if not reasons:
        reasons.append("No suspicious activity or anomalies detected.")
        
    return {
        'risk_score': final_score,
        'risk_label': label,
        'reasons': reasons
    }
