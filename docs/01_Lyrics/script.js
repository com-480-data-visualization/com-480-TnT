const liveSlider = document.getElementById("liveSlider");
const danceSlider = document.getElementById("danceSlider");
const yearSlider = document.getElementById("yearSlider");
const numWordsSlider = document.getElementById("numWords");
const genreTitle = document.getElementById("genreTitle");
const wordContainer = document.getElementById("wordContainer");
const liveValue = document.getElementById("liveValue");
const danceValue = document.getElementById("danceValue");
const yearValue = document.getElementById("yearValue");
const wordCountDisplay = document.getElementById("wordCount");

// Fancy genre selector elements
const fancyGenre = document.getElementById("fancyGenre");
const genreDropdown = document.getElementById("genreDropdown");
const genreSelectedText = document.getElementById("genreSelectedText");
const selectAllGenresBtn = document.getElementById("selectAllGenresBtn");

let fullData = [];
let genreList = [];
let selectedGenres = new Set(); // All genres unselected by default
const excludedGenres = new Set(["country", "arabic", "ambient", "lofi", "world", "gaming", "folk", "j-pop", "brazilian", "indie", "indian", "korean", "metal"]);

// Color hashing function for words
function hashColor(word) {
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash = word.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
}

// Fancy genre dropdown logic with "Unselect All" option
function updateGenreDropdown() {
  genreDropdown.innerHTML = "";

  // Add "Unselect All" option at the top
  const unselectAllLabel = document.createElement("label");
  unselectAllLabel.style.fontWeight = "bold";
  const unselectAllCheckbox = document.createElement("input");
  unselectAllCheckbox.type = "checkbox";
  // Checked if all genres are unselected
  unselectAllCheckbox.checked = selectedGenres.size === 0;
  unselectAllCheckbox.addEventListener("change", function(e) {
    // Unselect All: clear selectedGenres (all genres unselected)
    selectedGenres = new Set();
    updateGenreDropdown();
    updateGenreSelectedText();
    updateDisplay();
    e.stopPropagation();
  });
  unselectAllLabel.appendChild(unselectAllCheckbox);
  unselectAllLabel.appendChild(document.createTextNode("Unselect All"));
  genreDropdown.appendChild(unselectAllLabel);

  // Add a divider
  const divider = document.createElement("div");
  divider.style.borderBottom = "1px solid #eee";
  divider.style.margin = "4px 0 4px 0";
  genreDropdown.appendChild(divider);

  // Add genre checkboxes
  genreList.forEach(g => {
    const id = "genre_" + g.replace(/\W/g, "_");
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = g;
    checkbox.id = id;
    // Checked only if in selectedGenres
    checkbox.checked = selectedGenres.has(g);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedGenres.add(g);
      } else {
        selectedGenres.delete(g);
      }
      updateGenreSelectedText();
      updateGenreDropdown();
      updateDisplay();
    });
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(g));
    genreDropdown.appendChild(label);
  });
}

// Always show "Select a genre" in the selector
function updateGenreSelectedText() {
  genreSelectedText.textContent = "Select a genre";
}

fancyGenre.addEventListener("click", function(e) {
  fancyGenre.classList.toggle("open");
  e.stopPropagation();
});
document.addEventListener("click", function() {
  fancyGenre.classList.remove("open");
});

// Select All Genres button functionality (now: select all)
selectAllGenresBtn.addEventListener("click", function(e) {
  selectedGenres = new Set(genreList); // All genres selected (all checked)
  updateGenreDropdown();
  updateGenreSelectedText();
  updateDisplay();
  e.stopPropagation();
});

// Load data (replace "data.json" with your actual data file path)
d3.json("data.json").then(data => {
  fullData = data.filter(d => !excludedGenres.has(d.genres.toLowerCase()));

  // Populate genres
  genreList = [...new Set(fullData.map(d => d.genres))].sort();
  selectedGenres = new Set(); // All genres unselected by default
  updateGenreDropdown();
  updateGenreSelectedText();
  updateDisplay();
});

function filterData() {
  const liveThreshold = +liveSlider.value;
  const danceThreshold = +danceSlider.value;
  const yearThreshold = +yearSlider.value;

  return fullData.filter(d => {
    const genreMatch = selectedGenres.size === 0 ? false : selectedGenres.has(d.genres);
    const liveMatch = d.liveness <= liveThreshold;
    const danceMatch = d.danceability >= danceThreshold;
    const yearMatch = d.year >= yearThreshold;
    return genreMatch && liveMatch && danceMatch && yearMatch;
  });
}

function countWords(filtered, num) {
  let allLyrics = filtered.map(d => d.lyrics || "").join(" ").toLowerCase();
  let words = allLyrics.match(/\b[a-z]{3,}\b/g) || [];
  let counts = {};
  words.forEach(w => counts[w] = (counts[w] || 0) + 1);
  let entries = Object.entries(counts);
  entries.sort((a,b) => b[1] - a[1]);
  return entries.slice(0, num).map(d => ({word: d[0], count: d[1]}));
}

