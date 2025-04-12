function genealogies_ready(error, json, official_language_csv, wals_csv, hierarchies_json) {

  var genealogies_div = document.getElementById('genealogy-col');

  // Dimensions of the map
  var width = genealogies_div.clientWidth;
  var height = genealogies_div.clientHeight;
  // ViewBox dimensions
  var viewBox_width = width / 4 + 0.12 * width;
  var viewBox_height = height / 2;
  var viewBox_multiplier = 1.1;

  var non_highlighted_color = "#dac0a3ff";

  var map_id = "genealogy_map";

  //Create SVG element
  var svg = d3.select(genealogies_div)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-viewBox_multiplier * viewBox_width, -viewBox_multiplier * viewBox_height, viewBox_multiplier * width, viewBox_multiplier * height])
    .style("font", "0.7em helvetica")
    .attr("fill", "00002aff");


  // Section 1: Genealogies
  // console.log(hierarchies_json);
  let sunburst_chart = function (data) {
    // Specify the chart’s dimensions.
    const radius = height / 6;

    // Create the color scale.
    // const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));
    let color = function(name)  {
      switch (name) {
        case "Eurasia":
          return "#9C581CFF";
        case "Africa":
          return "#7C9D96FF";
        case "North America":
          return "#E9B384FF";
        case "South America":
          return "#E9B384FF";
        case "Australia":
          return "#A1CCD1FF";
        case "Papunesia":
          return "#A1CCD1FF";
        default:
          return d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));
      }
    };

    // Compute the layout.
    const hierarchy = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);
    const root = d3.partition()
      .size([2 * Math.PI, hierarchy.height + 1])
      (hierarchy);
    root.each(d => d.current = d);

    // Create the arc generator.
    const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius(d => d.y0 * radius)
      .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))

    // // Create the SVG container.
    // const svg = d3.create("svg")
    //     .attr("viewBox", [-width / 2, -height / 2, width, width])
    //     

    // Append the arcs.
    const path = svg.append("g")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
      .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
      .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 1 : 0.8) : 0)
      .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
      .attr("d", d => arc(d.current));

    // Make them clickable if they have children.
    path.style("cursor", "pointer")
      .on("click", clicked)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.7 : 0.5) : 0)
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 1 : 0.8) : 0)
      });
    // .on("click", clickedHighlightMap);

    // // Make them all clickable for highlighting on the map
    // path.style("cursor", "pointer")
    //     .on("click", clickedHighlightMap);

    const format = d3.format(",d");
    path.append("title")
      .text(d => d.data.name);
      // .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

    const label = svg.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .join("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", d => +labelVisible(d.current))
      .attr("transform", d => labelTransform(d.current))
      .text(d => d.data.name);

    const parent = svg.append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);

    // Handle zoom on click.
    function clicked(event, p) {

      // This is the most important clue for deciding how to act on the click!
      depth = p.depth;

      // Remove the tooltip from the map
      d3.select("#genealogy-tooltip").classed("hidden", true);

      // Part 1: Transitions for the sunburst chart
      if (p.depth !== 4) {
        parent.datum(p.parent || root);

        root.each(d => d.target = {
          x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth)
        });

        const t = svg.transition().duration(750);

        // Transition the data on all arcs, even the ones that aren’t visible,
        // so that if this transition is interrupted, entering arcs will start
        // the next transition from the desired position.
        path.transition(t)
          .tween("data", d => {
            const i = d3.interpolate(d.current, d.target);
            return t => d.current = i(t);
          })
          .filter(function (d) {
            return +this.getAttribute("fill-opacity") || arcVisible(d.target);
          })
          .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 1 : 0.8) : 0)
          .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")

          .attrTween("d", d => () => arc(d.current));

        label.filter(function (d) {
          return + this.getAttribute("fill-opacity") || labelVisible(d.target);
        }).transition(t)
          .attr("fill-opacity", d => +labelVisible(d.target))
          .attrTween("transform", d => () => labelTransform(d.current));
      }


      // Part 2: Highlight countries of the same family, genus or language as the clicked node
      let clicked_name = p.data.name; // This can be a family, genus or language name (depends on the depth of the clicked node)
      let has_children = p.children ? true : false;
      // Get color of clicked node (Same logic as arc fill in sunburst chart)
      while (p.depth > 1)
        p = p.parent;
      let clicked_color = color(p.data.name);
      // console.log("Clicked arc color: " + clicked_color);

      svg.select("#" + map_id).selectAll("path")
        .transition()
        .attr("fill", non_highlighted_color); // Reset the colors on the map
      // Language case:
      switch (depth) {
        // Macroarea - Highlight countries with the same macroarea
        case 1:
          svg.select("#" + map_id).selectAll("path")
            .filter(function (data) {
              // Special care to match each macroarea to the correct geographical region
              // Need to combine the macroarea with the continents of JSON data
              switch (clicked_name) {
                case "Eurasia":
                  return data.properties.CONTINENT == "Europe" || data.properties.CONTINENT == "Asia";
                case "Africa":
                  return data.properties.CONTINENT == "Africa";
                case "North America":
                  return data.properties.CONTINENT == "North America";
                case "South America":
                  return data.properties.CONTINENT == "South America";
                case "Papunesia":
                  return data.properties.ADMIN != "Australia" && (data.properties.CONTINENT == "Oceania" || data.properties.CONTINENT == "Asia") && data.properties.macroarea.includes(clicked_name);
                case "Australia":
                  return data.properties.ADMIN == "Australia";
                default:
                  return data.properties.macroarea.includes(clicked_name);
              }
            })
            .transition()
            .attr("fill", clicked_color)
            .attr("fill-opacity", has_children ? 1 : 0.8);
          break;

        // Family - Highlight countries with the same family
        case 2:
          svg.select("#" + map_id).selectAll("path")
            .filter(function (data) {
              return data.properties.family.includes(clicked_name);
            })
            .transition()
            .attr("fill", clicked_color)
            .attr("fill-opacity", has_children ? 1 : 0.8);
          break;

        // Genus - Highlight countries with the same genus
        case 3:
          svg.select("#" + map_id).selectAll("path")
            .filter(function (data) {
              return data.properties.genus.includes(clicked_name);
            })
            .transition()
            .attr("fill", clicked_color)
            .attr("fill-opacity", has_children ? 1 : 0.8);
          break;

        // Language - Highlight countries with the same language
        case 4:
          svg.select("#" + map_id).selectAll("path")
            .filter(function (data) {
              return data.properties.languageName.includes(clicked_name);
            })
            .transition()
            .attr("fill", clicked_color)
            .attr("fill-opacity", has_children ? 1 : 0.8);
          break;
        default:
          break;
      }

    }

    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / 2 * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    return svg.node();
  }



  // *** Section 2: World map ***
  var map_height = 1.1 * height;
  var map_width = 0.55 * width;

  let languageInfo = function (d) {
    let infoArray = [];
    // put a space in front of each element in d.properties.family

    // traverse the family array and add each element to the infoArray
    infoArray.push("--------------------")
    infoArray.push("Families:")
    temp = " "
    for (let i = 0; i < d.properties.family.length; i++) {
      temp += d.properties.family[i] + ", ";
    }
    infoArray.push(temp);
    

    // traverse the genus array and add each element to the infoArray
    infoArray.push("--------------------")
    infoArray.push("Genuses:")
    temp = " "
    for (let i = 0; i < d.properties.genus.length; i++) {
      temp += d.properties.genus[i] + ", ";
    }
    infoArray.push(temp);

    // traverse the languageName array and add each element to the infoArray
    infoArray.push("--------------------")
    infoArray.push("Languages:")
    temp = " "
    for (let i = 0; i < d.properties.languageName.length; i++) {
      temp += d.properties.languageName[i] + ", ";
    }
    infoArray.push(temp);
    
    return infoArray;
  }


  // Create map object
  // Careful to pass the Wals csv and set mergeWithWals to true (Since we care about original languages - not about official languages)
  var genealogies_map = map()
    .map_id(map_id)
    .x(viewBox_multiplier * (width - 0.88 * map_width - viewBox_width))
    .y(viewBox_multiplier * (-viewBox_height))
    .width(map_width)
    .height(map_height)
    .json(json)
    .allCountries(wals_csv)
    .mergeWithWals(true)
    .svg(svg)
    .color_mapper(function (d) { return non_highlighted_color; })
    .onClickBehavior(function (d) {
      let currentCountry = d3.select(this);
      let xPosition = parseFloat(d.clientX);
      let yPosition = parseFloat(d.clientY);
      d3.select("#genealogy-tooltip")
          .style("left", xPosition + "px")
          .style("top", yPosition + "px")
          .select("#genealogy-tooltip-country")
          .text(currentCountry.datum().properties.NAME);

      d3.select("#genealogy-tooltip")
          .select("#genealogy-tooltip-languages")
          .selectAll("p")
          .remove();
      d3.select("#genealogy-tooltip")
          .select("#genealogy-tooltip-languages").selectAll("p")
          .data(languageInfo(currentCountry.datum()))
          .join("p")
          .text(function (d) { return d; });

      d3.select("#genealogy-tooltip").classed("hidden", false);
    })
    // Add hover opacity effects - Careful to change the opacity based on the current opacity
    .onMouseOverBehavior(function (d) {
      currentCountry = d3.select(this);
      // Change opacity based on current opacity
      if (currentCountry.attr("fill-opacity") == 1) {
        currentCountry.attr("fill-opacity", 0.7);
      }
      else if (currentCountry.attr("fill-opacity") == 0.8) {
        currentCountry.attr("fill-opacity", 0.5);
      }
    })
    .onMouseOutBehavior(function (d) {
      currentCountry = d3.select(this);
      // Change opacity based on current opacity
      if (currentCountry.attr("fill-opacity") == 0.7) {
        currentCountry.attr("fill-opacity", 1);
      }
      else if (currentCountry.attr("fill-opacity") == 0.5) {
        currentCountry.attr("fill-opacity", 0.8);
      }
    });
    
    

  // // Remember to hide the tooltip when clicking outside of it
  svg.on("click", function(d) {
    if (d.target.tagName === "svg"){
        d3.select("#genealogy-tooltip").classed("hidden", true);
    }
  })

  // Create first the map to hide west islands overlapping with the sunburst chart
  genealogies_map();
  d3.select("#" + map_id).selectAll("path").attr("fill-opacity", 1);  // Solves blinking problem
  sunburst_chart(hierarchies_json);

}