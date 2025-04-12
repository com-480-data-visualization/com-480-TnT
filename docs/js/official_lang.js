function officiallang_ready(error, json, official_language_csv, wals_csv) {

    var officiallang_div = document.getElementById('officiallang-col');

    var non_highlighted_color = "#dac0a3ff";
    var hovered_color = "#BE8B5FFF";
    var selected_color = "#102c57ff";
    var same_language_color = "#102c56bf";

    const text_margin_x = 20;

    //Create SVG element
    var svg = d3.select(officiallang_div)
        .insert("svg")
        .attr("width", officiallang_div.clientWidth)
        .attr("height", officiallang_div.clientHeight);

    // svg.append("foreignObject")
    //     .attr('transform', 'translate(' + (0 + text_margin_x) + ',' + 0 / 2 + ')')
    //     .attr("width", 750)
    //     .attr("height", 250)
    //     .append("xhtml:div")
    //     .style("font", "64px 'Helvetica'")
    //     .html("Official<br>Languages");

    var map_id = "officiallang_map";

    // Insert text in the top left corner of the svg, 
    // TODO, maybe we do it as embedded HTML in the SVG
    // svg.append("text")
    //     .attr("x", officiallang_div.clientWidth/25)
    //     .attr("y", officiallang_div.clientHeight/16)
    //     .style("font-size", "2em")
    //     .style("font-weight", "bold")
    //     .text("Official Languages of the World")

    // Function to highlight countries with the same language as the selected country
    let highlightSameLang = function (d, currentCountry) {
        svg.select("#" + map_id).selectAll("path").attr("fill", non_highlighted_color);
        let selectedLang = currentCountry.datum().properties.languages;
        for (let i = 0; i < selectedLang.length; i++) {
            svg.select("#" + map_id).selectAll("path")
                .filter(function (d) {
                    return d.properties.languages.includes(selectedLang[i]);
                })
                .attr("fill", same_language_color);
        }
        currentCountry.attr("fill", selected_color);
    };

    let highlightCountry = function (d, currentCountry) {
        svg.select("#" + map_id).selectAll("path")
            .transition()
            .attr("fill", non_highlighted_color);
        currentCountry
            .transition()
            .attr("fill", selected_color);
    };

    // Function that creates a group and a rectangle if they haven't been created yet,
    // and updates the text within with country information
    let createCountryInfo = function (d, currentCountry, map_id) {
        let countryInfoGroup = svg.select("#" + map_id).select("#countryInfoGroup");
        let langListGroup = countryInfoGroup.select("#langListGroup");
        let xGroup = officiallang_div.clientWidth / 12;
        let yGroup = officiallang_div.clientHeight / 4
        let widthGroup = officiallang_div.clientWidth / 8;
        let heightGroup = officiallang_div.clientHeight / 2;

        // If the group doesn't exist, create it
        if (countryInfoGroup.empty()) {
            countryInfoGroup = svg.select("#" + map_id).append("g").attr("id", "countryInfoGroup");
            countryInfoGroup.append("rect")
                .attr("x", xGroup)
                .attr("y", yGroup)
                .attr("width", widthGroup)
                .attr("height", heightGroup)
                .attr("fill", "none")
                .attr("stroke", "black");
            countryInfoGroup.append("text")
                .attr("x", xGroup + 10)
                .attr("y", yGroup + 20)
                .attr("id", "countryName")
                .text("Country: ");
            langListGroup = countryInfoGroup.append("g")
                .attr("id", "langListGroup");
        }
        // Update the country name
        countryInfoGroup.select("#countryName")
            .attr("x", xGroup + 10)
            .attr("y", yGroup + 20)
            .text("Country: " + currentCountry.datum().properties.NAME);
        // Update the languages
        let langList = currentCountry.datum().properties.languages;
        langListGroup.selectAll("text")
            .data(langList)
            .join("text")
            .attr("fill", "black")
            .attr("x", xGroup + 10)
            .attr("y", function (d, i) {
                return yGroup + 40 + 20 * i;
            })
            .text(function (d) {
                return "Language: " + iso_to_lang(d, wals_csv);
            })
            .on("click", function (d) { // Turn selected color to red
                langListGroup.selectAll("text").attr("fill", "black");
                let currentLanguage = d3.select(this).attr("fill", selected_color);
                // Highlight countries with the same language
                svg.select("#" + map_id).selectAll("path").attr("fill", non_highlighted_color);
                svg.select("#" + map_id).selectAll("path")
                    .filter(function (data) {
                        return data.properties.languages.includes(currentLanguage.datum());
                    })
                    .attr("fill", same_language_color);
                currentCountry.attr("fill", selected_color);
            });
    }

    let createCountryParagraphInfo = function (d, currentCountry, map_id) {
        d3.select("#oficiallang-description").selectAll("*").remove();

        const languages = currentCountry.datum().properties.languages;
        const number_of_languages = languages.length;
        const country_name = currentCountry.datum().properties.NAME;

        if (number_of_languages == 1) {
            d3.select("#oficiallang-description")
                .append("text")
                .text("The official language of " + country_name
                    + " is ")
              .style('font-size', '1.5em');

            d3.select("#oficiallang-description")
                .append("text")
                .text(iso_to_lang(languages[0], wals_csv) + ".")
                .style('font-weight', 'bold')
                .style('font-size', '1.5em')
                .on("mouseover", function (event, datum) {
                    d3.select(this).style("text-decoration", "underline");
                })
                .on("mouseout", function (event, datum) {
                    d3.select(this).style("text-decoration", "none");
                })
                .on("click", function (d) { // Turn selected color to red
                    svg.select("#" + map_id).selectAll("path").attr("fill", non_highlighted_color);
                    svg.select("#" + map_id).selectAll("path")
                        .filter(function (data) {
                            return (data.properties.languages.includes(languages[0]) &&
                                data.properties.NAME != currentCountry.datum().properties.NAME);
                        })
                        .transition()
                        .attr("fill", same_language_color);
                    currentCountry.attr("fill", selected_color);
                });
        }
        else {
            let description = country_name + " has " + number_of_languages
                + " official languages. These are ";

            d3.select("#oficiallang-description")
                .append("text")
                .text(description)
                .style('font-size', '1.5em');

            d3.select("#oficiallang-description").selectAll("text")
                .data(languages)
                .join("text")
                .append("text")
                .text((language, i) => {
                    let tmp = iso_to_lang(language, wals_csv);

                    if (i < number_of_languages - 2) tmp += ", ";
                    else if (i < number_of_languages - 1) tmp += " and ";
                    else tmp += ".";
                    return tmp;
                })
                .style('font-weight', 'bold')
                .style('font-size', (language, i) => {
                    if (i == 0) return null;
                    else return '1.5em';
                })
                .on("mouseover", function (event, datum) {
                    d3.select(this).style("text-decoration", "underline");
                })
                .on("mouseout", function (event, datum) {
                    d3.select(this).style("text-decoration", "none");
                })
                .on("click", function (d) { // Turn selected color to red
                    // langListGroup.selectAll("text").attr("fill", "black");
                    let currentLanguage = d3.select(this).attr("fill", selected_color);
                        // console.log(currentLanguage.datum());
                    // Highlight countries with the same language
                    svg.select("#" + map_id).selectAll("path")
                        .attr("fill", non_highlighted_color);
                    svg.select("#" + map_id).selectAll("path")
                        .filter(function (data) {
                            return (data.properties.languages.includes(currentLanguage.datum()) &&
                                data.properties.NAME != currentCountry.datum().properties.NAME);
                        })
                        .transition()
                        .attr("fill", same_language_color);
                    currentCountry.attr("fill", selected_color);
                });
        }

        d3.select("#oficiallang-description")
            .append("text")
            .html("<br><br>Click on one of the highlighted official languages to see which other countries have the same official language.")
            .style('font-size', '1.5em');
    }

    // Create map object
    var officiallang_map = map()
        .map_id(map_id)
        .x(60)
        .y(0)
        .width(officiallang_div.clientWidth)
        .height(officiallang_div.clientHeight)
        .json(json)
        .allCountries(official_language_csv)
        .svg(svg)
        .color_mapper(function (d) { return non_highlighted_color; })
        .onClickBehavior(function (d) {
            let currentCountry = d3.select(this);
            // createCountryInfo(d, currentCountry, map_id);
            createCountryParagraphInfo(d, currentCountry, map_id);
            highlightCountry(d, currentCountry);
            currentCountry.attr("opacity", "1");
        })
        .onMouseOverBehavior(function (d) {
            d3.select(this).attr("opacity", "0.5");
        })
        .onMouseOutBehavior(function (d) {
            d3.select(this).attr("opacity", "1");
        });

    var officiallang_countriesGroup = officiallang_map();
};