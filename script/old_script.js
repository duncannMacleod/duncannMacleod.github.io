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
});



var gpxFiles = ['aix.gpx', 'plm.gpx', 'vintimille.gpx', 'blancarde.gpx','plm_drome.gpx','hyères.gpx','cote_bleue.gpx']

gpxFiles.forEach(function (gpxUrl) {
    // Charger le fichier GPX
    var gpxLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GPX(),
            url: gpxUrl
        }),
        style: function (feature) {
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

var gares = [
    { name: "MBC", coordinates: ol.proj.transform([5.406559,43.29614391], 'EPSG:4326', 'EPSG:3857') },
    { name: "MSC", coordinates: ol.proj.transform([5.38119,43.30322], 'EPSG:4326', 'EPSG:3857') },
    { name: "AXP", coordinates: ol.proj.transform([5.445345,43.522912], 'EPSG:4326', 'EPSG:3857') },
    { name: "SNT", coordinates: ol.proj.transform([5.3578102,43.3695993], 'EPSG:4326', 'EPSG:3857') },
    { name: "TLN", coordinates: ol.proj.transform([5.929293,43.128370], 'EPSG:4326', 'EPSG:3857') },
    { name: "AUB", coordinates: ol.proj.transform([5.56658,43.296045], 'EPSG:4326', 'EPSG:3857') },
    { name: "ARS", coordinates: ol.proj.transform([4.63203,43.684853], 'EPSG:4326', 'EPSG:3857') },
    { name: "MAS", coordinates: ol.proj.transform([5.000264,43.580704], 'EPSG:4326', 'EPSG:3857') },
    { name: "SAQ", coordinates: ol.proj.transform([5.703858,43.185509], 'EPSG:4326', 'EPSG:3857') },
    { name: "HYE", coordinates: ol.proj.transform([6.124223,43.108867], 'EPSG:4326', 'EPSG:3857') },
    { name: "LAC", coordinates: ol.proj.transform([6.482498,43.455524], 'EPSG:4326', 'EPSG:3857') },
    { name: "LES", coordinates: ol.proj.transform([5.3213598,43.363628], 'EPSG:4326', 'EPSG:3857') },
    { name: "XST", coordinates: ol.proj.transform([5.0196445,43.4088317], 'EPSG:4326', 'EPSG:3857') },
    { name: "CAN", coordinates: ol.proj.transform([7.019682,43.553839], 'EPSG:4326', 'EPSG:3857') },
    { name: "ISR", coordinates: ol.proj.transform([4.9804272,43.5153953], 'EPSG:4326', 'EPSG:3857') },
    { name: "VCE", coordinates: ol.proj.transform([4.893273,44.928049], 'EPSG:4326', 'EPSG:3857') },
    { name: "OGE", coordinates: ol.proj.transform([4.819594,44.137304], 'EPSG:4326', 'EPSG:3857') },
    { name: "MTR", coordinates: ol.proj.transform([4.744792,44.559079], 'EPSG:4326', 'EPSG:3857') },
    { name: "AVI", coordinates: ol.proj.transform([4.805281,43.9419,], 'EPSG:4326', 'EPSG:3857') },

    
];
    
// Créer des marqueurs pour chaque gare
var gareMarkers = gares.map(function (gare) {
    return new ol.Feature({
        geometry: new ol.geom.Point(gare.coordinates),
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
                text: feature.get('name'), // Accessing the 'name' property of the feature
            })
        });
    }
});

map.addLayer(textLayer);
