// Mapping from country codes with 3-letter ISO codes to 2-letter codes
const alpha3ToAlpha2 = {
  "ARG": "AR", "AUS": "AU", "AUT": "AT", "BLR": "BY", "BEL": "BE",
  "BOL": "BO", "BRA": "BR", "BGR": "BG", "CAN": "CA", "CHL": "CL",
  "COL": "CO", "CRI": "CR", "CYP": "CY", "CZE": "CZ", "DNK": "DK",
  "DOM": "DO", "ECU": "EC", "EGY": "EG", "SLV": "SV", "EST": "EE",
  "FIN": "FI", "FRA": "FR", "DEU": "DE", "GRC": "GR", "GTM": "GT",
  "HND": "HN", "HKG": "HK", "HUN": "HU", "ISL": "IS", "IND": "IN",
  "IDN": "ID", "IRL": "IE", "ISR": "IL", "ITA": "IT", "JPN": "JP",
  "KAZ": "KZ", "LVA": "LV", "LTU": "LT", "LUX": "LU", "MYS": "MY",
  "MEX": "MX", "MAR": "MA", "NLD": "NL", "NZL": "NZ", "NIC": "NI",
  "NGA": "NG", "NOR": "NO", "PAK": "PK", "PAN": "PA", "PRY": "PY",
  "PER": "PE", "PHL": "PH", "POL": "PL", "PRT": "PT", "ROU": "RO",
  "SAU": "SA", "SGP": "SG", "SVK": "SK", "ZAF": "ZA", "KOR": "KR",
  "ESP": "ES", "SWE": "SE", "CHE": "CH", "TWN": "TW", "THA": "TH",
  "TUR": "TR", "ARE": "AE", "UKR": "UA", "GBR": "GB", "URY": "UY",
  "USA": "US", "VEN": "VE", "VNM": "VN"
};

// Color map and scale for the artists/tracks
const colors = new Map();
const colorPalette = d3.schemeTableau10.concat(d3.schemeSet3);
const colorScale = d3.scaleOrdinal(colorPalette)

const countryInfoDiv = d3.select("#country-info");
const globalInfoDiv = d3.select("#global-info");
const svg = d3.select("#map-svg")
const tooltip = d3.select("#tooltip");
const container = d3.select(".map-and-chart");
const width = window.innerWidth * 0.48;
const height = window.innerHeight * 0.58;
console.log(container)
const projection = d3.geoMercator()
  .scale(150);

const path = d3.geoPath().projection(projection);

// Create a group for all countries
const g = svg.append("g");

// Define zoom behavior
const zoom = d3.zoom()
  .scaleExtent([1, 8])  // zoom limits: 1x to 8x
  .on("zoom", (event) => {
    g.attr("transform", event.transform);
  });

// Apply zoom to the SVG
svg.call(zoom);

svg
  .attr("width", width)
  .attr("height", height)

const modeSelect = d3.select("#mode-select");
const yearSelect = d3.select("#year-select");

modeSelect.on("change", updateMode);
yearSelect.on("change", updateYear);

function updateYear() {
  const mode = modeSelect.property("value");
  const year = yearSelect.property("value");
  loadDataAndRender(year, mode, "year");
}

function updateMode() {
  const mode = modeSelect.property("value");
  const year = yearSelect.property("value");
  loadDataAndRender(year, mode, "mode");
}

// Initial load with artist mode and year 2025
loadDataAndRender(2025, "artist", "mode"); 

function loadDataAndRender(year, mode, changed) {
  const jsonDataset = mode === "artist" ? "top10_artist_by_country.json" : "top10_track_by_country.json";
  Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.json(jsonDataset)
  ]).then(([world, data]) => {
    const years = Object.keys(data).sort();
    const yearSelect = d3.select("#year-select");

  
    yearSelect
      .selectAll("option")
      .data(years)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d);
    
    const currentYear = year
    yearSelect.property("value", year); // Set the selected year

    updateGlobalTop10(data, currentYear, mode);
    
    if (changed === "mode") {
      // Clear the colors map if the mode changes
      colors.clear();
      // Clear artist info if mode changes
      countryInfoDiv.html('<p>Click on a country for details</p>'); 
    }

    hideDataRace();
    
    const top1Names = new Set();
    for (const country in data[currentYear]) {
      const top1 = data[currentYear][country]["1"];
      if (top1?.name) top1Names.add(top1.name);
    }

    // Clear previous paths
    g.selectAll("path").remove();
  
    g.selectAll("path")
      .data(world.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", d => {
        const countryCode = d.id;
        const alpha2Code = alpha3ToAlpha2[countryCode];
        const top1 = data[currentYear]?.[alpha2Code]?.["1"];
        if (!colors.has(top1?.name) && top1) {
          colors.set(top1?.name, colorScale(top1?.name)); // Assign a new color if not already set
        }
        d.color = colors.get(top1?.name) || '#ccc' // Default color if no data
        return d.color;
      }
      )
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5)
      .on("mouseover", function (event, d) {
        const countryCode = d.id;
        const alpha2Code = alpha3ToAlpha2[countryCode];
        const top1 = data[currentYear]?.[alpha2Code]?.["1"];
  
        if (top1) {
          tooltip.html(`<strong>${d.properties.name}</strong><br>${top1.name}`);
          tooltip.transition().style("opacity", 1);
        } else {
          tooltip.html(`<strong>${d.properties.name}</strong><br>No data`);
          tooltip.transition().style("opacity", 1);
        }
  
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", "#ff6666");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function (event, d) {
        tooltip.transition().style("opacity", 0);
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", d.color);
      })
      .on("click", function (event, d) {
        const countryCode = d.id;
        const alpha2Code = alpha3ToAlpha2[countryCode];
        const top10 = data[currentYear]?.[alpha2Code];

        makeDataRaceAnimaion(data[currentYear][alpha2Code]);
  
        title = mode == "artist" ? "Top 10 Artists" : "Top 10 Tracks"; 
        title = `${title} in ${d.properties.name}`;
        if (top10) {
          const top1 = top10["1"];
          const others = Object.values(top10).slice(1);
          countryInfoDiv.html(`
        <h2 style="margin-bottom: 10px;">${title}</h2>
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <img src="${top1.image_link}" alt="${top1.name}" style="width: 60px; height: 60px; border-radius: 8px; margin-right: 10px;">
          <div>
            <div style="font-weight: bold;">1. ${top1.name}</div>
            <div style="font-size: 12px; color: #666;">Most listened ${mode}</div>
          </div>
        </div>
        <ol style="padding-left: 20px; text-align: left;" start="2">
          ${others.map((a,i) => `<li>${a.name}</li>`).join("")}
        </ol>
      `);
  
        } else {
          countryInfoDiv.html(`<p>No data available for this country</p>`);
        }
      });
  });

}

