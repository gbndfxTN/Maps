let totalDistance = 0;
let totalDuration = 0; // en secondes
let allLatLngs = [];

function toHHMMSS(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h}h ${m}m ${s}s`;
}

function computeDistance(latlngs) {
    let d = 0;
    for (let i = 1; i < latlngs.length; i++) {
        d += map.distance(latlngs[i-1], latlngs[i]);
    }
    return d;
}

function computeDuration(times) {
    if (times.length < 2) return 0;
    const start = new Date(times[0]);
    const end = new Date(times[times.length-1]);
    return (end - start) / 1000; // secondes
}

const map = L.map('map').setView([45, 3], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
}).addTo(map);

fetch('gpx_list.json')
    .then(res => res.json())
    .then(gpxFiles => {
        let loaded = 0;
        // Palette de couleurs (ajouter/enlever des couleurs si besoin)
        const colors = [
            '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00',
            '#ffff33', '#a65628', '#f781bf', '#999999', '#1b9e77',
            '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02',
            '#a6761d', '#666666'
        ];
        gpxFiles.forEach((file, idx) => {
            fetch(file)
                .then(res => res.text())
                .then(gpxText => {
                    const parser = new DOMParser();
                    const gpxDoc = parser.parseFromString(gpxText, 'application/xml');
                    const geojson = toGeoJSON.gpx(gpxDoc);
                    geojson.features.forEach(feature => {
                        if (feature.geometry.type === 'LineString') {
                            const latlngs = feature.geometry.coordinates.map(c => [c[1], c[0]]);
                            allLatLngs = allLatLngs.concat(latlngs);
                            const color = colors[idx % colors.length];
                            L.polyline(latlngs, {color: color, weight: 3}).addTo(map);
                            // Distance
                            totalDistance += computeDistance(latlngs);
                            // Durée
                            if (feature.properties.coordTimes) {
                                totalDuration += computeDuration(feature.properties.coordTimes);
                            }
                        }
                    });
                    loaded++;
                    if (loaded === gpxFiles.length) {
                        if (allLatLngs.length > 0) {
                            map.fitBounds(allLatLngs);
                        }
                        document.getElementById('stats').textContent =
                            `Total : ${(totalDistance/1000).toFixed(2)} km, ${toHHMMSS(totalDuration)}`;
                    }
                })
                .catch(() => {
                    loaded++;
                    if (loaded === gpxFiles.length) {
                        document.getElementById('stats').textContent =
                            `Total : ${(totalDistance/1000).toFixed(2)} km, ${toHHMMSS(totalDuration)}`;
                    }
                });
        });
    });
