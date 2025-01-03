from datetime import datetime
import os
from dotenv import load_dotenv
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from ML_Models.Text_Classifier.DrugTextAnalyzer import DrugTextAnalyzer
from ML_Models.Profile_Score.user_profile_score import UserProfileScore
from Dashboard.Heatmap.heatmap_generation import heatmap_generation
from Dashboard.Activity_Graph.update_activity import update_activity_monitor
from Dashboard.Keyword_Monitoring.keywords import get_flagged_words_count



load_dotenv()

app = Flask(__name__)
CORS(app)
model = DrugTextAnalyzer()
ps = UserProfileScore()

# MongoDB connection
mongo_uri = os.getenv("MONGO_URI")
# print(f"MongoDB URI: {mongo_uri}")
client = MongoClient(mongo_uri)
db = client['test']  # Database name
users_collection = db['users']
activity_collection = db['activity']
flags_collection = db['flags'] 

# Dashboard endpoints
@app.route('/dashboard/heatmap')
def heatmap():
    heatmap_generation("Dashboard/Heatmap/Data/location.csv", users_collection)
    return render_template('heatmap.html')  # Serve the HTML heatmap

@app.route('/dashboard/activity', methods=['GET'])
def activity_graph():
    update_activity_monitor(users_collection, activity_collection)
    try:
        counts = []
        for activity in activity_collection.find():
            counts.append({str(activity["date"].date()): activity["userCount"]})
        return jsonify(counts)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/dashboard/keyword-monitor')
def keyword_monitoring():
    keyword_dict = get_flagged_words_count(flags_collection)
    return jsonify(keyword_dict)

@app.route('/dashboard/network')
def networkx():
    return render_template('networkX.html')

@app.post("/classify/text-predict")
def drugClassification():
    data = request.json
    postText = data["user"]
    result = model.process_input(str(postText))
    return jsonify({
        "classification": result
    })

@app.route('/database/users', methods=['GET'])
def get_users():   
    try:
        users = []

        for user in users_collection.find():
            print(user["isFlag"])
            # if user["isFlag"] == False:
            #     continue
            longitude = user.get("lastLoginLocation", "Unknown").get("longitude")
            latitude = user.get("lastLoginLocation", "Unknown").get("latitude")
            full_location = f"{latitude}, {longitude}"
            users.append({
                "id": str(user["_id"]),  # Convert MongoDB ObjectId to string
                "name": user["name"],
                "username": user.get("username", ""),
                "email": user.get("email", ""),
                "riskScore": user.get("riskScore", 0),
                "lastActive": user.get("lastActive"),
                "location": full_location,
                "behaviors": user.get("behaviors", []),
                "riskFactors": user.get("riskFactors", []),
            })
            
        print(users)
        return jsonify(users)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/profile-score/<user_id>', methods=['GET'])
def profile_score(user_id):
    try:
        # Convert string ID to MongoDB ObjectId
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Fetch necessary fields for the profile score calculation
        post_count = len(user["posts"])
        flags_data = flags_collection.find_one({"_id": ObjectId(user["flagged"])})
        flagged_words = flags_data.get("flaggedWords", []) if flags_data else []
        total_positives = flags_data.get("positiveCount", 0)
        total_coded = flags_data.get("negativeCount", 0)
        
        user_location_lat = user["lastLoginLocation"]["latitude"]
        user_location_lon = user["lastLoginLocation"]["longitude"]
        user_location = [user_location_lat, user_location_lon]
        csv_path = "Dashboard/Heatmap/Data/location.csv"

        # Calculate the profile score
        final_score = ps.total_score(
            post_count=post_count, 
            flagged_words=flagged_words, 
            user_location=user_location, 
            csv_path=csv_path, 
            total_positives=total_positives, 
            total_coded=total_coded
        )
        
        # Determine if the user should be flagged
        isFlag = True if final_score >= 30 else False

        # Update the isFlag field in the user's document
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},  # Convert user_id to ObjectId
            {"$set": {"isFlag": isFlag}}  # Update the isFlag field
        )

        # Check if the update was successful
        if result.modified_count > 0:
            print(f"User {user_id} updated successfully.")
        else:
            print(f"User {user_id} not updated or no changes made.")

        return jsonify({
            "user_id": user_id,
            "profile_score": final_score
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/flaggedWords/<user_id>', methods=['GET'])
def flagged_words(user_id):
    try:
        # Convert string ID to MongoDB ObjectId using PyMongo's native method
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404
        flags_data = flags_collection.find_one({"_id": ObjectId(user["flagged"])})
        flagged_words = flags_data.get("flaggedWords", []) if flags_data else []
        total_positives = flags_data.get("positiveCount", 0)
        total_coded = flags_data.get("negativeCount", 0)

        return jsonify({
            "user_id": user_id,
            "flagged_words": flagged_words,
            "total_positives": total_positives,
            "total_coded" : total_coded
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/vpn/<user_id>')
def vpnDetection(user_id):
    try:
        # Convert string ID to MongoDB ObjectId using PyMongo's native method
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404
        currentVpnStatus = user["currentVpnStatus"]

        return currentVpnStatus

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=8080, debug=True)