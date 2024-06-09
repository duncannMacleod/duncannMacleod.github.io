var centerCoordinates = ol.proj.fromLonLat([5.4547, 43.6758]); // Latitude et longitude de la région PACA
// Créer une carte OpenLayers
var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://cartodb-basemaps-{a-d}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'
            })
        }),
    ],
    view: new ol.View({
        center: centerCoordinates,
        zoom: 9 // Zoom par défaut
    })
})


// Charger les noms de fichiers GPX depuis le fichier JSON
fetch('data/index/gpx_railway_index.json')
    .then(response => response.json())
    .then(gpxFiles => {
        // Utiliser les noms de fichiers GPX pour charger les couches GPX
        gpxFiles.forEach(gpxUrl => {
            // Charger le fichier GPX
            var gpxLayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    format: new ol.format.GPX(),
                    url: gpxUrl
                }),
                style: function(feature) {
                    var desc = feature.values_['desc'];
            // Extraire l'information sur l'électrification de la ligne
            var electrifiedInfo = desc.match(/electrified=(\w+)/);
            var voltageInfo = desc.match(/voltage=(\w+)/)
            // Vérifier si l'attribut "electrified" existe
            if (electrifiedInfo !== null) {
                // Récupérer la valeur de l'attribut "electrified"
                var electrified = electrifiedInfo[1];

                // Utiliser la valeur de l'attribut "electrified" pour déterminer la couleur de la ligne, par exemple :
                if (electrified === 'no') {
                    // Ligne non électrifiée
                    return new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'black', // Ligne noire pour les non électrifiées
                            width: 2
                        })
                    });
                } else {
                    if (voltageInfo !== null) {
                        // Ligne électrifiée
                        var voltage = voltageInfo[1];
                        if (voltage === '1500') {
                            return new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: 'blue', // Ligne bleue pour les électrifiées
                                    width: 2
                                })
                            });
                        } else {
                            return new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: 'red', // Ligne bleue pour les électrifiées
                                    width: 2
                                })
                            });
                        }
                    }
                }
            } else {
                // L'attribut "electrified" n'existe pas dans la description
                return new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'black', // Ligne noire pour les non électrifiées
                        width: 2
                    })
                });

            }
                }
            });
            map.addLayer(gpxLayer);
        });
    });

    // Charger les données des gares depuis le fichier JSON
fetch('data/index/gares_index.json')
.then(response => response.json())
.then(gares => {
    // Utiliser les données des gares pour créer des marqueurs
    var gareMarkers = gares.map(gare => {
        return new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.transform(gare.coordinates, 'EPSG:4326', 'EPSG:3857')),
            name: gare.name
        });
    });

    var textLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: gareMarkers
        }),
        style: function(feature) {
            return new ol.style.Style({
                text: new ol.style.Text({
                    font: '16px Verdana',
                    fill: new ol.style.Fill({ color: 'purple' }),
                    stroke: new ol.style.Stroke({ color: 'white', width: 4 }),
                    text: feature.get('name'), // Accéder à la propriété 'name' de la feature
                })
            });
        }
    });

    map.addLayer(textLayer);
});