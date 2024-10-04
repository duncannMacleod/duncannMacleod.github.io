const separator = document.getElementById('separator');
const leftColumn = document.querySelector('.left-column');
const rightColumn = document.querySelector('.right-column');

let isResizing = false;

separator.addEventListener('mousedown', (event) => {
    isResizing = true;
    document.body.style.cursor = 'ew-resize'; // Changer le curseur pendant le glissement
});

document.addEventListener('mousemove', (event) => {
    if (!isResizing) return;

    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();
    const leftWidth = event.clientX - containerRect.left;

    // Limiter la largeur minimale et maximale des colonnes
    const minColumnWidth = 300; // largeur minimale des colonnes
    const maxLeftWidth = containerRect.width - minColumnWidth - separator.offsetWidth; // largeur maximale pour la colonne gauche

    // Assurez-vous que le séparateur ne sort pas du conteneur
    if (leftWidth >= minColumnWidth && leftWidth <= maxLeftWidth) {
        leftColumn.style.width = `${leftWidth}px`; // Ajuste la largeur de la colonne gauche
        rightColumn.style.width = `${containerRect.width - leftWidth - separator.offsetWidth}px`; // Ajuste la largeur de la colonne droite
        console.log(`Largeur de la colonne gauche : ${leftWidth}px`);
        console.log(`Largeur de la colonne droite : ${containerRect.width - leftWidth - separator.offsetWidth}px`);
    }
});

document.addEventListener('mouseup', () => {
    isResizing = false;
    document.body.style.cursor = ''; // Rétablir le curseur par défaut
});
