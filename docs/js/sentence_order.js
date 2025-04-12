var non_highlighted_color = "#dac0a3ff";
var highlighted_color = "#102c57ff";
var unknown_color = "#AAAAAAFF";

fun_facts = {
    '1 SOV': 'Subject-Object-Verb is the most frequent syntax, widely distributed across the globe.',
    '2 SVO': 'English is Subject-Verb-Object',
    '3 VSO': 'In grammar, the subject is the \'doer\', the verb is the action and the object is the receiver of the action.',
    '4 VOS': 'There are languages where multiple orders are syntactically correct. These languages have \'flexible order\'.',
    '5 OVS': 'Some languages, like German, can present multiple syntaxes, like Object-Verb-Subject and Verb-Subject-Object.',
    '6 OSV': 'The Object-Subject-Verb syntax is quite rare!',
}

function sentence_order_ready(error, json, official_language_csv, wals_csv) {
    document.getElementById("first_word_recepient").addEventListener("drop", dropWord);
    document.getElementById("second_word_recepient").addEventListener("drop", dropWord);
    document.getElementById("third_word_recepient").addEventListener("drop", dropWord);

    document.getElementById("first_word_recepient").addEventListener("dragover", allowWordDrop);
    document.getElementById("second_word_recepient").addEventListener("dragover", allowWordDrop);
    document.getElementById("third_word_recepient").addEventListener("dragover", allowWordDrop);

    document.getElementById("drop-word-subject").addEventListener("dragstart", dragWord);
    document.getElementById("drop-word-verb").addEventListener("dragstart", dragWord);
    document.getElementById("drop-word-object").addEventListener("dragstart", dragWord);

    document.getElementById("drop-word-subject").addEventListener("dblclick", resetWord);
    document.getElementById("drop-word-verb").addEventListener("dblclick", resetWord);
    document.getElementById("drop-word-object").addEventListener("dblclick", resetWord);

    let default_intro_text = document.getElementById("fun-fact-text").innerText;

    var map_id = "sentenceorder_map";
    var sentenceorder_div = document.getElementById('sentenceorder-col');

    const width = sentenceorder_div.clientWidth;
    const height = sentenceorder_div.clientHeight;

    const text_margin_x = 20;

    var svg = d3.select(sentenceorder_div)
        .insert("svg")
        .lower()
        .attr("width", width)
        .attr("height", height);

    // svg.append("foreignObject")
    //     .attr('transform', 'translate(' + (0 + text_margin_x) + ',' + 0 / 2 + ')')
    //     .attr("width", 750)
    //     .attr("height", 250)
    //     .append("xhtml:div")
    //     .style("font", "64px 'Helvetica'")
    //     .html("Syntax Puzzles");

    map_width = 4 * width / 5;

    var sentenceorder_map = map()
        .map_id(map_id)
        .x(width - map_width)
        .y(0)
        .width(map_width)
        .height(height)
        .json(json)
        .allCountries(official_language_csv)
        .svg(svg)
        .color_mapper(function (d) { return d.properties.color; })
        .onClickBehavior(function (d) {
            let currentCountry = d3.select(this);
            let xPosition = parseFloat(d.clientX);
            let yPosition = parseFloat(d.clientY);
            d3.select("#sentenceorder-tooltip")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px")
                .select("#sentenceorder-tooltip-country")
                .text(currentCountry.datum().properties.NAME);

            d3.select("#sentenceorder-tooltip")
                .select("#sentenceorder-tooltip-languages")
                .selectAll("p")
                .remove();
            d3.select("#sentenceorder-tooltip")
                .select("#sentenceorder-tooltip-languages").selectAll("p")
                .data(get_langs_info(wals_csv, currentCountry.datum().properties.ISO_A2, "81A Order of Subject, Object and Verb"))
                .join("p")
                .text(function (d) { return d; });

            d3.select("#sentenceorder-tooltip").classed("hidden", false);
        })
        .onMouseOverBehavior(function (d) {
            d3.select(this).attr("opacity", "0.5");
        })
        .onMouseOutBehavior(function (d) {
            d3.select(this).attr("opacity", "1");
        });

    function equalToEventTarget() {
        return this == d3.event.target;
    }

    svg.on("click", function (d) {
        if (d.target.tagName === "svg") {
            d3.select("#sentenceorder-tooltip").classed("hidden", true);
        }
    })

    var colorcat_countriesGroup = sentenceorder_map();

    function updateColors(category) {
        svg.select("#" + map_id).selectAll("path")
            .filter(function (data) {
                let country = data.properties.ISO_A2;

                let languagesInCountry = wals_csv.filter((elem) => {
                    return elem["81A Order of Subject, Object and Verb"] === category;
                }).filter(lang => lang.countrycodes.includes(country));

                if (languagesInCountry.length > 0) return true;
                return false;
            }).transition()
            .attr("fill", highlighted_color);
            
        svg.select("#" + map_id).selectAll("path")
            .filter(function (data) {
                let country = data.properties.ISO_A2;

                let languagesInCountry = wals_csv.filter((elem) => elem.countrycodes.includes(country))
                    .map(lang => lang["81A Order of Subject, Object and Verb"]);

                // Remove empty strings
                languagesInCountry = languagesInCountry.filter(function (value, index, arr) {
                    return value != "";
                });

                if (languagesInCountry.length === 0) return true;
                return false;
            }).transition()
            .attr("fill", unknown_color);
    }

    function resetColors(non_highlighted_color) {
        svg.select("#" + map_id).selectAll("path")
            .transition()
            .attr("fill", non_highlighted_color);
    }

    function allowWordDrop(ev) {
        ev.preventDefault();
    }

    function dragWord(ev) {
        ev.dataTransfer.setData("Text", ev.target.id);
    }

    const element_id_codes = {
        'drop-word-subject': 'S',
        'drop-word-verb': 'V',
        'drop-word-object': 'O'
    };

    const element_id_readable_codes = {
        'drop-word-subject': 'Subject',
        'drop-word-verb': 'Verb',
        'drop-word-object': 'Object'
    };

    const droppable_initial_container_matches = {
        'drop-word-subject': 'subject-original-container',
        'drop-word-verb': 'verb-original-container',
        'drop-word-object': 'object-original-container'
    };

    const order_codes = {
        'SOV': '1 SOV',
        'SVO': '2 SVO',
        'VSO': '3 VSO',
        'VOS': '4 VOS',
        'OVS': '5 OVS',
        'OSV': '6 OSV',
    };

    function dropWord(ev) {
        ev.preventDefault();
        if (ev.target.className === "word-recipient-area") {
            if (ev.target.children.length === 0) {
                var data = ev.dataTransfer.getData("Text");
                ev.target.appendChild(document.getElementById(data));
                checkAnswer();

                elementReadableName = element_id_readable_codes[document.getElementById(data).id];
                ev.target.parentNode.children[0].innerText = elementReadableName;
            }
        }
    }

    function checkAnswer() {
        let sum = 0;
        let query_string = "";
        for (const droparea of document.getElementsByClassName("word-recipient-area")) {
            sum += droparea.children.length;

            if (droparea.children.length >= 1) {
                query_string += element_id_codes[droparea.children[0].id];
            }
        }

        if (sum === 3) {
            query_string = order_codes[query_string];
            updateColors(query_string);
            updateFunFactText(query_string);
        }
    }

    function getFunFact(current_order) {
        return fun_facts[current_order];
    }

    function updateFunFactText(current_order) {
        fun_fact = getFunFact(current_order);
        document.getElementById("fun-fact-text").innerText = fun_fact;
    }

    function resetWord(ev) {
        matching_original_recipient = droppable_initial_container_matches[ev.target.id];

        if (ev.target.parentNode.id != matching_original_recipient) {
            ev.target.parentNode.parentNode.children[0].innerText = "";

            let recipientElement = document.getElementById(matching_original_recipient);
            recipientElement.appendChild(document.getElementById(ev.target.id));
            resetColors(non_highlighted_color);
        }

        document.getElementById("fun-fact-text").innerText = default_intro_text;
    }
}