function updateGlobalTop10(data, year, mode) {
  title = mode == "artist" ? "Global Top 10 Artists" : "Global Top 10 Tracks"; 

  const globalTop10 = data[year]["GLOBAL"];
  if (globalTop10) {
    const globalTopArtist = globalTop10["1"];
    const globalOthers = Object.values(globalTop10).slice(1);
    globalInfoDiv.html(`
      <h2 style="margin-bottom: 10px;">${title}</h2>
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <img src="${globalTopArtist.image_link}" alt="${globalTopArtist.name}" style="width: 60px; height: 60px; border-radius: 8px; margin-right: 10px;">
        <div>
          <div style="font-weight: bold;">1. ${globalTopArtist.name}</div>
          <div style="font-size: 12px; color: #666;">Most listened ${mode} globally</div>
        </div>
      </div>
      <ol style="padding-left: 20px; text-align: left;" start="2">
        ${globalOthers.map((a,i) => `<li>${a.name}</li>`).join("")}
      </ol>
    `);
  } else {
    globalInfoDiv.html(`<p>No global data available for this year</p>`);
  }
}

function makeDataRaceAnimaion(data) {
  var margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width = window.innerWidth / 2 - margin.left - margin.right,
      height = 250 - margin.top - margin.bottom;

  // Remove the previous axis
  
  const svg = d3.select('#rankingChart')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

  // Clear previous content
  svg.selectAll("*").remove();

  const g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  
  dates = Object.keys(data).map(rank => Object.keys(data[rank].evolution)).flat().sort();
  dates = [...new Set(dates)]; // Remove duplicates
  
  ranks = Object.keys(data).map(rank => Object.values(data[rank].evolution)).flat();
  ranks = [...new Set(ranks)]; // Remove duplicates

  console.log(dates, ranks);

  // Clear previous content
  g.selectAll("*").remove(); 

  individuals = Object.keys(data)

  var x = d3.scalePoint()
    .domain(dates)
    .range([0, width]);
  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .attr("text-anchor", "end");

  var y = d3.scaleLinear()
    .domain([1, d3.max(ranks)])
    .range([0, height]);
  g.append("g")
    .call(d3.axisLeft(y).ticks(5));

  const lines = individuals.map(individual => {
    const indDates = Object.keys(data[individual].evolution).sort();
    const lineData = indDates.map(date => {

      if (!colors.has(data[individual].name)) {
        colors.set(data[individual].name, colorScale(data[individual].name));
      }

      return {
        date: date,
        rank: data[individual].evolution[date],
        name: data[individual].name,
        color: colors.get(data[individual].name)
      }
    });
    return lineData;
  });

  console.log(lines);
  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.rank));

  // Create path elements, initially empty
  const paths = g.selectAll(".line")
    .data(lines)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", d => d[0].color)
    .attr("stroke-width", 1.5);

  let step = 1;
  const maxSteps = dates.length;


  function updateLines(step) {
    paths.attr("d", d => line(d.slice(0, step)));
  }

  const interval = 300;
  const timer = d3.interval(() => {
    updateLines(step);
    step++;
    if (step > maxSteps) {
      timer.stop();
      drawLabels();
    }
  }, interval)

  // Add axis titles
  const chartHeight = height - margin.top - margin.bottom;

  g.append("text")
      .attr("class", "axis-label")
      .attr("transform", `translate(-40, ${chartHeight}) rotate(-90)`)
      .text("Ranking Position");
  
  function drawLabels() {
    g.selectAll(".label")
      .data(lines)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => x(d[d.length - 1].date) + 5)
      .attr("y", d => y(d[d.length - 1].rank))
      .text(d => `#${d[d.length-1].rank} ${d[0].name}`)
      .attr("fill", d => d[0].color)
      .attr("font-size", "12px")
      .attr("dy", ".35em");
  }

}

function hideDataRace() {
  d3.select("#rankingChart").selectAll("*").remove();
}