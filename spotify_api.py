import requests
import pandas as pd
import kagglehub
import json

import os
os.environ['KAGGLEHUB_CACHE'] = '/mnt/hddtheo/.cache/kagglehub'

token_endpoint = "https://accounts.spotify.com/api/token"
headers = {
    "Content-Type": "application/x-www-form-urlencoded",
}

with open("client_secret.txt", "r") as f:
    client_secret = f.read().strip()

data = {
    "grant_type": "client_credentials",
    "client_id": "f3d5aa8ba1a9455f988df557b2170ea5",
    "client_secret": client_secret,
}

def get_token():
    response = requests.post(token_endpoint, headers=headers, data=data)
    if response.status_code == 200:
        return response.json().get("access_token")
    else:
        raise Exception("Failed to retrieve access token: " + response.text)
    
class SpotifyAPI:
    def __init__(self, token):
        self.token = token
        self.base_url = "https://api.spotify.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    def refresh_token(self):
        global data
        response = requests.post(token_endpoint, headers=headers, data=data)
        if response.status_code == 200:
            self.token = response.json().get("access_token")
            self.headers["Authorization"] = f"Bearer {self.token}"
        else:
            raise Exception("Failed to refresh access token: " + response.text)

    def get_tracks(self, tracks_id):
        url = f"{self.base_url}/tracks"
        params = {"ids": ",".join(tracks_id)}
        response = requests.get(url, headers=self.headers, params=params)
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 401:
            self.refresh_token()
            return self.get_tracks(tracks_id)

        else:
            raise Exception("Failed to retrieve tracks: " + response.text)
        

api = SpotifyAPI(get_token())
print(api.get_track("11dFghVXANMlKmJXsNCbNl"))

# Download latest version
path = kagglehub.dataset_download("bwandowando/spotify-songs-with-attributes-and-lyrics")

print("Path to dataset files:", path)

df = pd.read_csv(path + "/songs_with_attributes_and_lyrics.csv")

track_ids = df["id"].unique()

batch_size = 200

# Split track_ids into batches
batches = [track_ids[i:i + batch_size] for i in range(0, len(track_ids), batch_size)]

# Create empty json file
output_file = "tracks_data.json"
with open(output_file, 'w') as f:
    json.dump([], f)

processed = 0

for batch in batches:
    try:
        tracks_data = api.get_tracks(batch)
        with open(output_file, 'r+') as f:
            existing_data = json.load(f)
            existing_data.extend(tracks_data['tracks'])
            f.seek(0)
            json.dump(existing_data, f)
        processed += len(tracks_data['tracks'])
        if processed % 1000 == 0:
            print(f"Processed {processed} tracks so far...")
    except Exception as e:
        print(f"Error processing batch: {e}")
        break


