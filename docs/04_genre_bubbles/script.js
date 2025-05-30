const colorScale = d3.scaleLinear().domain([0, 100]).range(["#2c3e50", "#e74c3c"]);
let currentView = "main";
let lastGenre = null;
let currentAudio = null;

const scaleWidth = 1;
const scaleHeight = 1;

const svg = d3.select("#chart");

svg.append("defs").html(`
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    `);

function toSafeFilename(name) {
    return name.toLowerCase().replace(/[^\w\-]/g, "_");
}

async function getSpotifyToken() {
    const client_id = "f3d5aa8ba1a9455f988df557b2170ea5";
    const client_secret = "67f4d5003f1c4d429e83d27626bb5a38";
    const auth = btoa(`${client_id}:${client_secret}`);

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
    });

    if (!response.ok) {
        throw new Error("Failed to get access token");
    }

    const data = await response.json();
    return data.access_token;
}






function loadMainGenres() {
    currentView = "main";
    lastGenre = null;
    d3.select("#title").text("Genre Bubbles Map");
    document.getElementById("backButton").style.display = "none";
    document.getElementById("chart").style.display = "block";
    document.getElementById("albumGallery").style.display = "none";
    document.getElementById("albumOverlay").style.display = "none";

    d3.json("json/genres_bubble_data.json").then(data => {
        svg.selectAll("*").remove();

        const container = document.getElementById("svg-div");
        const width = container.clientWidth;
        const height = (container.clientHeight);
        const color = colorScale;
        const radius = d3.scaleSqrt().domain([0, d3.max(data, d => d.num_songs)]).range([30, 80]);


        data.forEach(d => {
            d.r = radius(d.num_songs) * 1.4;
            d.x = Math.random() * width;
            d.y = Math.random() * height;
            d.vx = (Math.random() - 0.5) * 2;
            d.vy = (Math.random() - 0.5) * 2;
        });

        const nodes = svg.selectAll("g.node")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "node")
            .on("click", (event, d) => loadSubgenres(d.main_genre));

        nodes.append("circle")
            .attr("class", "bubble")
            .attr("r", d => d.r)
            .attr("fill", d => color(d.avg_popularity));

        nodes.append("text")
            .attr("class", "label")
            .text(d => d.main_genre);

        d3.timer(() => {
            data.forEach(d => {
                d.x += d.vx;
                d.y += d.vy;

                if (d.x - d.r < 0 || d.x + d.r > width) d.vx *= -1;
                if (d.y - d.r < 0 || d.y + d.r > height) d.vy *= -1;

                d.x = Math.max(d.r, Math.min(width - d.r, d.x));
                d.y = Math.max(d.r, Math.min(height - d.r, d.y));
            });

            nodes.attr("transform", d => `translate(${d.x},${d.y})`);
        });
    });
}


document.getElementById("backButton").addEventListener("click", () => {
    if (currentView === "subgenres") {
        loadMainGenres();
    } else if (currentView === "albums" && lastGenre) {
        loadSubgenres(lastGenre);
    }
});

function loadSubgenres(genre) {
    currentView = "subgenres";
    lastGenre = genre;

    d3.json(`json/subgenres/${toSafeFilename(genre)}_subgenres.json`).then(data => {
        svg.selectAll("*").remove();

        const container = document.getElementById("svg-div");
        const width = container.clientWidth;
        const height = (container.clientHeight);
        const color = colorScale;
        const radius = d3.scaleSqrt().domain([0, d3.max(data, d => d.num_songs)]).range([30, 70]);

        data.forEach(d => {
            d.r = radius(d.num_songs) * 1.2;
            d.x = Math.random() * width;
            d.y = Math.random() * height;
            d.vx = (Math.random() - 0.5) * 2;
            d.vy = (Math.random() - 0.5) * 2;
        });

        const nodes = svg.selectAll("g.node")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "node")
            .on("click", (event, d) => loadSubgenreTracks(d.first_genre));

        nodes.append("circle")
            .attr("class", "bubble")
            .attr("r", d => d.r)
            .attr("fill", d => color(d.avg_popularity));

        nodes.append("text")
            .attr("class", "label")
            .text(d => d.first_genre);

        d3.timer(() => {
            data.forEach(d => {
                d.x += d.vx;
                d.y += d.vy;

                if (d.x - d.r < 0 || d.x + d.r > width) d.vx *= -1;
                if (d.y - d.r < 0 || d.y + d.r > height) d.vy *= -1;

                d.x = Math.max(d.r, Math.min(width - d.r, d.x));
                d.y = Math.max(d.r, Math.min(height - d.r, d.y));
            });

            nodes.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        d3.select("#title").text("Subgenre genre of " + genre);
        document.getElementById("backButton").style.display = "inline-block";
        document.getElementById("chart").style.display = "block";
        document.getElementById("albumGallery").style.display = "none";
        document.getElementById("albumOverlay").style.display = "none";
    });
}

function loadSubgenreTracks(subgenre) {
    currentView = "albums";
    d3.select("#title").text("Top songs of subgenre: " + subgenre);
    document.getElementById("backButton").style.display = "inline-block";
    document.getElementById("chart").style.display = "none";
    document.getElementById("albumGallery").style.display = "block";
    document.getElementById("albumOverlay").style.display = "none";

    const container = document.getElementById("albumGallery");
    const width = container.clientWidth;
    const height = container.clientHeight;
    console.log(width, height)


    d3.json(`json/fixed/${toSafeFilename(subgenre)}_tracks.json`).then(data => {
        container.innerHTML = "";

        const nodes = data.map(track => ({
            ...track,
            x: Math.random() * (width - 150),
            y: Math.random() * (height - 150),
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2
        }));

        const elements = nodes.map(node => {
            const img = document.createElement("img");
            img.src = node.image_url;
            img.alt = node.track_name;
            img.style.left = `${node.x}px`;
            img.style.top = `${node.y}px`;
            img.onclick = () => showOverlay(node.image_url, `${node.track_name} – ${node.artist}`,
                null, // pas besoin du preview_url ici
                node.track_id
            );

            container.appendChild(img);
            return img;
        });

        d3.timer(() => {
            nodes.forEach((node, i) => {
                node.x += node.vx;
                node.y += node.vy;

                if (node.x < 0 || node.x > width - 150) node.vx *= -1;
                if (node.y < 0 || node.y > height - 150) node.vy *= -1;

                node.x = Math.max(0, Math.min(width - 150, node.x));
                node.y = Math.max(0, Math.min(height - 150, node.y));

                elements[i].style.left = `${node.x}px`;
                elements[i].style.top = `${node.y}px`;
            });
        });
    });
}

function showOverlay(image, text, _, track_id) {
    document.getElementById("overlayImage").src = image;
    document.getElementById("overlayText").textContent = text;
    document.getElementById("albumOverlay").style.display = "flex";

    // On masque le bouton Play
    document.getElementById("playButton").style.display = "none";

    // Crée et injecte l’iframe Spotify
    const embedUrl = `https://open.spotify.com/embed/track/${track_id}?autoplay`;
    const iframe = `
    <iframe style="border-radius:12px" src="${embedUrl}" width="300" height="80"
      frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"></iframe>
  `;
    document.getElementById("spotifyEmbed").innerHTML = iframe;

    // Fermer overlay si clic à l’extérieur
    document.getElementById("albumOverlay").onclick = (e) => {
        if (!document.getElementById("overlayContent").contains(e.target)) {
            document.getElementById("albumOverlay").style.display = "none";
            document.getElementById("spotifyEmbed").innerHTML = "";
        }
    };
}




loadMainGenres();