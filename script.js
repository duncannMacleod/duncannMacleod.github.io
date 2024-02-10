fetch('referentiel-des-lignes.json')
    .then(response => response.json())
    .then(data => {
        const linesLookup = {};
        data.forEach(record => {
            const idLine = record.fields.id_line;
            const nameLine = record.fields.name_line;
            linesLookup[idLine] = nameLine;
        });
        fetch('lines_color.json')
            .then(response => response.json())
            .then(data => {
                const linesColor = {};
                data.results.forEach(line => {
                    linesColor[line.ligne] = line.code_hexadecimal;
                });

                function convertLineRef(lineRef) {
                    const match = lineRef.match(/STIF:Line::([A-Z0-9]+):/);
                    const idLineFromMatch = match ? match[1] : null;

                    return linesLookup[idLineFromMatch];

                }
                function getDepartures(stopPointAttribute) {
                    const apiKey = "vD5EOap2m5uSuMZmcYgh3pRbmsDlfQ3s";
                    const stopPoint = stopPointAttribute;
                    const apiUrl = `https://prim.iledefrance-mobilites.fr/marketplace/stop-monitoring?MonitoringRef=${stopPoint}`;

                    fetch(apiUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'apikey': apiKey
                        }
                    })
                        .then(response => response.json())
                        .then(data => processDepartures(data))
                    //    .catch(error => console.error('Erreur lors de la récupération des données :', error));
                }

                function processDepartures(data) {
                    const departuresContainer = document.getElementById('departures-container');
                    const stopInfo = document.getElementById('stopInfo');
                    departuresContainer.innerHTML = ''; // Clear previous content
                    stopInfo.innerHTML = '';
                    const stopName = data['Siri']['ServiceDelivery']['StopMonitoringDelivery'][0]['MonitoredStopVisit'][0]['MonitoredVehicleJourney']['MonitoredCall']['StopPointName'][0]['value'];
                    stopInfo.innerHTML = `<h1>Prochains départs à la ${stopName}</p>`;


                    const stopMonitoring = data['Siri']['ServiceDelivery']['StopMonitoringDelivery'];

                    for (const stop of stopMonitoring) {
                        const monitoredVisits = stop['MonitoredStopVisit'];

                        for (const visit of monitoredVisits) {
                            const monitoredVehicleJourney = visit['MonitoredVehicleJourney'];
                            const lineRef = monitoredVehicleJourney['LineRef']['value'];
                            const destinationName = monitoredVehicleJourney['DestinationName'][0]['value'];
                            let journeyNote;
                            if (monitoredVehicleJourney['JourneyNote'] && monitoredVehicleJourney['JourneyNote'].length > 0 && monitoredVehicleJourney['JourneyNote'][0]['value']) {
                                // La propriété JourneyNote existe et a une valeur non nulle
                                journeyNote = monitoredVehicleJourney['JourneyNote'][0]['value'];
                            }
                            else {
                                journeyNote = monitoredVehicleJourney['TrainNumbers']['TrainNumberRef'][0]['value'];
                            }
                            // Vérifier si MonitoredCall existe
                            const monitoredCall = visit['MonitoredVehicleJourney']['MonitoredCall'];
                            if (!monitoredCall) {
                                console.error('MonitoredCall is undefined for a visit:', visit);
                                continue; // Passer à la visite suivante
                            }
                            let expectedDepartureTime = "erreur"
                            if ('AimedDepartureTime' in monitoredCall) {
                                expectedDepartureTime = convertToReadableTime(monitoredCall['AimedDepartureTime'] || 'erreur');
                            }
                            else if ('ExpectedDepartureTime' in monitoredCall) {
                                expectedDepartureTime = convertToReadableTime(monitoredCall['ExpectedDepartureTime'] || 'erreur');
                            }
                            if (!compareTimes(expectedDepartureTime) && (monitoredCall['StopPointName'][0]['value'] != destinationName)) {
                                const convertedLineRef = convertLineRef(lineRef);
                                const color = linesColor[convertedLineRef] || 'black';
                                // Créer un conteneur pour chaque départ
                                const departureContainer = document.createElement('div');
                                departureContainer.className = 'departure';

                                // Remplir le conteneur avec les informations du départ
                                let departureMessage = `<p> <B><span style="color:${color}"> ${convertedLineRef}`;

                                departureMessage += ` - ${journeyNote}</span>, Destination: ${destinationName}, Départ: ${expectedDepartureTime}`;
                                // Vérifier si ArrivalPlatformName existe dans monitoredCall
                                if ('ArrivalPlatformName' in monitoredCall) {
                                    const platformName = monitoredCall['ArrivalPlatformName']['value'];
                                    // Ajouter le numéro de plateforme au message de départ
                                    departureMessage += `, Voie: ${platformName}`;
                                }

                                // Ajouter le message de départ au conteneur
                                departureContainer.innerHTML = departureMessage + '</B></p>';

                                departuresContainer.appendChild(departureContainer);

                                // Ajouter une balise <br> pour passer à la ligne
                                departuresContainer.appendChild(document.createElement('br'));
                            }



                        }
                    }
                }

                function convertToReadableTime(dateTimeString) {
                    const dateTime = new Date(dateTimeString);
                    const options = { hour: 'numeric', minute: 'numeric' };
                    return dateTime.toLocaleString('fr-FR', options);
                }
                function compareTimes(expectedTime) {
                    const currentTime = getCurrentTime(); // Vous devez définir une fonction pour obtenir l'heure actuelle

                    // Comparaison de chaînes pour déterminer si l'heure prévue est antérieure à l'heure actuelle
                    return expectedTime < currentTime;
                }

                function getCurrentTime() {
                    // Exemple : Obtenez l'heure actuelle sous forme de chaîne au format 'HH:mm:ss'
                    const now = new Date();
                    const hours = now.getHours().toString().padStart(2, '0');
                    const minutes = now.getMinutes().toString().padStart(2, '0');
                    const seconds = now.getSeconds().toString().padStart(2, '0');

                    return `${hours}:${minutes}:${seconds}`;
                }

                // Appeler la fonction pour obtenir les départs lors du chargement de la page
                const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

                function handleDarkModeChange(event) {
                  if (event.matches) {
                    // Le mode sombre est activé
                    console.log("Le mode sombre est activé");
                    // Ajoutez ici le code pour appliquer le thème sombre
                  } else {
                    // Le mode sombre est désactivé
                    console.log("Le mode sombre est désactivé");
                    // Ajoutez ici le code pour appliquer le thème clair si nécessaire
                  }
                }
                
                // Ajoutez un écouteur d'événements pour détecter les changements de préférences de couleur
                darkModeQuery.addListener(handleDarkModeChange);
                
                // Vérifiez le statut actuel du mode sombre lors du chargement de la page
                handleDarkModeChange(darkModeQuery);
                const scriptElement = document.querySelector('.script-loader');
                const stopPointAttribute = scriptElement.getAttribute('stopPoint');
                getDepartures(stopPointAttribute);
            })
    })
    .catch(error => console.error('Erreur lors du chargement des données des lignes :', error));

