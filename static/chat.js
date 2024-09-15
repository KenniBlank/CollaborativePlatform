var socket = io();

window.onload = function() {
    if (document.cookie){
        const user_name = getCookieValue('username');
        if (user_name.length > 3){
            document.querySelector("input.username").value = user_name;
            document.querySelector('input.username').disabled = true;
            socket.emit("sign_in", user_name);
        }
    }
    socket.emit("getChatLog");
};
function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
}

// connect is socketIO default
socket.on('connect', () => {
    document.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();  // Prevent from refresh
        let user_name = document.querySelector('input.username').value;
        let user_input = document.querySelector('input.message').value;
        if (!validation(user_input, user_name)) return;     // validation cause dont trust user at all  

        let hours = 24;
        const expiryTime = new Date(Date.now() + hours * 60 * 60 * 1000).toUTCString();
        document.cookie = `username=${encodeURIComponent(user_name)}; expires=${expiryTime}; path=/;`; //Adding User as cookie for reconnection logic
        
        if (document.querySelector('input.username').disabled != true)
            socket.emit('sign_in', user_name);
        document.querySelector('input.username').disabled = true; // Disabling username change, simple hack
        socket.emit('my event', { user_name: user_name, message: user_input });
        document.querySelector('input.message').value = '';
        document.querySelector('input.message').focus();
    });
});

socket.on('my response', (msg) => {
    if (typeof msg.user_name !== 'undefined') {
        let message_holder = document.querySelector('div.message_holder');
        let new_message = document.createElement('div');
        new_message.innerHTML = `<b>${msg.user_name}</b>: ${msg.message}`;
        message_holder.appendChild(new_message);
    }
});

socket.on('current_users', (users) => {
    console.log("Connected users:", users);
});


socket.on("chatLogForNewUsers", (chatLog)=>{
    for (const key in chatLog) {
        let message_holder = document.querySelector('div.message_holder');
        let new_message = document.createElement('div');
        new_message.innerHTML = `<b style="color: #000">${key}</b>: ${chatLog[key]}`;
        message_holder.appendChild(new_message);
    }
});


socket.on("ConnectOrDisconnect", (message)=>{
    let message_holder = document.querySelector('div.message_holder');
    let new_message = document.createElement('div');
    new_message.innerHTML = `${message}`;
    message_holder.appendChild(new_message);
});

function validation(input, name)
{
    if (!input)
        document.querySelector('input.message').setAttribute('required', true); 
    else if(input.length < 1) 
        document.querySelector("input.message").setAttribute("minlength", "1");
    else if (!name) 
        document.querySelector('input.username').setAttribute('required', true);
    else if(name.length < 3 || name.length > 12){
        document.querySelector("input.username").setAttribute("minlength", "3");
        document.querySelector("input.username").setAttribute("maxlength", "12");
    }
    else 
        return true;

    return false;
}


function toggleWindow(message) {
    const chatWindow = document.getElementById(message);
    if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
        chatWindow.style.display = 'block';
    } else {
        chatWindow.style.display = 'none';
    }
}
