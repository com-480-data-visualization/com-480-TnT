import pandas as pd
import json

# Genres/subgenres à exclure
excluded = {"country", "arabic", "ambient", "lofi", "world", "gaming", "folk", "j-pop", "brazilian", "indie", "indian", "korean", "metal"}

df = pd.read_csv('merged_data_2.csv')

# Filtrer les lignes où genre OU sous-genre est exclu
filtered = df[
    (~df['playlist_genre'].str.lower().isin(excluded)) &
    (~df['playlist_subgenre'].str.lower().isin(excluded))
]

# Compter les occurrences pour chaque (genre, subgenre)
pairs = filtered.groupby(['playlist_genre', 'playlist_subgenre']).size().reset_index(name='value')

# Liste unique des genres et sous-genres
genres = pairs['playlist_genre'].dropna().unique().tolist()
subgenres = pairs['playlist_subgenre'].dropna().unique().tolist()

# Si un nom est à la fois genre et sous-genre, il doit être genre uniquement
genres_set = set(genres)
subgenres_only = [sg for sg in subgenres if sg not in genres_set]
nodes = [{'name': g} for g in genres] + [{'name': sg} for sg in subgenres_only]

# Mapping nom → index
name_to_index = {n['name']: i for i, n in enumerate(nodes)}

# Liens avec indices (on ignore les liens où le sous-genre est aussi un genre)
links = []
for _, row in pairs.iterrows():
    if pd.isna(row['playlist_genre']) or pd.isna(row['playlist_subgenre']):
        continue
    if row['playlist_subgenre'] in genres_set:
        continue
    links.append({
        'source': name_to_index[row['playlist_genre']],
        'target': name_to_index[row['playlist_subgenre']],
        'value': int(row['value'])
    })

with open('genre_subgenre_sankey.json', 'w', encoding='utf-8') as f:
    json.dump({'nodes': nodes, 'links': links}, f, indent=2, ensure_ascii=False)

print("JSON file created: genre_subgenre_sankey.json")