setInterval(function () {
    location.reload(); // Recharger la page
}, 30000);

// Ajouter un gestionnaire d'événements pour le bouton de téléchargement JSON
const downloadButton = document.getElementById('downloadButton');
downloadButton.addEventListener('click', function () {
    const scriptElement = document.querySelector('.script-loader');
    const stopPointAttribute = scriptElement.getAttribute('stopPoint');
    getDeparturesAndDownloadJSON(stopPointAttribute);
});

const backButton = document.getElementById('backButton').addEventListener('click', function () {
    // Utilisez window.history pour revenir à la page précédente
    window.history.back();
});


function getDeparturesAndDownloadJSON(stopPointAttribute) {
    const apiKey = "vD5EOap2m5uSuMZmcYgh3pRbmsDlfQ3s";
    const stopPoint = stopPointAttribute;
    const apiUrl = `https://prim.iledefrance-mobilites.fr/marketplace/stop-monitoring?MonitoringRef=${stopPoint}`;

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'apikey': apiKey
        }
    })
        .then(response => response.json())
        .then(data => downloadJSON(data, 'departures.json'))
        .catch(error => console.error('Erreur lors de la récupération des données :', error));
}

function downloadJSON(data, filename) {
    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(jsonBlob);
    link.download = filename;
    link.click();
}