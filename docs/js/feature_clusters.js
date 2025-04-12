const colors = d3.scaleOrdinal(
    [0, 1, 2, 3, 4, 5, 6],
    ["#102C57FF", // Cluster Color
        "#7C9D96FF", // Africa
        "#9C581CFF", // Eurasia
        "#E9B384FF", // South America
        "#E9B384FF", // North America
        "#A1CCD1FF", // Papunesia
        "#A1CCD1FF"]); //Australia

var map_id = "clusters_map";

function generate_feature_clusters(svg, dataset, map_id, width, height,
    x, y) {

    var non_highlighted_color = "#dac0a3ff";
    var selected_color = "#102c57ff";
    var same_language_color = "#102c56bf";

    //Define drag event functions
    function dragStarted(event) {
        if (!event.active) force.alphaTarget(0.3).restart();
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragging(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragEnded(event) {
        if (!event.active) force.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    //Initialize a simple force layout, using the nodes and edges in dataset        
    var force = d3.forceSimulation(dataset.nodes)
        .force("link", d3.forceLink(dataset.edges).id(d => d.id).strength(width / 3705))
        .force("charge", d3.forceManyBody().strength(- width / 29.64))
        .force("x", d3.forceX(x).strength(0.05))
        .force("y", d3.forceY(y));

    //Create edges as lines
    var edges = svg.selectAll("line")
        .data(dataset.edges)
        .enter()
        .append("line")
        .style("stroke", "#102C57FF")
        .style("stroke-width", 1);

    //Create nodes as circles
    var nodes = svg.selectAll("circle")
        .data(dataset.nodes)
        .enter()
        .append("circle")
        .attr("r", function (d, i) {
            if (d.name.includes("Cluster")) {
                return 2 * height / 115;//10;
            } else {
                return height / 115;
            }
        }) //10
        .style("fill", function (d, i) {
            return colors(d.color);
        })
        .call(d3.drag()  //Define what to do on drag events
            .on("start", dragStarted)
            .on("drag", dragging)
            .on("end", dragEnded));


    //Add a simple tooltip
    nodes.append("title")
        .text(function (d) {
            return d.name;
        });

    nodes.on("mouseover", function (d) {
        let currentClusterName = d3.select(this).datum().name;

        if (currentClusterName.includes('Cluster')) {
            let tmp = dataset.edges.filter((d) => {
                return d.source.name === currentClusterName;
            });

            svg.select("#" + map_id).selectAll("path")
                .transition()
                .attr("fill", non_highlighted_color);

            for (d of tmp) {
                // console.log(d.target.iso_name);

                svg.select("#" + map_id).selectAll("path")
                    .filter(function (data) {
                        return data.properties.languages.includes(d.target.iso_name);
                    })
                    .transition()
                    .attr("fill", same_language_color);
            }
        }
    })
        .on("mouseout", function () { // Back to original color if not selected
            svg.select("#" + map_id).selectAll("path")
                .transition()
                .attr("fill", function (d) {
                    const color_id = get_country_color_from_continent(d.properties.CONTINENT);
                    return colors(color_id);
                });
        });

    //Every time the simulation "ticks", this will be called
    force.on("tick", function () {

        edges.attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        nodes.attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; });

    });
}

function get_country_color_from_continent(continent) {
    if (continent === "Africa") {
        return 1;
    } else if (continent === 'Europe') {
        return 2;
    } else if (continent === 'Asia') {
        return 2;
    } else if (continent === 'South America') {
        return 3;
    } else if (continent === 'North America') {
        return 4;
    } else if (continent === 'Oceania') {
        return 5;
    } else if (continent === 'Oceania') {
        return 6;
    }
}

function featurecluster_ready(error, map_json, csv, json_clusters) {

    // console.log(colors(2))
    // console.log(csv);

    var featurecluster_div = document.getElementById('cluster-col');
    var width = featurecluster_div.clientWidth;
    var height = featurecluster_div.clientHeight;

    //Create SVG element
    var featurecluster_svg = d3.select(featurecluster_div)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    const map_width = width / 2.5
    const map_height = height / 2.5
    const map_y = -height / 2
    const map_x = width / 2 - map_width

    const text_margin_x = 10

    // featurecluster_svg.append("foreignObject")
    //     .attr('transform', 'translate(' + (-width / 2 + text_margin_x) + ',' + -height / 2 + ')')
    //     .attr("width", 750)
    //     .attr("height", 250)
    //     .append("xhtml:div")
    //     .style("font", "64px 'Helvetica'")
    //     .html("Languages Beyond <b>Borders</b>");

    // featurecluster_svg.append("foreignObject")
    //     .attr('transform', 'translate(' + (-width / 2 + text_margin_x) + ',' + (-height / 2 + 200) + ')')
    //     .attr("width", 300)
    //     .attr("height", 250)
    //     .append("xhtml:div")
    //     .style("font", "1.5em 'Helvetica'")
    //     .html("Language similarity based on their internal structure of words, <b>Morphology</b>.");

    // Create map object
    var featurecluster_map = map()
        .map_id(map_id)
        .x(map_x)
        .y(map_y)
        .width(map_width)
        .height(map_height)
        .json(map_json)
        .allCountries(csv)
        .svg(featurecluster_svg)
        .color_mapper(function (d) {
            const color_id = get_country_color_from_continent(d.properties.CONTINENT);
            return colors(color_id);
        })
    // .onClickBehavior(function (d, i) {
    //     d3.selectAll(".country").classed("country-on", false);
    //     d3.select(this).classed("country-on", true);
    // });

    var featurecluster_countriesGroup = featurecluster_map();

    generate_feature_clusters(featurecluster_svg, json_clusters, map_id, width,
        height, -width / 16, height / 8);

};