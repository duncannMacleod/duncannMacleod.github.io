// Charger le fichier JSON avec fetch
fetch('data/index/timestamp_index.json')
    .then(response => response.json())
    .then(data => {
        // Extraire les valeurs de time_h et time_m pour le premier élément (par défaut)
        let currentIndex = 0;
        const totalEvents = data.length;
        
        // Sélectionner les éléments HTML où afficher les informations
        const textContainer = document.getElementById('textContainer');
        const currentEventElement = document.getElementById('current_event');
        const textMessageElement = document.getElementById('textMessage'); // Pour afficher les messages
        
        // Fonction de mappage de message.type à text1, text2, etc.
        function mapMessageType(type) {
            switch (type) {
                case "green":
                    return "text4";
                case "yellow":
                    return "text2";
                case "orange":
                    return "text3";
                case "red":
                    return "text1";
                default:
                    return ""; // Cas par défaut si le type n'est pas reconnu
            }
        }
        
        // Afficher l'heure, les événements et les messages de l'élément actuel
        function updateDisplay() {
            const currentEvent = data[currentIndex];
            const time_h = currentEvent.time_h;
            const time_m = currentEvent.time_m;
            
            // Afficher l'heure
            textContainer.textContent = `Heure : ${time_h}h${time_m}`;

            // Afficher le rang actuel
            currentEventElement.textContent = `Événement ${currentIndex + 1} sur ${totalEvents}`;
            
            // Effacer les anciens messages
            textMessageElement.innerHTML = ''; // Vide le contenu précédent
            
            // Afficher les nouveaux messages
            const messages = currentEvent.messages;
            if (messages && messages.length > 0) {
                messages.forEach(message => {
                    // Mappage du type de message
                    const messageType = mapMessageType(message.type);
                    
                    // Créer un élément pour le texte (ex. text1) avec la couleur appropriée
                    const typeElement = document.createElement('span');
                    typeElement.classList.add(messageType);
                    typeElement.textContent = `${messageType}`;

                    // Créer un élément pour le message (ex. "blabla") en noir
                    const messageElement = document.createElement('span');
                    messageElement.classList.add('message-text');
                    messageElement.textContent = `: ${message.text}`;

                    // Ajouter les deux éléments (type + texte du message) au conteneur
                    textMessageElement.appendChild(typeElement);
                    textMessageElement.appendChild(messageElement);

                    // Ajouter un saut de ligne après chaque message pour meilleure lisibilité
                    textMessageElement.appendChild(document.createElement('br'));
                });
            } else {
                textMessageElement.textContent = 'Aucun message pour cet événement.';
            }
        }

        // Initialiser l'affichage
        updateDisplay();

        // Ajouter des événements pour les boutons "précédent" et "suivant"
        document.getElementById('prev_button').addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateDisplay();
            }
        });

        document.getElementById('next_button').addEventListener('click', () => {
            if (currentIndex < totalEvents - 1) {
                currentIndex++;
                updateDisplay();
            }
        });
    })
    .catch(error => {
        console.error('Erreur lors du chargement du fichier JSON:', error);
    });
    