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

Promise.all([
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
  d3.json("top10_artist_by_country.json")
]).then(([world, artistData]) => {
  const years = Object.keys(artistData).sort();
  const yearSelect = d3.select("#yearSelect");

  yearSelect
    .selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .text(d => d);

  let currentYear = years[0];

  yearSelect.on("change", function () {
    currentYear = this.value;
  });

  g.selectAll("path")
    .data(world.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "#ccc")
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5)
    .on("mouseover", function (event, d) {
      const countryCode = d.id;
      const alpha2Code = alpha3ToAlpha2[countryCode];
      const artist = artistData[currentYear]?.[alpha2Code]?.["1"];

      if (artist) {
        tooltip.html(`<strong>${d.properties.name}</strong><br>${artist.artist}`);
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
    .on("mouseout", function () {
      tooltip.transition().style("opacity", 0);
      d3.select(this)
        .transition()
        .duration(200)
        .attr("fill", "#ccc");
    })
    .on("click", function (event, d) {
      const countryCode = d.id;
      const alpha2Code = alpha3ToAlpha2[countryCode];
      const top10Artists = artistData[currentYear]?.[alpha2Code];

      console.log(artistInfoDiv)

      if (top10Artists) {
        const topArtist = top10Artists["1"];
        const others = Object.values(top10Artists).slice(1);
        artistInfoDiv.html(`
      <h2 style="margin-bottom: 10px;">Top 10 Artists</h2>
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <img src="${topArtist.image}" alt="${topArtist.artist}" style="width: 60px; height: 60px; border-radius: 8px; margin-right: 10px;">
        <div>
          <div style="font-weight: bold;">#1 ${topArtist.artist}</div>
          <div style="font-size: 12px; color: #666;">Most listened artist</div>
        </div>
      </div>
      <ol style="padding-left: 20px; text-align: left;" start="2">
        ${others.map((a,i) => `<li>${a.artist}</li>`).join("")}
      </ol>
    `);

      } else {
        artistInfoDiv.html(`<p>No data available for this country</p>`);
      }
    });
});