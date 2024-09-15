from flask import Flask, render_template, request, make_response
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

# Dictionary to track connected users
users = {}
chatLog = {}

# Route to render the HTML page
@app.route("/")
def defaultRoute():
    return render_template("index.html", title="CCT Online") #Collaborative Communication Tasks

# Event when a client connects and sends their username
@socketio.on('sign_in')
def user_sign_in(user_name, methods=['GET', 'POST']):
    users[request.sid] = user_name  # Associate user with session ID which is unique to every client on joining
    socketio.emit('current_users', users)  # Broadcast current users to everyone
    socketio.emit('ConnectOrDisconnect', f"<i style=\"color: #000; font-size: 0.9em;\">{user_name} has joined the chat</i>")

@socketio.on("getChatLog")
def chatLogging():
    socketio.emit("chatLogForNewUsers", chatLog, room=request.sid); # Broadcast to the user only


# Event when a user disconnects: This is socket io default
@socketio.on('disconnect')
def on_disconnect():
    removed_user = users.pop(request.sid, 'Spectator')
    socketio.emit('current_users', users)  # Broadcast current users to everyone, default
    socketio.emit('ConnectOrDisconnect', f"<i style=\"color: #000; font-size: 0.9em;\">{removed_user} has left the chat</i>")

def messageReceived():
    print('Message received!')

@socketio.on('my event')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    chatLog[json['user_name']] = json['message']
    socketio.emit('my response', json, callback=messageReceived) #this is sent to all users by default

if __name__ == '__main__':
    print("http://192.168.1.91:5000")
    socketio.run(app, debug=True, port=5000, allow_unsafe_werkzeug=True, host="0.0.0.0")
