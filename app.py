from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = '????????????'
socketio = SocketIO(app, cors_allowed_origins="*")

# Variable globale
current_variable = 0

@app.route('/get_variable', methods=['GET'])
def get_variable():
    return jsonify({"value": current_variable})

@app.route('/set_variable', methods=['POST'])
def set_variable():
    global current_variable
    data = request.json
    if "value" in data:
        current_variable = data["value"]
        socketio.emit('variable_updated', {"value": current_variable})
        return jsonify({"message": "Variable mise à jour"}), 200
    return jsonify({"error": "Valeur manquante"}), 400

@socketio.on('connect')
def handle_connect():
    print('Client connecté')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client déconnecté')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
