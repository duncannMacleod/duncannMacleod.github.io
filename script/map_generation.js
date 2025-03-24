var centerCoordinates = ol.proj.fromLonLat([5.56658, 43.296045]); // Latitude et longitude de la région PACA
let gpxLayer, local_stations_layer, main_stations_layer;
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
        zoomFactor: 1.5,
        zoom: 17.5,   // Zoom par défaut
        minZoom: 17.5, // Zoom minimum

        constrainResolution: true // Force le zoom à respecter les niveaux prédéfinis
    })
})


fetch('data/index/gpx_railway_index.json')
    .then(response => response.json())
    .then(gpxFiles => {
        // Créer une source vectorielle unique pour tous les fichiers GPX
        var vectorSource = new ol.source.Vector();

        // Charger chaque fichier GPX et ajouter ses caractéristiques à la source vectorielle
        gpxFiles.forEach(gpxUrl => {
            // Créer une nouvelle source formatée pour chaque GPX
            var gpxFormat = new ol.format.GPX();

            fetch(gpxUrl)
                .then(response => response.text())
                .then(gpxData => {
                    // Lire les caractéristiques depuis le GPX
                    var features = gpxFormat.readFeatures(gpxData, {
                        dataProjection: 'EPSG:4326',
                        featureProjection: 'EPSG:3857' // S'assurer que les coordonnées sont dans la projection correcte
                    });

                    // Ajouter les caractéristiques à la source principale
                    vectorSource.addFeatures(features);
                })
                .catch(error => {
                    console.error('Erreur lors du chargement du fichier GPX:', gpxUrl, error);
                });
        });

        // Créer un seul calque avec la source combinée
        gpxLayer = new ol.layer.Vector({
            source: vectorSource,
            style: function (feature) {
                var desc = feature.values_['desc'];
                // Extraire l'information sur l'électrification de la ligne
                var electrifiedInfo = desc.match(/electrified=(\w+)/);
                var voltageInfo = desc.match(/voltage=(\w+)/);
                var passengerLinesInfo = desc.match(/passenger_lines=(\d+)/);

                var lineWidth = 1; // Par défaut, largeur de ligne normale
                if (passengerLinesInfo !== null) {
                    var passengerLines = parseInt(passengerLinesInfo[1], 10);
                    if (passengerLines >= 2) {
                        lineWidth=2.5; // Augmenter la largeur si passenger_lines >= 2
                    }
                }
                // Vérifier si l'attribut "electrified" existe
                if (electrifiedInfo !== null) {
                    var electrified = electrifiedInfo[1];

                    // Utiliser la valeur de l'attribut "electrified" pour déterminer la couleur de la ligne
                    if (electrified === 'no') {
                        // Ligne non électrifiée
                        return new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: 'black', // Ligne noire pour les non électrifiées
                                width: lineWidth
                            })
                        });
                    } else {
                        if (voltageInfo !== null) {
                            // Ligne électrifiée
                            var voltage = voltageInfo[1];
                            if (voltage === '1500') {
                                return new ol.style.Style({
                                    stroke: new ol.style.Stroke({
                                        color: 'green', // Ligne bleue pour les électrifiées à 1500V
                                        width: lineWidth
                                    })
                                });
                            } else {
                                return new ol.style.Style({
                                    stroke: new ol.style.Stroke({
                                        color: 'red', // Ligne rouge pour les autres tensions
                                        width: lineWidth
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
                            width: lineWidth
                        })
                    });
                }
            }
        });

        // Ajouter la couche unique à la carte
        map.addLayer(gpxLayer);
    })
    .catch(error => {
        console.error('Erreur lors de la récupération du fichier index:', error);
    });




// Charger les données des gares depuis le fichier JSON
fetch('data/index/gares_index.json')
    .then(response => response.json())
    .then(gares => {
        // Séparer les gares principales et locales
        var mainStations = gares.filter(gare => gare.display === "main");        // Gares principales
        //var localStations = gares.filter(gare => gare.display === "local"); // Gares locales
        var superLocalStation = gares.filter(gare => gare.display == null || gare.display === "local");
        // Créer les marqueurs pour les gares principales
        var mainStationMakers = mainStations.map(gare => {
            return new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform(gare.coordinates, 'EPSG:4326', 'EPSG:3857')),
                name: gare.name
            });
        });

        // Créer les marqueurs pour les gares locales
        // var localStationMakers = localStations.map(gare => {
        //     return new ol.Feature({
        //         geometry: new ol.geom.Point(ol.proj.transform(gare.coordinates, 'EPSG:4326', 'EPSG:3857')),
        //         name: gare.name
        //     });
        // });

        var superLocalStationMakers = superLocalStation.map(gare => {
            return new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform(gare.coordinates, 'EPSG:4326', 'EPSG:3857')),
                name: gare.name
            });
        });

        // Créer la couche pour les gares principales
        main_stations_layer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: mainStationMakers
            }),
            style: function (feature) {
                return new ol.style.Style({
                    text: new ol.style.Text({
                        font: '16px Verdana',
                        fill: new ol.style.Fill({ color: 'blue' }), // Couleur différente pour les gares principales
                        stroke: new ol.style.Stroke({ color: 'white', width: 4 }),
                        text: feature.get('name'), // Nom de la gare
                    })
                });
            }
        });

        // Créer la couche pour les gares locales

        // local_stations_layer = new ol.layer.Vector({
        //     source: new ol.source.Vector({
        //         features: localStationMakers
        //     }),
        //     style: function (feature) {
        //         return new ol.style.Style({
        //             text: new ol.style.Text({
        //                 font: '12px Verdana',
        //                 fill: new ol.style.Fill({ color: 'green' }), // Couleur différente pour les gares locales
        //                 stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
        //                 text: feature.get('name'), // Nom de la gare
        //             })
        //         });
        //     }
        // });

        super_local_stations_layer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: superLocalStationMakers
            }),
            style: function (feature) {
                return new ol.style.Style({
                    text: new ol.style.Text({
                        font: '12px Verdana',
                        fill: new ol.style.Fill({ color: 'green' }), // Couleur différente pour les gares locales
                        stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
                        text: feature.get('name'), // Nom de la gare
                    })
                });
            }
        });

        // Ajouter les couches à la carte
        map.addLayer(super_local_stations_layer);
        super_local_stations_layer.setVisible(false);
        //map.addLayer(local_stations_layer);
        map.addLayer(main_stations_layer);
    });

// Gestion des checkboxes pour afficher/masquer les couches

// document.getElementById('gpxLayer').addEventListener('change', function () {
//     gpxLayer.setVisible(this.checked);
// });

document.getElementById('main_stations').addEventListener('change', function () {
    main_stations_layer.setVisible(this.checked);
});

document.getElementById('super_local_stations').addEventListener('change', function () {
    super_local_stations_layer.setVisible(this.checked);
});

// document.getElementById('all_stations').addEventListener('change', function () {
//     local_stations_layer.setVisible(this.checked);
//     main_stations_layer.setVisible(this.checked);
//     if (main_stations_layer.values_.visible) {
//         document.getElementById('main_stations').checked = true;
//     }
//     else {
//         document.getElementById('main_stations').checked = false;
//     }
// });

