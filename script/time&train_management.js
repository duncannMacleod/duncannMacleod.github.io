// Charger les données des gares et des trains
Promise.all([
    fetch('data/index/gares_index.json').then(response => response.json()),
    fetch('data/index/timestamp_index.json').then(response => response.json())
])
    .then(async ([gares, data]) => {
        let currentIndex; // Index de l'événement actuel
        const totalEvents = data.length; // Nombre total d'événements
        // Sélectionner les éléments HTML où afficher les informations
        const textContainer = document.getElementById('textContainer');
        const currentEventElement = document.getElementById('current_event');
        const textMessageElement = document.getElementById('textMessage');
        // Initialisation des sources et couches OpenLayers

        const trainSource = new ol.source.Vector();
        const trainLayer = new ol.layer.Vector({
            source: trainSource,
            style: function (feature) {
                let color;
                switch (feature.get('state')) {
                    case 'in_time':
                        color = 'rgba(0, 255, 0, 1)';
                        break;
                    case 'yellow':
                        color = 'rgba(255, 165, 0, 1)';
                        break;
                    case 'orange':
                        color = 'rgba(255, 165, 0, 1)';
                        break;
                    default:
                        color = 'rgba(255, 0, 0, 1)';
                }
            
                const stationType = feature.get('station_type'); // Get station_type from the feature
                const offsetY = stationType === 0 ? 0 : 15; // Set offsetY based on station_type
            
                return new ol.style.Style({
                    text: new ol.style.Text({
                        font: 'bold 8px Verdana',
                        text: feature.get('name'),
                        fill: new ol.style.Fill({ color: 'black' }),
                        backgroundFill: new ol.style.Fill({ color }),
                        backgroundStroke: new ol.style.Stroke({ color: 'black', width: 1 }),
                        padding: [2, 2, 2, 2],
                        textAlign: 'center',
                        scale: 1.2,
                        offsetY: offsetY, // Use calculated offsetY
                    })
                });
            }
            
        });

        // Ajouter la couche à la carte
        map.addLayer(trainLayer);
        local_stations_layer.setZIndex(4);
        main_stations_layer.setZIndex(4);

        // Fonction pour mettre à jour les marqueurs de train
        function updateTrainMarkers() {
            const currentTrains = data[currentIndex].trains;
            trainSource.clear();

            Object.entries(currentTrains).forEach(([trainId, train]) => {
                let trainCoords;
                let station_type=0;
                if (train.location_type === "at_station") {
                    const station = gares.find(g => g.name === train.location);
                    if (station) {
                        trainCoords = ol.proj.transform(station.coordinates, 'EPSG:4326', 'EPSG:3857');
                        if (station.display!=null)
                            station_type= 1;
                    }
                } else if (train.location_type === "inter_station") {
                    trainCoords = train.location.split(',').map(Number);
                    trainCoords = ol.proj.transform(trainCoords, 'EPSG:4326', 'EPSG:3857');
                }

                if (trainCoords) {
                    const trainMarker = new ol.Feature({
                        geometry: new ol.geom.Point(trainCoords),
                        name: `${trainId}`,
                        state: train.state,
                        station_type: station_type
                    });
                    trainSource.addFeature(trainMarker);
                }
                
            });
        }

        // Fonction pour mettre à jour l'affichage des messages et de l'heure
        function updateDisplay() {
            const currentEvent = data[currentIndex];
            if (!currentEvent) return;

            const time_h = currentEvent.time_h;
            const time_m = currentEvent.time_m;
            textContainer.textContent = `Heure : ${time_h}h${time_m}`;
            currentEventElement.textContent = `Événement ${currentIndex + 1} sur ${totalEvents}`;

            textMessageElement.innerHTML = '';
            const messages = currentEvent.messages || [];
            if (messages.length > 0) {
                messages.forEach(message => {
                    const messageType = mapMessageType(message.type);
                    const typeElement = document.createElement('span');
                    typeElement.classList.add(messageType);
                    typeElement.textContent = `${messageType}`;

                    const messageElement = document.createElement('span');
                    messageElement.classList.add('message-text');
                    messageElement.innerHTML = `: ${highlightNumbers(message.text)}`;

                    textMessageElement.appendChild(typeElement);
                    textMessageElement.appendChild(messageElement);
                    textMessageElement.appendChild(document.createElement('br'));
                });
            } else {
                textMessageElement.textContent = 'Aucun message pour cet événement.';
            }
        }

        // Gestion des WebSockets
        const socket = io('https://duncannmacleod-github-io-1.onrender.com');
        socket.on('variable_updated', (variable) => {
            currentIndex = variable.value;
            updateDisplay();
            updateTrainMarkers();
        });

        socket.on('connect', () => {
            console.log('Connecté au serveur WebSocket');
        });

        async function fetchAndUpdateVariable() {
            currentIndex = await getVariable();
            updateDisplay();
            updateTrainMarkers();
        }

        // Mettre à jour la variable toutes les 10 secondes
        setInterval(fetchAndUpdateVariable, 10000);

        // Initialisation
        currentIndex = await getVariable();
        console.log(currentIndex);
        updateDisplay();
        updateTrainMarkers();

        // Gestion des boutons
        document.getElementById("prev_button").addEventListener("click", async function () {
            if (currentIndex > 0) {
                currentIndex--;
                await updateVariable(currentIndex);
            }
        });

        document.getElementById("next_button").addEventListener("click", async function () {
            if (currentIndex < totalEvents - 1) {
                currentIndex++;
                await updateVariable(currentIndex);
            }
        });

        // Gestion de l'opacité
        document.getElementById('opacityRange').addEventListener('input', (event) => {
            const opacityValue = event.target.value / 100;
            trainLayer.setOpacity(opacityValue);
        });
    })
    .catch(error => {
        console.error('Erreur lors du chargement des données :', error);
    });

// Fonctions utilitaires
async function getVariable() {
    try {
        const response = await fetch('https://duncannmacleod-github-io-3ye0.onrender.com/get_variable');
        if (!response.ok) throw new Error('Erreur lors de la récupération de la variable');
        const variable = await response.json();
        return variable.value;
    } catch (error) {
        console.error('Erreur lors de la récupération de la variable :', error);
        return null;
    }
}

async function updateVariable(newValue) {
    try {
        const response = await fetch('https://duncannmacleod-github-io-3ye0.onrender.com/set_variable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: newValue }),
        });
        console.log(await getVariable());
        if (!response.ok) console.error('Erreur lors de la mise à jour de la variable');
    } catch (error) {
        console.error('Erreur réseau :', error);
    }
}

function mapMessageType(type) {
    switch (type) {
        case "green":
            return "texte_vert";
        case "yellow":
            return "Téléphone";
        case "orange":
            return "FAX";
        case "red":
            return "Régulation";
        default:
            return "";
    }
}

function highlightNumbers(text) {
    return text.replace(/\d+/g, (match) => `<span style="color:rgb(43, 145, 53);">${match}</span>`);
}