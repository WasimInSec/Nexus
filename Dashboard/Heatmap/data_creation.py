import os
from dotenv import load_dotenv
from pymongo import MongoClient
import pandas as pd

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client['test']  # Database name
users_collection = db['user']  

def make_csv(datafile_path, users_collection):
    coordinates = []
    for user in users_collection.find():
        coordinates.append([user["lastLoginLocation"]["latitude"], user["lastLoginLocation"]["longitude"]])

    # Sample 2D array
    data = coordinates

    # Convert to DataFrame
    df = pd.DataFrame(data, columns=['latitude', 'longitude'])

    # Save to CSV
    df.to_csv(datafile_path, index=False)
