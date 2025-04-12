// Run the action when we are sure the DOM has been loaded
function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else {
        // `DOMContentLoaded` already fired
        action();
    }
}

whenDocumentLoaded(() => {
    Promise.all([
        d3.json("geojson/ne_50m_admin_0_countries.json"),
        d3.csv("data/all_countries_info_alpha2.csv"),
        d3.csv("data/language.csv"),
        d3.json("data/feature_cluster_data_verbs.json"),
        d3.json("data/hierarchical_genuses.json")
    ]).then(([json, official_language_csv, wals_csv, json_clusters, hierarchies_json]) => {
        // Modifies json, adding a color property to each country
        json = color_country("#dac0a3ff", json, () => "#dac0a3ff");

        // Modifies official_language_csv, substituting the languages string with an array of languages
        official_language_csv.forEach(function (d) {
            d.Languages = d.Languages.split(",").map(function (lang) {
                return lang.trim();
            });
        });
        // Modifies wals_csv, substituting the country codes string with an array of country codes
        wals_csv.forEach(function (d) {
            d.countrycodes = d.countrycodes.split(",").map(function (code) {
                return code.trim();
            });
        });

        officiallang_ready(null, structuredClone(json), structuredClone(official_language_csv), structuredClone(wals_csv));
        genealogies_ready(null, structuredClone(json), structuredClone(official_language_csv), structuredClone(wals_csv), structuredClone(hierarchies_json));
        color_categories_ready(null, structuredClone(json), structuredClone(official_language_csv), structuredClone(wals_csv));
        sentence_order_ready(null, structuredClone(json), structuredClone(official_language_csv), structuredClone(wals_csv));
        vowel_ready(null, structuredClone(json), structuredClone(official_language_csv), structuredClone(wals_csv));
        featurecluster_ready(null, structuredClone(json), structuredClone(official_language_csv), structuredClone(json_clusters));
    });
});