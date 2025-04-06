
import joblib
import os
import pandas as pd
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from feature_extraction import extract_features


load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow all origins

mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["test"]  
cached_collection = db["cachedurls"] 
scraped_collection = db["scrapedurls"] 


rf_blend, xgb_blend, meta_model = joblib.load("./models/phishing_blending.pkl")

def check_database(url):

    cached_result = cached_collection.find_one({"url": url})
    
    scraped_result = scraped_collection.find_one({"url": url})  

    return cached_result or scraped_result 


@app.route("/predict", methods=["post"])
def predict():
    data = request.json
    url = data.get("url")

    if not url:
        return jsonify({"error": "URL is required"}), 400

    db_result = check_database(url)

    if db_result:
        # If URL exists in DB, return the stored result
        return jsonify({
            "source": "cached",
            "url": url,
            "isPhishing": db_result["isPhishing"],
            "probability": db_result["probability"]
            
        })

    try:
        features = extract_features(url)
        # print(f"DEBUG: Extracted Features - {features}")

        if not features:  
            raise ValueError("Feature extraction failed!")
        features_df = pd.DataFrame([features])
    except Exception as e:
        print(f"❌ Error extracting features: {e}")
        return jsonify({"error": "Feature extraction failed! {str(e)}"}), 500

    # Get meta features using base models
    try:
        rf_pred = rf_blend.predict_proba(features_df)[:, 1]  
        xgb_pred = xgb_blend.predict_proba(features_df)[:, 1] 
    except Exception as e:
        print(f"❌ Error in model prediction: {e}")
        return jsonify({"error": "Model prediction failed!"}), 500

    # Create meta feature DataFrame
    blend_features = pd.DataFrame({"rf": [rf_pred[0]], "xgb": [xgb_pred[0]]})

    try:
        proba = meta_model.predict_proba(blend_features)[0][1]  

    except Exception as e:
        print(f"❌ Error in meta model prediction: {e}")
        return jsonify({"error": "Meta model prediction failed!"}), 500

    threshold = 0.7  
    prediction = 1 if proba > threshold else 0  # Fix: 1 = Safe, 0 = Phishing
    return jsonify({
        "source": "ml_model",
        "url": url,
        "isPhishing": prediction==0,        
        "probability": proba
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
