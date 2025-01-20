// Charger les données des gares et des trains
Promise.all([
    fetch('data/index/gares_index.json').then(response => response.json()),
    fetch('data/index/timestamp_index.json').then(response => response.json())
])
    .then(([gares, data]) => {
        let currentIndex = 0; // Index de l'événement actuel
        const totalEvents = data.length; // Nombre total d'événements

        // Créer une source vectorielle pour les marqueurs de train
        const trainSource = new ol.source.Vector();

        // Fonction pour mettre à jour les trains sur la carte
        function updateTrainMarkers() {
            const currentTrains = data[currentIndex].trains; // Obtenir les trains pour l'événement actuel

            // Effacer les anciens marqueurs de train
            trainSource.clear();

            // Ajouter les marqueurs pour les trains actuels
            Object.entries(currentTrains).forEach(([trainId, train]) => {
                let trainCoords;

                // Vérifier si le train est à la station ou en mouvement
                if (train.location_type === "at_station") {
                    const station = gares.find(g => g.name === train.location);
                    if (station) {
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
        }

        // Créer une couche pour afficher les marqueurs de train
        const trainLayer = new ol.layer.Vector({
            source: trainSource,
            style: function (feature) {
                let color;
                switch (feature.get('state')) {
                    case 'in_time':
                        color = 'rgba(0, 255, 0, 1)'; // Vert
                        break;
                    case 'yellow':
                        color = 'rgba(255, 165, 0, 1)'; // Orange
                        break;
                    default:
                        color = 'rgba(255, 0, 0, 1)'; // Rouge
                }

                return new ol.style.Style({
                    text: new ol.style.Text({
                        font: 'bold 8px Verdana', // Style de la police
                        text: feature.get('name'), // Numéro du train
                        fill: new ol.style.Fill({
                            color: 'black' // Couleur du texte
                        }),
                        backgroundFill: new ol.style.Fill({
                            color: color // Couleur de fond selon l'état du train
                        }),
                        backgroundStroke: new ol.style.Stroke({
                            color: 'black', // Couleur de bordure pour le rectangle
                            width: 1 // Largeur de la bordure
                        }),
                        padding: [2, 2, 2, 2], // Padding autour du texte
                        textAlign: 'center', // Centre horizontal du texte
                        scale: 1.2, // Échelle du texte
                        offsetY: 15, // Pas de décalage, garde le texte centré verticalement
                    })
                });

            }
        });

        // Ajouter la couche de train à la carte
        map.addLayer(trainLayer);
        local_stations_layer.setZIndex(4);
        main_stations_layer.setZIndex(4);
        
        // Mise à jour initiale des marqueurs de train
        updateTrainMarkers();

        // Écouter les changements d'heure
        document.addEventListener('timeChanged', (event) => {
            currentIndex = event.detail.currentIndex; // Met à jour l'index actuel à partir de l'événement
            updateTrainMarkers(); // Met à jour l'affichage et les marqueurs
        });

        

        document.getElementById('opacityRange').addEventListener('input', (event) => {
            const opacityValue = event.target.value / 100; // Convertir la valeur en pourcentage
            trainLayer.setOpacity(opacityValue); // Met à jour l'opacité de la couche de train
        });


    })
    .catch(error => {
        console.error('Erreur lors du chargement des données :', error);
    });
