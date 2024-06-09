const fs = require('fs');

const users = JSON.parse(fs.readFileSync('utilisateurs_editeur.json'));


// uthentification utilisateur
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Rechercher l'utilisateur dans la liste des utilisateurs
    const user = users.find(user => user.username === username && user.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    return res.status(200).json({ message: 'Login successful' });
});