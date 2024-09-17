from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

offer = None
answer = None
candidate_from_host = None

@app.route("/")
def default():
    return render_template("main.html")

@socketio.on("offer")
def saveOffer(data):
    global offer
    offer = data

@socketio.on("retrieveOffer")
def returnOffer():
    global offer
    socketio.emit('returnOffer', offer)

@socketio.on("answer")
def saveAnswer(data):
    global answer
    answer = data    

@socketio.on("retrieveAnswer")
def returnAnswer():
    global answer
    socketio.emit('returnAnswer', answer)

@socketio.on("candidateFromHost")
def handleCandidateFromHost(candidate):
    global candidate_from_host
    candidate_from_host = candidate
    print("Received candidate from host:", candidate)

@socketio.on("candidateFromClient")
def handleCandidateFromClient(candidate):
    global candidate_from_host
    print("Received candidate from client:", candidate)
    socketio.emit("candidateToClient", candidate_from_host)
    socketio.emit("candidateToHost", candidate, broadcast=True)

if __name__ == '__main__':
    print("http://192.168.1.91:5000")
    socketio.run(app, debug=True, port=5000, host='0.0.0.0')
