function vowel_ready(error, json, official_language_csv, wals_csv) {
    var highlighted_color = "#102c57ff";

    const color_5 = ["#AAAAAAFF", // Unknown
        "#DAC0A3FF", // 1
        "#CDA580FF", // 2
        "#BE8B5FFF", // 3
        "#AE713EFF", // 4
        "#9C581CFF"];

    const color_3 = ["#AAAAAAFF", // Unknown 
        "#DAC0A3FF", // 1
        "#BE8B5FFF", // 2
        "#9C581CFF", // 3
        "#AAAAAAFF", // 4
        "#AAAAAAFF"];

    let colors = d3.scaleOrdinal(
        [0, 1, 2, 3, 4, 5],
        color_5);

    let numConsonantsTexts = ["Unknown", "Small: 6 to 14", "Moderately small: 15 to 18", "Average: 19 to 25", "Moderately large: 26 to 33", "Large: More than 34"];
    let numVowelsTexts = ["Unknown", "Small: 2 to 4", "Average: 5 to 6", "Large: 7 to 14"];
    let vowelRatioTexts = ["Unknown", "Low: C/V < 2", "Moderately low: 2 < C/V < 2.75", "Average: 2.75 < C/V < 4.5", "Moderately high: 4.5 < C/V < 6.5", "High: C/V > 6.5"];
    let toneTexts = ["Unknown", "No tones", "Simple tones (2)", "Complex tones (3 or more)"];

    var vowel_div = document.getElementById('vowel-col');
    var width = vowel_div.clientWidth;
    var height = vowel_div.clientHeight;

    var svg = d3.select(vowel_div)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.on("click", function (d) {
        if (d.target.tagName === "svg") {
            d3.select("#vowel-tooltip").classed("hidden", true);
        }
    })

    var map_id = "vowel_map";

    let selectHeatmapColor = function (country_iso, category, colors) {
        let categories = [];

        // Run through wals_csv to get the language category, append to categories
        let country = country_iso;
        // console.log(country);
        // console.log(category);
        // console.log(colors);
        wals_csv.filter(lang => lang.countrycodes.includes(country))
            .forEach(lang => {
                if (lang[category] != "") { categories.push(lang[category]); }
            });

        if (categories.length === 0) {
            return colors(0);
        } else {
            let mostFrequent = Array.from(new Set(categories)).reduce((prev, curr) =>
                categories.filter(el => el === curr).length > categories.filter(el => el === prev).length ? curr : prev
            );
            // Trim the category to get the number, which is the first character
            return colors(parseInt(mostFrequent.substring(0, 1)));
        }
    };

    let applyHeatmapColor = function (category, colors) {
        svg.select("#" + map_id).selectAll("path")
            .transition()
            .attr("fill", function (d) {
                return selectHeatmapColor(d.properties.ISO_A2, category, colors);
            })
    }

    let drawLegend = function (legend, x, y, width, height, colors, legends, legend_width, legend_title) {

        legend.selectAll("*").remove();
        rectHeight = height / legends.length;

        for (let i = 0; i < legends.length; i++) {
            legend.append("rect")
                .attr("x", x)
                .attr("y", y + rectHeight * i)
                .attr("width", width)
                .attr("height", rectHeight)
                .attr("fill", colors[i]);

            legend.append("foreignObject")
                .attr("x", x + width + 10)
                .attr("y", y + rectHeight * i)
                .attr("width", legend_width)
                .attr("height", rectHeight)
                .style("position", "relative")
                .append("xhtml:div")
                .style("font", "0.8em 'Helvetica'")
                .style("position", "absolute")
                .style("top", "50%")
                .style("transform", "translateY(-50%)")
                .html(legends[i]);
        }

        legend.append("foreignObject")
            .attr("x", x)
            .attr("y", y - 80)
            .attr("width", width + legend_width)
            .attr("height", 80)
            .style("position", "relative")
            .append("xhtml:div")
            .style("font", "1.5em 'Helvetica'")
            .style("font-weight", "bold")
            .style("position", "absolute")
            .style("top", "50%")
            .style("transform", "translateY(-50%)")
            .style("color", highlighted_color)
            .html(legend_title);

        return legend;
    };

    // Draw the buttons to change the category represented in the heatmap
    let drawButtons = function (svg, x, y, width, height, vowel_map) {
        let categories = ["Number of Consonants", "Number of Vowels", "Consonant-Vowel Ratio", "Usage of Tones"];
        let category_index = ["1A Consonant Inventories", "2A Vowel Quality Inventories", "3A Consonant-Vowel Ratio", "13A Tone"];
        let colorsHeat = [color_5, color_3, color_5, color_3];
        let legends = [numConsonantsTexts, numVowelsTexts, vowelRatioTexts, toneTexts];

        elementHeight = 2 * height / (2 * categories.length - 1);
        elementPadding = height / (2 * categories.length - 1);

        buttons = svg.append("g").attr("id", "buttons");

        let selectedButton = null

        for (let i = 0; i < categories.length; i++) {
            let button = buttons.append("g")
                .on("mouseover", function () {
                    if (selectedButton == null) {
                        d3.select("#buttons").selectAll("g").attr("opacity", "0.5");
                    }
                    d3.select(this).attr("opacity", "1");
                })
                .on("mouseout", function () { // Back to original color if not selected
                    if (selectedButton == null) {
                        d3.select("#buttons").selectAll("g").attr("opacity", "1");
                    } else if (selectedButton !== this) {
                        d3.select(this).attr("opacity", "0.5");
                    }
                })
                .on("click", function () {
                    colors = d3.scaleOrdinal(
                        [0, 1, 2, 3, 4, 5],
                        colorsHeat[i]);
                    d3.select("#" + map_id).selectAll("path")
                        .on("click", function (d) {
                            let currentCountry = d3.select(this);
                            let xPosition = parseFloat(d.clientX);
                            let yPosition = parseFloat(d.clientY);
                            d3.select("#vowel-tooltip")
                                .style("left", xPosition + "px")
                                .style("top", yPosition + "px")
                                .select("#vowel-tooltip-country")
                                .text(currentCountry.datum().properties.NAME);

                            d3.select("#vowel-tooltip")
                                .select("#vowel-tooltip-languages")
                                .selectAll("p")
                                .remove();
                            d3.select("#vowel-tooltip")
                                .select("#vowel-tooltip-languages").selectAll("p")
                                .data(get_langs_info(wals_csv, currentCountry.datum().properties.ISO_A2, category_index[i]))
                                .join("p")
                                .text(function (d) { return d; });

                            d3.select("#vowel-tooltip").classed("hidden", false);
                        })
                        .on("mouseover", function (d) {
                            d3.select(this).attr("opacity", "0.5");
                        })
                        .on("mouseout", function (d) {
                            d3.select(this).attr("opacity", "1");
                        });
                    applyHeatmapColor(category_index[i], colors);
                    drawLegend(legend, 15 * vowel_div.clientWidth / 18, vowel_div.clientHeight / 6, 60, vowel_div.clientHeight / 3, colorsHeat[i], legends[i], 3 * vowel_div.clientWidth / 18 - 70, categories[i]);
                    d3.select("#buttons").selectAll("g").attr("opacity", "0.5");
                    d3.select(this).attr("opacity", "1");
                    d3.select("#vowel-tooltip").classed("hidden", true);
                    selectedButton = this;
                });

            button.append("rect")
                .attr("x", x)
                .attr("y", y + (elementHeight + elementPadding) * i)
                .attr("width", width)
                .attr("height", elementHeight)
                .attr("rx", 10)
                .attr("ry", 10)
                .attr("fill", highlighted_color)

            button.append("foreignObject")
                .attr("x", x + 5)
                .attr("y", y + (elementHeight + elementPadding) * i + 5)
                .attr("width", width - 10)
                .attr("height", elementHeight - 10)
                .style("position", "relative")
                .append("xhtml:div")
                .style("font", "1em 'Helvetica'")
                .style("text-align", "center")
                .style("position", "absolute")
                .style("top", "50%")
                .style("left", "50%")
                .style("transform", "translate(-50%, -50%)")
                .style("color", "white")
                .html(categories[i]);

            // button.append("text")
            //     .attr("x", x + width / 2)
            //     .attr("y", y + (elementHeight + elementPadding) * i + elementHeight / 2)
            //     .attr("text-anchor", "middle")
            //     .attr("alignment-baseline", "middle")
            //     .attr("fill", "white")
            //     .text(categories[i]);
        }
    }

    var vowel_map = map()
        .map_id(map_id)
        .x(vowel_div.clientWidth / 9)
        .y(0)
        .width(7 * vowel_div.clientWidth / 9)
        .height(height)
        .json(json)
        .allCountries(official_language_csv)
        .svg(svg)
        .color_mapper(function (d) { return d.properties.color; })
        .onClickBehavior(function (d) {
            let currentCountry = d3.select(this);
            let xPosition = parseFloat(d.clientX);
            let yPosition = parseFloat(d.clientY);
            d3.select("#vowel-tooltip")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px")
                .select("#vowel-tooltip-country")
                .text(currentCountry.datum().properties.NAME);
            d3.select("#vowel-tooltip").classed("hidden", false);
        })
        .onMouseOverBehavior(function (d) {
            d3.select(this).attr("opacity", "0.5");
        })
        .onMouseOutBehavior(function (d) {
            d3.select(this).attr("opacity", "1");
        });

    // console.log("vowel map ready");

    var vowel_countriesGroup = vowel_map();
    drawButtons(svg, vowel_div.clientWidth / 100, vowel_div.clientHeight / 3, vowel_div.clientWidth / 10, vowel_div.clientHeight / 3, vowel_map);
    let legend = svg.append("g").attr("id", "legend");
}