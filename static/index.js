var socket = io();
// Cookies to keep SID

// connect is socketIO default
socket.on('connect', () => {
    document.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();  // Prevent form refresh
        
        let user_name = document.querySelector('input.username').value;
        let user_input = document.querySelector('input.message').value;
        if (!validation(user_input, user_name)) return;     // validation cause dont trust user at all  

        if (document.cookie){
            socket.emit('reconnect', document.cookie);
        }

        // document.cookie = `username=${encodeURIComponent(user_name)}; path=/;`; //Adding User as cookie for reconnection logic
        socket.emit('sign_in', user_name);
        document.querySelector('input.username').disabled = true; // Disabling username change, simple hack but doesn't work on reload of page 
        socket.emit('my event', { user_name: user_name, message: user_input });
        document.querySelector('input.message').value = '';
        document.querySelector('input.message').focus();
});
});

socket.on('my response', (msg) => {
    if (typeof msg.user_name !== 'undefined') {
        let message_holder = document.querySelector('div.message_holder');
        let new_message = document.createElement('div');
        new_message.innerHTML = `<b style="color: #000">${msg.user_name}</b>: ${msg.message}`;
        message_holder.appendChild(new_message);
    }
});

socket.on('current_users', (users) => {
    console.log("Connected users:", users);
});

window.onload = function() {
    socket.emit("getChatLog");
};

socket.on("chatLogForNewUsers", (chatLog)=>{
    for (const key in chatLog) {
        let message_holder = document.querySelector('div.message_holder');
        let new_message = document.createElement('div');
        new_message.innerHTML = `<b style="color: #000">${key}</b>: ${chatLog[key]}`;
        message_holder.appendChild(new_message);
    }
});

/* Cors 
const fetchPromise = fetch("https://bar.other");

fetchPromise
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
  });

*/

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