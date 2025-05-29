import pandas as pd

df = pd.read_csv("merged_data_2_cleanedL.csv")
df = df[['track_id', 'playlist_genre', 'liveness_x', 'danceability_x', 'clean_lyrics', 'track_album_release_date']].dropna()
df.rename(columns={'playlist_genre': 'genres', 'liveness_x': 'liveness', 'danceability_x': 'danceability', 'clean_lyrics': 'lyrics', 'track_album_release_date': 'date'}, inplace=True)

# Extract the year as integer from the date string
df['year'] = pd.to_datetime(df['date'], errors='coerce').dt.year

# Optional: drop rows where year is NaN (failed date parsing)
df = df.dropna(subset=['year'])
df['year'] = df['year'].astype(int)  # convert float to int
df = df.drop('date', axis=1)

print(df.head())

df.to_json("data.json", orient="records")