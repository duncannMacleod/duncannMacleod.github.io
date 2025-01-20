from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit

# Initialisation de l'application Flask et SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = 'votre_cle_secrete'
socketio = SocketIO(app, cors_allowed_origins="*")

# Variable à gérer
shared_variable = {'value': 0}

# Endpoint REST pour obtenir la valeur de la variable
@app.route('/get_variable', methods=['GET'])
def get_variable():
    return jsonify(shared_variable)

# Endpoint REST pour modifier la variable
@app.route('/set_variable', methods=['POST'])
def set_variable():
    global shared_variable
    data = request.json
    if 'value' in data:
        shared_variable['value'] = data['value']
        # Notifier tous les clients via WebSocket
        socketio.emit('variable_updated', shared_variable)
        return jsonify({"message": "Variable updated"}), 200
    return jsonify({"error": "Invalid request"}), 400

# WebSocket pour écouter les mises à jour
@socketio.on('connect')
def on_connect():
    print("Un client s'est connecté.")
    emit('variable_updated', shared_variable)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
