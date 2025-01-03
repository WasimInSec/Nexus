import json
import folium
from pymongo import MongoClient
import os
from geopy.distance import geodesic
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Connect to MongoDB
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client['test']  # Database name
messages_collection = db['messages']
users_collection = db['users']

# Fetch users and messages data
users = {user["_id"]: user for user in users_collection.find()}
messages = messages_collection.find()

# Calculate average coordinates for map centering
user_coords = [
    (float(user["lastLoginLocation"]["latitude"]), float(user["lastLoginLocation"]["longitude"]))
    for user in users.values()
    if user["lastLoginLocation"]["latitude"] != "0" and user["lastLoginLocation"]["longitude"] != "0"
]
if user_coords:
    avg_lat = sum(coord[0] for coord in user_coords) / len(user_coords)
    avg_lon = sum(coord[1] for coord in user_coords) / len(user_coords)
else:
    avg_lat, avg_lon = 0, 0  # Default center if no valid coordinates are found

# Initialize the map
m = folium.Map(location=[avg_lat, avg_lon], zoom_start=12)

# Plot each user on the map
for user_id, user in users.items():
    user_location = (float(user["lastLoginLocation"]["latitude"]), float(user["lastLoginLocation"]["longitude"]))
    if user_location == (0, 0):
        continue  # Skip users with no location data

    user_popup = folium.Popup(f'User: {user["username"]}', parse_html=True)
    folium.Marker(
        user_location,
        popup=user_popup,
        icon=folium.Icon(color='blue', icon='user')
    ).add_to(m)

# Draw connections between senders and receivers
for message in messages:
    sender_id = message["senderId"]
    receiver_id = message["receiverId"]
    
    if sender_id in users and receiver_id in users:
        sender_location = (float(users[sender_id]["lastLoginLocation"]["latitude"]), 
                           float(users[sender_id]["lastLoginLocation"]["longitude"]))
        receiver_location = (float(users[receiver_id]["lastLoginLocation"]["latitude"]), 
                             float(users[receiver_id]["lastLoginLocation"]["longitude"]))

        # Skip if either sender or receiver has no location data
        if sender_location == (0, 0) or receiver_location == (0, 0):
            continue

        # Add sender marker
        folium.Marker(
            sender_location,
            popup=folium.Popup(f'Sender: {users[sender_id]["username"]}', parse_html=True),
            icon=folium.Icon(color='blue', icon='user')
        ).add_to(m)
        
        # Add receiver marker with an orange icon
        folium.Marker(
            receiver_location,
            popup=folium.Popup(f'Receiver: {users[receiver_id]["username"]}', parse_html=True),
            icon=folium.Icon(color='orange', icon='info-sign')
        ).add_to(m)

        # Calculate midpoint for arrow marker
        midpoint = (
            (sender_location[0] + receiver_location[0]) / 2,
            (sender_location[1] + receiver_location[1]) / 2
        )
        
        # Draw line from sender to receiver
        folium.PolyLine(
            [sender_location, receiver_location],
            color='black',
            weight=2,
            opacity=0.8
        ).add_to(m)

        # Add an arrow marker at the midpoint
        folium.Marker(
            location=midpoint,
            icon=folium.DivIcon(html="""<div style="font-size: 20px; transform: rotate(45deg);">&#10140;</div>""")
        ).add_to(m)

# Save the map to an HTML file
m.save("templates/networkX.html")
