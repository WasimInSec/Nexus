from pymongo import MongoClient
import nltk
from datetime import datetime
from dotenv import load_dotenv
import os
import csv
from math import radians, sin, cos, sqrt, atan2

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client['test']  # Database name
users_collection = db['users'] 
user_collection = db['user'] 
activity_collection = db['activity'] 
posts_collection = db['posts']

class UserProfileScore:
    # Helper Functions for Risk Scoring
    def calculate_post_frequency_score(self, post_count):
        # do for post_count in a day
        return min(5, post_count)

    def calculate_keyword_score(self, flagged_words):
        return min(10, len(flagged_words))


    def calculate_location_score(self, user_location, csv_path):
        distance_threshold = 0.1

        def load_hotspots_from_csv(csv_path):
            hotspots = []
            with open(csv_path, newline='') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    lat = float(row['latitude'])  # Ensure latitude is a float
                    lon = float(row['longitude'])  # Ensure longitude is a float
                    hotspots.append((lat, lon))
            return hotspots

        hotspots = load_hotspots_from_csv(csv_path)

        def haversine_distance(lat1, lon1, lat2, lon2):
            R = 6371.0  # Earth radius in kilometers
            lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])  # Convert all to floats
            lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
            
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
            c = 2 * atan2(sqrt(a), sqrt(1 - a))
            
            return R * c  # Distance in kilometers

        user_lat, user_lon = map(float, user_location)  # Ensure user_location is a tuple of floats
        risk_score = 0
        
        for hotspot_lat, hotspot_lon in hotspots:
            distance = haversine_distance(user_lat, user_lon, hotspot_lat, hotspot_lon)
            
            if distance <= distance_threshold:
                risk_score = 5  # High risk if within the threshold
                break  # Exit once a hotspot within range is found

        return risk_score


    def calculate_message_score(self, total_positives, total_coded):
        total_positive=total_positives
        total_coded=0.5*total_coded
        return min(10, total_coded+total_positive)
    
    def total_score(self, post_count, flagged_words, user_location, csv_path, total_positives, total_coded):
        return ((self.calculate_post_frequency_score(post_count)+self.calculate_keyword_score(flagged_words)+self.calculate_location_score(user_location, csv_path)+self.calculate_message_score(total_positives, total_coded)) * 100) / 20

