

// Charger le fichier JSON avec fetch
fetch('data/index/timestamp_index.json')
    .then(response => response.json())
    .then(data => {
        let currentIndex
        // Connectez-vous au WebSocket de l'API
        const socket = io('https://duncannmacleod-github-io-1.onrender.com');

        // Écoutez l'événement 'variable_updated' pour mettre à jour l'affichage
        socket.on('variable_updated', (data) => {
            console.log('Mise à jour reçue via WebSocket :', data);
            data = currentIndex
        });

        // Détectez les connexions
        socket.on('connect', () => {
            console.log('Connecté au serveur WebSocket');
        });

        currentIndex = getVariable(); // Index de l'événement actuel
        const totalEvents = data.length; // Nombre total d'événements

        // Sélectionner les éléments HTML où afficher les informations
        const textContainer = document.getElementById('textContainer');
        const currentEventElement = document.getElementById('current_event');
        const textMessageElement = document.getElementById('textMessage'); // Pour afficher les messages

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

        // Afficher l'heure et les messages de l'élément actuel
        function updateDisplay() {
            const currentEvent = data[currentIndex];
            const time_h = currentEvent.time_h;
            const time_m = currentEvent.time_m;

            // Afficher l'heure
            textContainer.textContent = `Heure : ${time_h}h${time_m}`;
            currentEventElement.textContent = `Événement ${currentIndex + 1} sur ${totalEvents}`;

            // Mise à jour des marqueurs de train via un événement personnalisé
            const event = new CustomEvent('timeChanged', { detail: { currentIndex } });
            document.dispatchEvent(event);

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

        // Initialiser l'affichage
        updateDisplay();



        document.getElementById("prev_button").addEventListener("click", function () {
            // Logique pour déterminer l'événement précédent
            if (currentIndex > 0) {
                currentIndex--;
                updateDisplay();
            }
            updateVariable(currentIndex)
        });

        document.getElementById("next_button").addEventListener("click", function () {
            // Logique pour déterminer l'événement suivant
            if (currentIndex < totalEvents - 1) {
                currentIndex++;
                updateDisplay();
            }
            updateDisplay(currentIndex)
        })
    });

async function getVariable() {
    try {
        const response = await fetch('https://duncannmacleod-github-io-1.onrender.com/get_variable');
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération de la variable');
        }
        const data = await response.json();
        console.log('Valeur actuelle de la variable :', data.value); // Affiche la valeur pour le debug
        return data.value; // Retourne la valeur (int ou autre type attendu)
    } catch (error) {
        console.error('Erreur lors de la récupération de la variable :', error);
        return null; // Retourne `null` en cas d'erreur
    }
}
async function updateVariable(newValue) {
    try {
        const response = await fetch('https://duncannmacleod-github-io-1.onrender.com/set_variable', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ value: newValue }),
        });

        if (response.ok) {
            console.log('Variable mise à jour avec succès');
            getVariable(); // Mettre à jour l'affichage après modification
        } else {
            console.error('Erreur lors de la mise à jour de la variable');
        }
    } catch (error) {
        console.error('Erreur réseau :', error);
    }
}

