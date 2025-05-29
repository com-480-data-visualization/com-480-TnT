import pandas as pd
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Download NLTK resources
nltk.download('stopwords')
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('omw-1.4')

# Load your dataset
df = pd.read_csv("merged_data_2.csv")

# Define English and Spanish stop words
stop_words_en = set(stopwords.words('english'))
stop_words_es = set(stopwords.words('spanish'))

# Function to clean lyrics/text and remove English and Spanish stopwords
def remove_stopwords_and_spanish(text):
    if not isinstance(text, str):
        return ""
    words = word_tokenize(text.lower(), preserve_line=True)
    return " ".join([
        word for word in words
        if word.isalpha() and word not in stop_words_en and word not in stop_words_es
    ])

# Apply to lyrics or your text column
df['clean_lyrics'] = df['lyrics'].apply(remove_stopwords_and_spanish)
df.to_csv("merged_data_2_cleanedL.csv", index=False)

# Display result
print(df.head())