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
    return render_template("index.html", title="HomePage")

# Event when a client connects and sends their username
@socketio.on('sign_in')
def user_sign_in(user_name, methods=['GET', 'POST']):
    users[request.sid] = user_name  # Associate user with session ID which is unique to every client on joining
    socketio.emit('current_users', users)  # Broadcast current users to everyone
    print(f"New user signed in: {user_name}")
    print(chatLog)
    print("Current users:", users)

@socketio.on("getChatLog")
def chatLogging():
    socketio.emit("chatLogForNewUsers", chatLog, room=request.sid); # Broadcast to the user only


# Event when a user disconnects: This is socket io default
@socketio.on('disconnect')
def on_disconnect():
    removed_user = users.pop(request.sid, 'No user found')
    socketio.emit('current_users', users)  # Broadcast current users to everyone, default
    print(f"User {removed_user} disconnected!")
    print("Current users:", users)

def messageReceived():
    print('Message received!')

@socketio.on('reconnect')
def reconnect_logic(cookie):
    print(cookie);

@socketio.on('my event')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    print(f"Received event: {json}")
    chatLog[json['user_name']] = json['message']
    socketio.emit('my response', json, callback=messageReceived) #this is send to all users by default

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000, allow_unsafe_werkzeug=True)