// --- Visualization: Average Number of Words per Song per Genre ---
// Affiche toutes les catégories, mais surbrillance celles sélectionnées
function updateWordsPerGenreChart() {
  let container = document.getElementById("wordsPerGenreContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "wordsPerGenreContainer";
    document.body.appendChild(container);
  }
  container.innerHTML = "<h2 style='font-size:1.1em;color:#555;margin-bottom:10px;'>Average Number of Words per Song<br>(by Genre)</h2>";

  // On utilise tous les genres présents dans les données
  const allGenres = [...new Set(fullData.map(d => d.genres))].sort();

  // Compute average word count per song for each genre
  const genreWordCounts = [];
  allGenres.forEach(genre => {
    const filtered = fullData.filter(d => d.genres === genre);
    let allLyrics = filtered.map(d => d.lyrics || "").join(" ").toLowerCase();
    let words = allLyrics.match(/\b[a-z]{3,}\b/g) || [];
    const avgWords = filtered.length > 0 ? Math.round(words.length / filtered.length) : 0;
    genreWordCounts.push({ genre, avg: avgWords });
  });

  // Sort descending by average
  genreWordCounts.sort((a, b) => b.avg - a.avg);

  // Bar chart dimensions
  const width = 500;
  const barHeight = 30;
  const space = 10; // Space between bars
  const height = genreWordCounts.length * barHeight + 50;

  // Remove previous svg if any
  d3.select("#wordsPerGenreContainer svg").remove();

  const svg = d3.select("#wordsPerGenreContainer")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const maxAvg = d3.max(genreWordCounts, d => d.avg) || 1;

  // Scale for average words
  const xAvg = d3.scaleLinear()
    .domain([0, maxAvg])
    .range([0, width - 320]);

  // Tooltip div
  let tooltip = d3.select("#wordsPerGenreTooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body")
      .append("div")
      .attr("id", "wordsPerGenreTooltip")
      .style("position", "absolute")
      .style("background", "#fffbe9")
      .style("border", "1px solid #bbb")
      .style("border-radius", "6px")
      .style("padding", "8px 14px")
      .style("font-size", "1em")
      .style("color", "#333")
      .style("pointer-events", "none")
      .style("box-shadow", "0 2px 12px #0002")
      .style("display", "none")
      .style("z-index", 1000);
  }

  // Avg words bars (orange, highlight if selected)
  svg.selectAll("rect.avg")
    .data(genreWordCounts)
    .enter()
    .append("rect")
    .attr("class", d => selectedGenres.has(d.genre) ? "avg bar-highlight" : "avg")
    .attr("x", 110)
    .attr("y", (d, i) => i * (barHeight+space) + 10)
    .attr("width", d => xAvg(d.avg))
    .attr("height", barHeight - 10)
    .attr("fill", d => selectedGenres.has(d.genre) ? "#ffb300" : "#f9a825")
    .on("mousemove", function(event, d) {
      tooltip
        .style("display", "block")
        .html(`<b>${d.genre}</b><br>Average: <b>${d.avg.toLocaleString()}</b> words/song`)
        .style("left", (event.pageX + 18) + "px")
        .style("top", (event.pageY - 10) + "px");
      d3.select(this).attr("fill", "#ffd54f");
    })
    .on("mouseleave", function(event, d) {
      tooltip.style("display", "none");
      d3.select(this).attr("fill", selectedGenres.has(d.genre) ? "#ffb300" : "#f9a825");
    });

  // Genre labels (highlight if selected)
  svg.selectAll("text.genre")
    .data(genreWordCounts)
    .enter()
    .append("text")
    .attr("class", d => selectedGenres.has(d.genre) ? "bar-label bar-label-highlight" : "bar-label")
    .attr("x", 5)
    .attr("y", (d, i) => i * (barHeight+space) + barHeight / 2 + 12)
    .text(d => d.genre);

  // Avg words value (always after the bar, with more space, highlight if selected)
  svg.selectAll("text.avg-value")
    .data(genreWordCounts)
    .enter()
    .append("text")
    .attr("class", d => selectedGenres.has(d.genre) ? "bar-avg bar-label-highlight" : "bar-avg")
    .attr("x", d => 90 + xAvg(maxAvg) + 32)
    .attr("y", (d, i) => i * (barHeight+space) + barHeight / 2 + 8)
    .text(d => d.avg.toLocaleString() + " avg/song")
    .style("font-size", "1em")
    .style("dominant-baseline", "middle")
    .style("fill", d => selectedGenres.has(d.genre) ? "#ffb300" : "#f9a825");
}
// --- End Visualization ---

function updateDisplay() {
  const filtered = filterData();
  const num = +numWordsSlider.value;
  const wordData = countWords(filtered, num);
  const max = wordData[0]?.count || 1;
  const min = wordData[wordData.length - 1]?.count || 1;

  wordContainer.innerHTML = "";
  wordData.forEach(d => {
    const span = document.createElement("span");
    const size = 14 + (d.count - min) / (max - min + 1e-5) * 26; // font size between 14 and 40
    span.textContent = d.word + " ";
    span.className = "word";
    span.style.fontSize = `${size}px`;
    span.style.color = hashColor(d.word);
    wordContainer.appendChild(span);
  });

  // Show all selected genre names in the title, or "Select a genre"
  if (selectedGenres.size === 0) {
    genreTitle.textContent = "Select a genre";
  } else {
    genreTitle.textContent = [...selectedGenres].join(", ");
  }

  // Update the average words per song chart
  updateWordsPerGenreChart();
}

// Event listeners for sliders
[liveSlider, danceSlider, yearSlider, numWordsSlider].forEach(slider => {
  slider.addEventListener("input", () => {
    liveValue.textContent = liveSlider.value;
    danceValue.textContent = danceSlider.value;
    yearValue.textContent = yearSlider.value;
    wordCountDisplay.textContent = numWordsSlider.value;
    updateDisplay();
  });
});