from flask import Flask, render_template, request, make_response
from flask_socketio import SocketIO
import json
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
users = {}

# Route to render the HTML page
@app.route("/")
def defaultRoute():
    return render_template("index.html", title="CCT Online") #Collaborative Communication Tasks

# Event when a client connects and sends their username
@socketio.on('sign_in')
def user_sign_in(user_name, methods=['GET', 'POST']):
    users[request.sid] = user_name 
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

@socketio.on('disconnect')
def on_disconnect():
    removed_user = users.pop(request.sid, 'Spectator')
    socketio.emit('ConnectOrDisconnect', f"<i style=\"color: #000; font-size: 0.8rem;\">{removed_user} has left the chat</i>")

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
    socketio.emit('my response', { "user_name": key, "message": jsonData["message"]})

@socketio.on("newTask")
def newTaskAddition(data):
    taskName = data.get("taskName")
    taskDescription = data.get("taskDescription", "----")
    if taskName:
        with open("data.JSON", "r") as file:
            json_data = json.load(file)
        if "taskLog" not in json_data:
            json_data["taskLog"] = {}
        json_data["taskLog"][taskName] = {
            "status": False,
            "description": taskDescription
        }
        with open("data.JSON", "w") as file:
            json.dump(json_data, file, indent=4)
        socketio.emit("task", {taskName: {"status": False, "description": taskDescription}})

@socketio.on("getTaskLog")
def taskLogging():
    with open('data.JSON', 'r') as file:
        json_data = json.load(file)
    taskLog = json_data.get("taskLog", {})
    socketio.emit("taskLogForNewUsers", taskLog, room=request.sid)

@socketio.on("changeInStatusOfTask")
def changeTaskStatus(data):
    if data["color"] == "red":
        status = True
    else:
        status = False
    taskName = data["taskId"]
    with open("data.JSON", 'r') as file:
        json_data = json.load(file)
    json_data["taskLog"][taskName]["status"] = status
    with open("data.JSON", "w") as file:
        json.dump(json_data, file, indent=4)
    socketio.emit("changeColorOfTask", data)

@socketio.on("deleteTask")
def changeTask(ID):
    with open("data.JSON", "r") as file:
        json_data = json.load(file)
    json_data["taskLog"].pop(ID, None)
    with open("data.JSON", "w") as file:
        json.dump(json_data, file, indent = 4)
    socketio.emit("deleteFromLocalTask", ID)

if __name__ == '__main__':
    print("http://192.168.1.91:5000")
    socketio.run(app, debug=True, port=5000, allow_unsafe_werkzeug=True, host="0.0.0.0")
    
