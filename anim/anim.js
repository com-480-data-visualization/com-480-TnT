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

const colors = new Map();
const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

const artistInfoDiv = d3.select("#artist-info");
const svg = d3.select("svg");
const tooltip = d3.select("#tooltip");
const width = window.innerWidth;
const height = window.innerHeight;

const projection = d3.geoMercator()
  .scale(150)
  .translate([width / 2, height / 1.5]);

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

loadDataAndRender(2025, "artist"); // Initial load with artist mode and year 2025

function loadDataAndRender(year, mode, changed) {
  const jsonDataset = mode === "artist" ? "top10_artist_by_country.json" : "top10_track_by_country.json";
  Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.json(jsonDataset)
  ]).then(([world, data]) => {
    const years = Object.keys(data).sort();
    const yearSelect = d3.select("#year-select");

    yearSelect.selectAll("option").remove(); // Clear previous options
  
    yearSelect
      .selectAll("option")
      .data(years)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d);
    
    const currentYear = year
    yearSelect.property("value", year); // Set the selected year

    const top1Names = new Set();
    for (const country in data[currentYear]) {
      const top1 = data[currentYear][country]["1"];
      if (top1?.name) top1Names.add(top1.name);
    }

    if (changed === "mode") {
      // Clear the colors map if the mode changes
      colors.clear();
    }

    // Add missing names to the map
    Array.from(top1Names).forEach((name, i) => {
      if (!colors.has(name)) {
        colors.set(name, colorScale(i));
      }
    });

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
        d.color = colors.get(top1?.name) || "#ccc"; // Default color if no data

        if (top1) {
          return colors.get(top1.name) || "#ccc"; // Use color from map or default to gray
        }
        return "#ccc"; // Default color for countries with no data
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
        const top10Artists = data[currentYear]?.[alpha2Code];
  
        console.log(artistInfoDiv)
  
        if (top10Artists) {
          const topArtist = top10Artists["1"];
          const others = Object.values(top10Artists).slice(1);
          artistInfoDiv.html(`
        <h2 style="margin-bottom: 10px;">Top 10 Artists</h2>
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <img src="${topArtist.image}" alt="${topArtist.name}" style="width: 60px; height: 60px; border-radius: 8px; margin-right: 10px;">
          <div>
            <div style="font-weight: bold;">#1 ${topArtist.name}</div>
            <div style="font-size: 12px; color: #666;">Most listened artist</div>
          </div>
        </div>
        <ol style="padding-left: 20px; text-align: left;" start="2">
          ${others.map((a,i) => `<li>${a.name}</li>`).join("")}
        </ol>
      `);
  
        } else {
          artistInfoDiv.html(`<p>No data available for this country</p>`);
        }
      });
  });

}