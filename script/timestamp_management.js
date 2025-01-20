// Charger le fichier JSON avec fetch
fetch('data/index/timestamp_index.json')
    .then(response => response.json())
    .then(async data => {
        let currentIndex = 0; // Initialise l'index
        const totalEvents = data.length; // Nombre total d'événements

        // Sélectionner les éléments HTML où afficher les informations
        const textContainer = document.getElementById('textContainer');
        const currentEventElement = document.getElementById('current_event');
        const textMessageElement = document.getElementById('textMessage');

        // Fonction de mappage de message.type à text1, text2, etc.
        function mapMessageType(type) {
            switch (type) {
                case "green":
                    return "texte_vert";
                case "yellow":
                    return "Téléphone";
                case "orange":
                    return "FAX";
                case "red":
                    return "texte_rouge";
                default:
                    return ""; // Cas par défaut si le type n'est pas reconnu
            }
        }

        // Fonction pour afficher l'heure et les messages de l'élément actuel
        function updateDisplay() {
            const currentEvent = data[currentIndex];
            if (!currentEvent) {
                console.error('Événement introuvable pour l\'index :', currentIndex);
                return;
            }

            console.log('Affichage mis à jour pour :', currentEvent);

            const time_h = currentEvent.time_h;
            const time_m = currentEvent.time_m;

            // Afficher l'heure
            textContainer.textContent = `Heure : ${time_h}h${time_m}`;
            currentEventElement.textContent = `Événement ${currentIndex + 1} sur ${totalEvents}`;

            // Effacer les anciens messages
            textMessageElement.innerHTML = ''; // Vide le contenu précédent

            // Afficher les nouveaux messages
            const messages = currentEvent.messages || []; // S'assurer que messages est toujours un tableau
            if (messages.length > 0) {
                messages.forEach(message => {
                    const messageType = mapMessageType(message.type);
                    const typeElement = document.createElement('span');
                    typeElement.classList.add(messageType);
                    typeElement.textContent = `${messageType}`;

                    const messageElement = document.createElement('span');
                    messageElement.classList.add('message-text');
                    messageElement.textContent = `: ${message.text}`;

                    textMessageElement.appendChild(typeElement);
                    textMessageElement.appendChild(messageElement);
                    textMessageElement.appendChild(document.createElement('br'));
                });
            } else {
                textMessageElement.textContent = 'Aucun message pour cet événement.';
            }
        }

        // Connectez-vous au WebSocket de l'API
        const socket = io('https://duncannmacleod-github-io-1.onrender.com');

        // Écoutez les mises à jour via WebSocket
        socket.on('variable_updated', (variable) => {
            console.log('Mise à jour reçue via WebSocket :', variable);
            currentIndex = variable.value; // Mettre à jour l'index actuel
            updateDisplay(); // Mettre à jour l'affichage
        });

        // Détectez les connexions WebSocket
        socket.on('connect', () => {
            console.log('Connecté au serveur WebSocket');
        });

        // Récupérer l'index actuel depuis l'API avant d'initialiser l'affichage
        currentIndex = await getVariable();
        updateDisplay();

        // Bouton "Précédent"
        document.getElementById("prev_button").addEventListener("click", async function () {
            if (currentIndex > 0) {
                currentIndex--;
                await updateVariable(currentIndex); // Mettre à jour la variable côté serveur
                updateDisplay(); // Mettre à jour l'affichage
            }
        });

        // Bouton "Suivant"
        document.getElementById("next_button").addEventListener("click", async function () {
            if (currentIndex < totalEvents - 1) {
                currentIndex++;
                await updateVariable(currentIndex); // Mettre à jour la variable côté serveur
                updateDisplay(); // Mettre à jour l'affichage
            }
        });
    });

// Fonction pour récupérer la variable actuelle depuis l'API
async function getVariable() {
    try {
        const response = await fetch('https://duncannmacleod-github-io-1.onrender.com/get_variable');
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération de la variable');
        }
        const variable = await response.json();
        console.log('Valeur actuelle de la variable :', variable.value); // Affiche la valeur pour le debug
        return variable.value; // Retourne la valeur (int ou autre type attendu)
    } catch (error) {
        console.error('Erreur lors de la récupération de la variable :', error);
        return 0; // Retourne une valeur par défaut
    }
}

// Fonction pour mettre à jour la variable côté serveur
async function updateVariable(newValue) {
    try {
        const response = await fetch('https://duncannmacleod-github-io-1.onrender.com/set_variable', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ value: newValue }),
        });

        if (!response.ok) {
            console.error('Erreur lors de la mise à jour de la variable');
        }
    } catch (error) {
        console.error('Erreur réseau :', error);
    }
}
