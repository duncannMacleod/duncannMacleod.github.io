fetch('referentiel-des-lignes.json')
    .then(response => response.json())
    .then(data => {
        const linesLookup = {};
        data.forEach(record => {
            const idLine = record.fields.id_line;
            const nameLine = record.fields.name_line;
            linesLookup[idLine] = nameLine;
        });
        
        function convertLineRef(lineRef) {
            const match = lineRef.match(/STIF:Line::([A-Z0-9]+):/);
            const idLineFromMatch = match ? match[1] : null;

            return linesLookup[idLineFromMatch];

        }
        function getDepartures() {
            const apiKey = "vD5EOap2m5uSuMZmcYgh3pRbmsDlfQ3s";
            const stopPoint = "STIF%3AStopPoint%3AQ%3A41251%3A";
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
            departuresContainer.innerHTML = ''; // Clear previous content
            const linesColor= getColorDictionary (); //récupère un dictionnaire des noms de lignes et des couleurs associées

            const stopMonitoring = data['Siri']['ServiceDelivery']['StopMonitoringDelivery'];

            for (const stop of stopMonitoring) {
                const monitoredVisits = stop['MonitoredStopVisit'];

                for (const visit of monitoredVisits) {
                    const monitoredVehicleJourney = visit['MonitoredVehicleJourney'];
                    const lineRef = monitoredVehicleJourney['LineRef']['value'];
                    const destinationName = monitoredVehicleJourney['DestinationName'][0]['value'];
                    const journeyNote = monitoredVehicleJourney['JourneyNote'];
                    if (journeyNote && journeyNote.length > 0 && journeyNote[0]['value']) {
                        // La propriété JourneyNote existe et a une valeur non nulle
                        const journeyNoteValue = journeyNote[0]['value'];

                        // Vérifier si MonitoredCall existe
                        const monitoredCall = visit['MonitoredVehicleJourney']['MonitoredCall'];
                        if (!monitoredCall) {
                            console.error('MonitoredCall is undefined for a visit:', visit);
                            continue; // Passer à la visite suivante
                        }
                        if ('AimedDepartureTime' in monitoredCall) {
                            const expectedDepartureTime = convertToReadableTime(monitoredCall['AimedDepartureTime'] || 'Unknown');
                            if (!compareTimes(expectedDepartureTime)) {
                                const convertedLineRef = convertLineRef(lineRef);
                                const color = linesColor[convertedLineRef] || 'black';
                                // Créer un conteneur pour chaque départ
                                const departureContainer = document.createElement('div');
                                departureContainer.className = 'departure';

                                // Remplir le conteneur avec les informations du départ
                                let departureMessage = `<p style="color: ${color}">${lineRefValue}`;

                                departureMessage+=`- ${journeyNoteValue}, Destination: ${destinationName}, Départ: ${expectedDepartureTime}`;
                                // Vérifier si ArrivalPlatformName existe dans monitoredCall
                                if ('ArrivalPlatformName' in monitoredCall) {
                                    const platformName = monitoredCall['ArrivalPlatformName']['value'];
                                    // Ajouter le numéro de plateforme au message de départ
                                    departureMessage += `, Voie: ${platformName}`;
                                }

                                // Ajouter le message de départ au conteneur
                                departureContainer.innerHTML = departureMessage + '</p>';

                                departuresContainer.appendChild(departureContainer);

                                // Ajouter une balise <br> pour passer à la ligne
                                departuresContainer.appendChild(document.createElement('br'));
                            }
                        }
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
        getDepartures();
    })
    .catch(error => console.error('Erreur lors du chargement des données des lignes :', error));

setInterval(function () {
    location.reload(); // Recharger la page
}, 30000);

// Ajouter un gestionnaire d'événements pour le bouton de téléchargement JSON
const downloadButton = document.getElementById('downloadButton');
downloadButton.addEventListener('click', function () {
    getDeparturesAndDownloadJSON();
});

function getDeparturesAndDownloadJSON() {
    const apiKey = "vD5EOap2m5uSuMZmcYgh3pRbmsDlfQ3s";
    const stopPoint = "STIF%3AStopPoint%3AQ%3A41251%3A";
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

function cmykToHex(cmykString) {
    // Diviser la chaîne CMYK en valeurs individuelles
    const cmykValues = cmykString.split(' ').map(Number);

    // Assurer que la longueur est correcte (c, m, y, k)
    if (cmykValues.length !== 4) {
        console.error('La chaîne CMYK n\'a pas la longueur attendue.');
        return null;
    }

    // Convertir les valeurs CMYK en valeurs RGB
    const [c, m, y, k] = cmykValues;
    const r = 255 * (1 - c) * (1 - k);
    const g = 255 * (1 - m) * (1 - k);
    const b = 255 * (1 - y) * (1 - k);

    // Convertir les valeurs RGB en code hexadécimal
    const hex = rgbToHex(Math.round(r), Math.round(g), Math.round(b));

    return hex;
}

function getColorDictionary ()
{
    fetch('lines_color.json')
    .then(response => response.json())
    .then(data => {
        console.log(data);  // Ajoutez cette ligne pour voir la structure des données

        const linesColor = {};
        if (data.results) {
            data.results.forEach(result => {
                const ligne = result.ligne;
                const codeHexadecimal = result.code_hexadecimal;
                linesColor[ligne] = codeHexadecimal;
            });
        } else {
            console.error('Les données ne sont pas au format attendu (propriété "results").');
        }
        return linesColor;
    })
    .then(linesColor => {
        console.log(linesColor);
        // Utilisez le dictionnaire linesColor ici ou effectuez d'autres opérations
    })
    .catch(error => console.error('Erreur lors du chargement des données des couleurs :', error));


    
}