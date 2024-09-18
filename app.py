from flask import Flask, render_template, request, make_response
from flask_socketio import SocketIO
import json
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

# Dictionary to track connected users
users = {}

# Route to render the HTML page
@app.route("/")
def defaultRoute():
    return render_template("index.html", title="CCT Online") #Collaborative Communication Tasks

# Event when a client connects and sends their username
@socketio.on('sign_in')
def user_sign_in(user_name, methods=['GET', 'POST']):
    users[request.sid] = user_name 
    socketio.emit('current_users', users) 
    with open("data.JSON", "r") as file:
        json_data = json.load(file)
    
    stored_users = json_data["users"]
    if user_name in stored_users:
        socketio.emit("invalidUsername")
    else:
        stored_users.append(user_name)
        json_data["users"] = stored_users
        with open("data.JSON", "w") as file:
            json.dump(json_data, file, indent=4)  # Write with indentation for readability
    socketio.emit('ConnectOrDisconnect', f"<i style=\"color: #000; font-size: 0.8rem;\">{user_name} has joined the chat</i>")

@socketio.on("getChatLog")
def chatLogging():
    with open('data.JSON', 'r') as file:
        json_data = json.load(file)
    chatLog = json_data.get('chatLog', {})
    socketio.emit("chatLogForNewUsers", chatLog, room=request.sid) # Broadcast to the user only


# Event when a user disconnects: This is socket io default
@socketio.on('disconnect')
def on_disconnect():
    removed_user = users.pop(request.sid, 'Spectator')
    socketio.emit('ConnectOrDisconnect', f"<i style=\"color: #000; font-size: 0.8rem;\">{removed_user} has left the chat</i>")

def messageReceived():
    print('Message received!')

@socketio.on('my event')
def handle_my_custom_event(jsonData, methods=['GET', 'POST']):
    with open('data.JSON', "r") as file:
        json_data = json.load(file)
    if "chatLog" not in json_data:
        json_data["chatLog"] = {}

    current_time = datetime.now().strftime('%Y-%m-%d*%H:%M:%S.%f')[:-3]  # Format: YYYY-MM-DD HH:MM:SS.mmm
    key = f"{current_time} {jsonData['user_name']}"
    json_data["chatLog"][key] = jsonData["message"]

    with open('data.JSON', 'w') as file:
        json.dump(json_data, file, indent=4)
    socketio.emit('my response', { "user_name": key, "message": jsonData["message"]}, callback=messageReceived)


if __name__ == '__main__':
    print("http://192.168.1.91:5000")
    socketio.run(app, debug=True, port=5000, allow_unsafe_werkzeug=True, host="0.0.0.0")
    
