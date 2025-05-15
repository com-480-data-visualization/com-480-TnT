Com-480 Data Visualization Course, EPFL. 

Project page of group TnT (Théo & Théo) and Caro en fait!

[Milestone 1](#milestone-1)

[Milestone 2](#milestone-2)

## Milestone 1

### Dataset

The main dataset that we plan on using that most fit what we have in mind are 
- [Spotify Tracks Dataset](https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset): This is a dataset of Spotify tracks over a range of 125 different genres. Each track has some audio features associated with it.  Great usability note on kaggle (10), so we don't expect that it will be too hard to work with. Contains about 90'000 songs.
- [Spotify Charts](https://www.kaggle.com/datasets/dhruvildave/spotify-charts): Big dataset with a lot of columns for each song. Importantly, it contains information about the ranking (top200, hot50) and geographic information which could be interesting for our problematic.


Additionally, we have a few backup dataset that we might want to consider later on, also because they come from other sources than spotify which might be interesting.

- [Billboard Hot-100 2000-2023](https://www.kaggle.com/datasets/suparnabiswas/billboard-hot-1002000-2023-data-with-features): Captures song rankings over the decades, offering insights into music trends. Great useability note. It contains over 2000 songs from 2000 to 2023 with interesting features such as danceability, loudness, energy and acoucstiness. However, we expect that most of the songs in this dataset are contained in the spotify charts dataset above.
- [Million Song Dataset](http://millionsongdataset.com/): Enormous dataset (280Gb) although there exist a sample version (1.8Gb). It contains information about a lot of songs but it might be hard to work with although it is well documented. We might want to keep it in mind for doing large scale statistics.

### Problematic

**Overview & Motivation**

Music is a universal language, yet its trends and influences vary across cultures and regions. By analyzing data on music charts, geographical regions, danceability, and genres, Databeats seeks to uncover patterns in mainstream and underground music. Are there global hits that dominate everywhere, or do local preferences shape unique trends? How do underground genres influence mainstream music?

**Main Axes of Development**

1. **Global vs. Regional Trends** – Analyzing which songs and genres dominate worldwide vs. those popular in specific regions.
2. **Evolution of Music Trends** – Visualizing how music preferences change over time, highlighting genre shifts and emerging styles.
3. **Musical Characteristics & Popularity** – Investigating danceability, energy, and other musical attributes that correlate with mainstream success.
4. **Underground Influence** – Exploring the role of niche genres and subcultures in shaping mainstream music.

**Target Audience**

- **Music Enthusiasts & Historians** interested in the evolution of music trends.
- **Artists & Producers** looking to understand how underground genres influence the mainstream.
- **Data Analysts & Researchers** exploring cultural trends through music.

This visualization will provide insights into the factors shaping musical taste and the connections between underground and mainstream music.


### Exploratory Data Analysis

See jupyter notebook. We only explore the main datasets as we are not sure to use our backups.

We merged the two spotify datasets together which results in 11'293'758 entries and 6894 unique songs. Since the spotify charts dataset contains multiple times a single song for each of each it position in the charts (i.e., as the song moves through the ranks) in each of the countries in which the song got in the charts and the spotify tracks dataset containes multiple times the same song for each of its genre, then a song will appear multiple times in the merge dataset. We keep it that way for now as we don't know exactly know what we will do with it and thus it might be preferable to keep it that way.

Let's now see some statistics

- The dataset countains song in the carts for 70 different countries. Here is the distribution of the amount of (unique) songs per country for the top 10 countries (in percent of total unique songs) ![songs per country](songs_per_country.png) 
- The average number of genre per song is 1.45. 
- The datasets contains 110 different genres. The top 10 genres with the most songs are ![songs per genre](songs_per_genre.png)
- The dataset contains only songs from the top200 songs.
- Overall, the dataset does not contain a lot of NaNs. Actually, only the `streams` column contains NaNs (around 16%) which we don't really care about. Here is the complete plot ![NaNs per column](nans_per_column.png)

A lot of the column contain information about the song such as its valence, acousticness, danceability, etc... which might be super interessant for our analysis.

### Related Work

Previous studies have explored music genre classification and recommendation systems. Some inspiring visualizations include:

- [Musica Ex Machina](https://epfl-pavilions.ch/en/exhibitions/musica-ex-machina): Exhibition at EPFL Pavilions. Showcases some ways of visualizing sounds and music.
- [Visualizing Popular Genres of Music](https://datainnovation.org/2021/09/visualizing-popular-genres-of-music/): Website showing a nice way of visualizing genres. Could be an inspiration.
- [https://musicmap.info](https://musicmap.info/): Really nice visual of genres, their popularity and the links amongst them. Nice interactions with the data as well.
- [Every Noise](https://everynoise.com/): Really interesting approach at showing genres and their relations. It also allows playing quick previews of the genres which can be a fun feature to have. Suggested by Professor Gilles.
- [Exploring the tale of music through data visualization](https://www.analyticsvidhya.com/blog/2020/12/exploring-the-tale-of-music-through-data-visualization/): Cool little story telling website that resembles what we have in mind but may be a bit too simple in terms of data visualization.
- [History of Rock'n'roll in 100 songs](https://www.svds.com/rockandroll/#thebeatles): A visualization tracing the milestones in the evolution of rock and roll, highlighting influential artists and tracks. Uses some nice linked data which could be an inspiration.
- [Music feature visualization](https://sreeranjanid.github.io/): An interactive tool allowing users to explore the history of music genres from 1930 to 2020, highlighting characteristics and popularity trends. Nice interactions.

## Milestone 2  
April 2025  

## Visualisation 1: Genre Bubbles:
The first idea is to visualize music styles through an interactive and animated bubble chart. We start with a global view of main genres, mapped by energy and danceability. Clicking on a genre zooms in to reveal its subgenres, and then individual tracks. Each step dives deeper into the music world — from vibe to detail — ending with full info on a selected song: artist, likes, lyrics, and more.  
![Image1](https://github.com/user-attachments/assets/4a3632b2-2d79-43cf-83b4-9a00f53a791c)
**Tools:** D3, Vue.js, Vuetify, Plotly.js, Pandas (Python)  
**Related lectures:** “Interaction”, “Perception colors”, “designing viz”, “sound viz”


## Visualisation 2: most common words
Next, we explore global music preferences through an interactive map.  
In the default view, each country is colored based on its most listened-to genre. Users can filter by genre — for example, selecting only rap will highlight countries by rap popularity, from dark blue (high) to light blue (low).  
Clicking on a country reveals two things:  
- A pie chart showing the detailed breakdown of genre listenership, offering insight into local musical diversity.  
- A Top 10 race-style ranking graph, showing the evolution of the most popular songs month by month for that country. This dynamic visualisation lets users follow how hits rise or fall over time, just like a race.  
![Image2](https://github.com/user-attachments/assets/7ee66b42-9559-4d50-910e-8aaa4144b15f)

**Tools:** D3, Vue.js, Vuetify  
**Related lectures:** “Practical maps”, “Interaction”,  “Perception colors”

## Visualisation 3: Most Used Words in Lyrics
This visualization aims to explore the most frequently used words in song lyrics, based on selected filters. Users will be able to choose filters such as music genre, artist gender, or time period, and the graph will update accordingly to highlight the dominant vocabulary. For example, selecting rap and male artists will show the most common words used in that subset of songs, while switching to pop and female artists will reveal a different set of lyrical trends. The goal is to uncover how themes, expressions, or vocabulary vary across genres, genders, and eras — providing a linguistic portrait of modern music.
![Image3](https://github.com/user-attachments/assets/9cd559a3-5913-4fb5-a29a-617b8f39487d) 

(this image has been generated using chatgpt)


## Extra Ideas
### Explore Page:
We would like to add a page dedicated to exploring the dataset. The idea is a search bar where the user can search for a song, an artist, a country, a year, etc, and different visualisations would appear depending on the search. It would show statistics from the dataset, rankings, etc.  
This idea includes thinking about the different visualisations for the different types of searches, and thus might be a lot of work. But it could be a nice addition.

### Generate text:
We could also generate a short and funny summary of a chosen song

## Website Description
For this project, we’ll use the Spotify Charts and Spotify Tracks datasets. The Charts dataset includes all Top200 and Viral50 charts published by Spotify since 2017. Every 4–5 days, Spotify updates the top 200 most-streamed songs and the 50 most viral songs (i.e., fastest-growing in streams) per country. Each entry includes the song title, artist, number of streams (for Top200), chart type, rank, region, and date.  
The Tracks dataset complements this by providing details on around 90,000 songs — including album, genres, and audio features like danceability, energy, and duration. By matching songs using their IDs, we can analyse trends such as the evolution of danceability in the Top200.  
Our website will offer users interactive ways to explore the Spotify Charts over the years. Its design is inspired by this past project. We aim to tell a compelling story about how music and listener preferences evolve, with visualisations placed to support the narrative. As a minimum viable product, we’ll ensure that the visualisations are functional and fun to play with, even without the full story.

## Implementation  
To implement our website, we have defined the following work packages:

### Data Story:
The goal is to define what story we are going to tell and write it. This is purely writing text and finding interesting things to talk about around our dataset.

### Visualisations:
The goal here is to implement the different visualisations that we have defined. This is likely going to be separated into sub-tasks for each individual visualisation.

### Website:
The goal is to style the website (make it look pretty) and take care of including the data story and the visualisations when they are done.
