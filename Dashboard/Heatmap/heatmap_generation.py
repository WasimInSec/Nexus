import pandas as pd
import folium
from folium.plugins import HeatMap
from Dashboard.Heatmap.data_creation import make_csv

# Load the CSV file
def heatmap_generation(datafile_path, users_collection):
    make_csv(datafile_path, users_collection)
    df = pd.read_csv(datafile_path)

    map_center = [df['latitude'].mean(), df['longitude'].mean()]  # Center around the mean lat/lon
    heatmap_map = folium.Map(location=map_center, zoom_start=6)

    heat_data = [[row['latitude'], row['longitude']] for index, row in df.iterrows()]

    HeatMap(heat_data).add_to(heatmap_map)

    heatmap_map.save('templates/heatmap.html')
