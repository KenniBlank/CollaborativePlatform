from flask import Flask, render_template, request
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
# CORS(app)

# Dictionary to track connected users
users = {}

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
    print("Current users:", users)

# Event when a user disconnects
@socketio.on('disconnect')
def on_disconnect():
    removed_user = users.pop(request.sid, 'No user found')
    socketio.emit('current_users', users)  # Broadcast current users to everyone, default
    print(f"User {removed_user} disconnected!")
    print("Current users:", users)

def messageReceived():
    print('Message received!')

@socketio.on('my event')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    print(f"Received event: {json}")
    socketio.emit('my response', json, callback=messageReceived)


# CORS example:

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000, allow_unsafe_werkzeug=True)
