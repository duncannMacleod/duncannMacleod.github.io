document.getElementById("superviseur_link").addEventListener("click", function() {
    const password = prompt("Entrez le mot de passe pour accéder au mode superviseur:");
    if (password === "brioche") {
        document.getElementById("prev_button").style.visibility = "visible";  // Rendre visibles
        document.getElementById("current_event").style.visibility = "visible";
        document.getElementById("next_button").style.visibility = "visible";
    } else {
        alert("Mot de passe incorrect");
    }
});

window.onload = function() {
        document.getElementById("prev_button").style.visibility = "hidden";  // cacher au chargement
        document.getElementById("current_event").style.visibility = "hidden";
        document.getElementById("next_button").style.visibility = "hidden";
    }