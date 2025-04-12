// Functions to handle CSV files

// Merge allCountries data with the GeoJSON data
function merge_official_lang_geojson (allCountries, json) {
    for (let i = 0; i < json.features.length; i++) {
        json.features[i].properties.languages = [];
    }

    for (let i = 0; i < allCountries.length; i++) {
        let dataCountry = allCountries[i].iso_alpha2;
        let dataLanguages = allCountries[i].Languages;
        for (let j = 0; j < json.features.length; j++) {
            let jsonCountry = json.features[j].properties.ISO_A2;
            if (dataCountry == jsonCountry) {
                json.features[j].properties.languages = dataLanguages;
                break;
            }
        }
    }

    return json;
}

// Merge WALS data with the GeoJSON data
// On matching country codes, add:
// - languageName
// - macroarea
// - genus
// - family
// to the properties of the GeoJSON data
function merge_wals_geojson (wals, json) {
    // Initialize the arrays in the properties of the GeoJSON data
    // Remember that 1 country can have multiple languages / macroareas / genuses / families
    for (let i = 0; i < json.features.length; i++) {
        json.features[i].properties.languageName = [];
        json.features[i].properties.macroarea = [];
        json.features[i].properties.genus = [];
        json.features[i].properties.family = [];
    }

    for (let i = 0; i < wals.length; i++) {
        // Careful to split the country codes string into an array (Multiple country codes can be present in one string!)
        let dataCountries = wals[i].countrycodes;
        let dataCountryList = dataCountries[0].split(" ");
        let languageName = wals[i].Name;
        let macroarea = wals[i].macroarea;
        let genus = wals[i].genus;
        let family = wals[i].family;

        // Careful that we push elements to the arrays of the properties (Not replace them!)
        // Remember that 1 country can have multiple languages / macroareas / genuses / families
        for (let j = 0; j < json.features.length; j++) {
            let jsonCountry = json.features[j].properties.ISO_A2;
            if (dataCountryList.includes(jsonCountry)) {
                // Check if it exists to avoid duplicates
                if (!json.features[j].properties.languageName.includes(languageName)) {
                    json.features[j].properties.languageName.push(languageName);
                }
                if (!json.features[j].properties.macroarea.includes(macroarea)) {
                    json.features[j].properties.macroarea.push(macroarea);
                }
                if (!json.features[j].properties.genus.includes(genus)) {
                    json.features[j].properties.genus.push(genus);
                }
                if (!json.features[j].properties.family.includes(family)) {
                    json.features[j].properties.family.push(family);
                }
            }
        }
    }

    return json;
}

// Color the countries according to the colorFunction
function color_country (defaultColor = "steelblue", json, colorFunction, ...args) {

    for (let i = 0; i < json.features.length; i++) {
        json.features[i].properties.color = defaultColor;
        json.features[i].properties.color = colorFunction(json.features[i].properties, ...args);
    }
    return json;
}

function wals_get_field (wals, lang, field) {
    let langData = wals.filter(function (d) {
        return d.iso_code == lang;
    });
    if (langData.length == 0) {
        return "Unknown";
    }
    return langData[0][field];
}

function get_langs_info (wals, country_iso, field) {
    // Get the languages of a country
    let langs = wals.filter(function (d) {
        return d.countrycodes.includes(country_iso);
    });

    // Get the name and field of the languages
    let langs_info = langs.map(function (d) {
        return {
            name: d.Name,
            field: d[field]
        };
    });

    // Remove languages with no field
    langs_info = langs_info.filter(function (d) {
        return d.field != "";
    });

    // Trim the field to remove the number
    langs_info = langs_info.map(function (d) {
        return {
            name: d.name,
            field: d.field.substring(2)
        };
    });

    // Parse array to string with line breaks
    langs_info = langs_info.map(function (d) {
        return d.name + ": " + d.field;
    });

    return langs_info;
}

// Returns the name of a language given its ISO code
function iso_to_lang (iso, wals) {
    let lang = wals.filter(function (d) {
        return d.iso_code == iso;
    });

    if (lang.length == 0) {
        switch (iso) {
            case "lat": lang_name = "Latin";                break;
            case "nrf": lang_name = "Jèrriais";             break;
            case "ber": lang_name = "Berber";               break;
            case "que": lang_name = "Quechua";              break;
            case "zdj": lang_name = "Ngazidja Comorian";    break;
            case "hif": lang_name = "Fiji Hindi";           break;
            case "zho": lang_name = "Chinese";              break;
            case "pih": lang_name = "Norfolk";              break;
            case "dzo": lang_name = "Dzongkha";             break;
            case "hmo": lang_name = "Hiri Motu";            break;
            case "mlg": lang_name = "Malagasy";             break;
            case "fil": lang_name = "Filipino";             break;
            case "hgm": lang_name = "Haiǁom";               break;
            case "srp": lang_name = "Serbian";              break;
            case "cnr": lang_name = "Montenegrin";          break;
            case "arc": lang_name = "Aramaic";              break;
            case "ckb": lang_name = "Sorani";               break;
            case "nno": lang_name = "Nynorsk";              break;
            case "nob": lang_name = "Bokmål";               break;
            case "smi": lang_name = "Sami";                 break;
            case "bwg": lang_name = "Barwe";                break;
            case "khi": lang_name = "Khoisan";              break;
            case "ndc": lang_name = "Ndau";                 break;
            case "zib": lang_name = "Zimbabwean Sign";      break;
            default:    lang_name = "Unknown, ISO code: " + iso; break;
        }
        return lang_name;
    }
    // Remove from lang[0].Name whatever is inside parentheses
    lang[0].Name = lang[0].Name.replace(/\s*\(.*?\)\s*/g, '');
    return lang[0].Name;
}