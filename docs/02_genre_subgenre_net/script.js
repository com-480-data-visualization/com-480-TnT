// Define a color scale for genres
    const genreColors = d3.schemeCategory10.concat(d3.schemeSet3, d3.schemePaired);
    const genreColorMap = {};

    function resizeSankey() {
      const svg = d3.select("#sankey");
      const container = document.getElementById("viz-sankey");
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      svg.attr("width", width).attr("height", height);
      return {svg, width, height};
    }

    function drawSankey() {
      d3.select("#sankey").selectAll("*").remove();
      const {svg, width, height} = resizeSankey();

      d3.json("genre_subgenre_sankey.json").then(function(data) {
        if (!data || !data.nodes || !data.links) {
          document.getElementById("error").textContent = "Le fichier JSON est vide ou mal formé.";
          return;
        }

        // Identify all unique genres (sources) by name
        const genres = Array.from(new Set(data.links.map(l => {
          return typeof l.source === "number" ? data.nodes[l.source].name : l.source;
        })));
        genres.forEach((g, i) => genreColorMap[g] = genreColors[i % genreColors.length]);

        // Add much more margin for labels (especially right)
        const margin = {left: 0, right: 100, top: 40, bottom: 50};

        // Sankey setup with more space for labels
        const sankey = d3.sankey()
          .nodeWidth(32)
          .nodePadding(26)
          .extent([
            [margin.left, margin.top],
            [width - margin.right, height - margin.bottom]
          ]);

        const {nodes, links} = sankey({
          nodes: data.nodes.map(d => Object.assign({}, d)),
          links: data.links.map(d => Object.assign({}, d))
        });

        // Draw links (color by genre, pale color)
        const linkPaths = svg.append("g")
          .attr("fill", "none")
          .selectAll("path")
          .data(links)
          .join("path")
          .attr("class", "link")
          .attr("d", d3.sankeyLinkHorizontal())
          .attr("stroke-width", d => Math.max(4, d.width))
          .attr("stroke", d => {
            const genreName = typeof d.source === "number" ? nodes[d.source].name : d.source.name;
            return genreColorMap[genreName] || "#222";
          })
          .attr("opacity", 0.55)
          .each(function(d) {
            // Set highlight color as CSS variable for this link
            const genreName = typeof d.source === "number" ? nodes[d.source].name : d.source.name;
            this.style.setProperty('--genre-color', genreColorMap[genreName] || "#222");
          });

        // Draw node labels only (no rectangles)
        const nodeLabels = svg.append("g")
          .attr("class", "node")
          .selectAll("text")
          .data(nodes)
          .join("text")
          .attr("x", d => d.x0 < width / 2 ? d.x1 + 38 : d.x0 - 38)
          .attr("y", d => (d.y1 + d.y0) / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
          .attr("fill", d => {
            // Genre nodes: color, subgenres: color of their genre
            const genre = genres.find(g => g === d.name);
            if (genre) return genreColorMap[genre];
            // Find the genre for this subgenre
            const link = links.find(l => {
              const sourceName = typeof l.source === "number" ? nodes[l.source].name : l.source.name;
              return l.target.name === d.name && genreColorMap[sourceName];
            });
            if (link) {
              const sourceName = typeof link.source === "number" ? nodes[link.source].name : link.source.name;
              return genreColorMap[sourceName];
            }
            return "#222";
          })
          .text(d => d.name);

        // Highlight all subgenres associated to a genre on hover
        linkPaths
          .on("mousemove", function(event, d) {
            const genreName = typeof d.source === "number" ? nodes[d.source].name : d.source.name;
            linkPaths.classed("highlight", l => {
              const lGenre = typeof l.source === "number" ? nodes[l.source].name : l.source.name;
              return lGenre === genreName;
            }).each(function(l) {
              // Set highlight color as CSS variable for each link
              const lGenre = typeof l.source === "number" ? nodes[l.source].name : l.source.name;
              this.style.setProperty('--genre-color', genreColorMap[lGenre] || "#222");
            });
            nodeLabels.classed("highlighted", nd => {
              if (nd.name === genreName) return true;
              const subgenreNames = links.filter(l => {
                const lGenre = typeof l.source === "number" ? nodes[l.source].name : l.source.name;
                return lGenre === genreName;
              }).map(l => l.target.name);
              return subgenreNames.includes(nd.name);
            }).classed("faded", nd => {
              if (nd.name === genreName) return false;
              const subgenreNames = links.filter(l => {
                const lGenre = typeof l.source === "number" ? nodes[l.source].name : l.source.name;
                return lGenre === genreName;
              }).map(l => l.target.name);
              return !subgenreNames.includes(nd.name);
            });
          })
          .on("mouseleave", function() {
            linkPaths.classed("highlight", false);
            nodeLabels.classed("highlighted", false).classed("faded", false);
          });
      }).catch(function(error) {
        document.getElementById("error").textContent = "Erreur lors du chargement du JSON : " + error;
      });
    }

    window.addEventListener("resize", drawSankey);
    drawSankey();