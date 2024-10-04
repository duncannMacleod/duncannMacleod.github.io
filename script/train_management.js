// Charger les données des gares
fetch('data/index/gares_index.json')
    .then(response => response.json())
    .then(gares => {
        // Charger les données des trains
        return fetch('data/index/timestamp_index.json')
            .then(response => response.json())
            .then(data => ({ data, gares })); // Retourner les données des trains et des gares
    })
    .then(({ data, gares }) => {
        const currentTrains = data[0].trains; // Prendre le premier ensemble de données de train

        // Créer une source vectorielle pour les marqueurs de train
        const trainSource = new ol.source.Vector();

        // Fonction pour ajouter des marqueurs de train
        Object.entries(currentTrains).forEach(([trainId, train]) => {
            let trainCoords;

            // Vérifier si le train est à la station ou en mouvement
            if (train.location_type === "at_station") {
                // Rechercher la gare dans le tableau gares
                const station = gares.find(g => g.name === train.location);
                if (station) {
                    // Convertir les coordonnées de la gare
                    trainCoords = ol.proj.transform(station.coordinates, 'EPSG:4326', 'EPSG:3857');
                }
            } else if (train.location_type === "inter_station") {
                trainCoords = train.location.split(',').map(Number); // Convertir les coordonnées string en nombres
                trainCoords = ol.proj.transform(trainCoords, 'EPSG:4326', 'EPSG:3857');
            }

            if (trainCoords) {
                const trainMarker = new ol.Feature({
                    geometry: new ol.geom.Point(trainCoords),
                    name: `${trainId}`,
                    state: train.state // Ajouter l'état du train pour le style
                });

                // Ajouter le marqueur à la source
                trainSource.addFeature(trainMarker);
            }
        });

        // Créer une couche pour afficher les marqueurs de train
        const trainLayer = new ol.layer.Vector({
            source: trainSource,
            style: function (feature) {
                let color;
                switch (feature.get('state')) {
                    case 'in_time':
                        color = 'rgba(0, 255, 0, 1)'; // Vert avec opacité de 0.8
                        break;
                    case 'yellow':
                        color = 'rgba(255, 165, 0, 1)'; // Orange avec opacité de 0.8
                        break;
                    default:
                        color = 'rgba(255, 0, 0, 1)'; // Rouge avec opacité de 0.8
                }

                return new ol.style.Style({
                    text: new ol.style.Text({
                        font: 'bold 8px Verdana', // Font style and size
                        text: feature.get('name'), // Train number
                        fill: new ol.style.Fill({
                            color: 'black' // Text color
                        }),
                        backgroundFill: new ol.style.Fill({
                            color: color // Background color based on the train state
                        }),
                        backgroundStroke: new ol.style.Stroke({
                            color: 'black', // Border color for the rectangle
                            width: 1 // Border width
                        }),
                        padding: [2, 2, 2, 2], // Padding around the text (top, right, bottom, left)
                        textAlign: 'center', // Horizontally center the text
                        scale: 1.2, // Scale text if needed
                        offsetY: 15, // No offset, keeps the text in the center vertically
                    })
                });
                

            }
        });

        // Ajouter la couche de train à la carte
        map.addLayer(trainLayer);
        local_stations_layer.setZIndex(4);
        main_stations_layer.setZIndex(4);


    })
    .catch(error => {
        console.error('Erreur lors du chargement des données :', error);
    });
