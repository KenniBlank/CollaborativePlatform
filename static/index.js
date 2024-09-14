var socket = io();

socket.on('connect', () => {
    document.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();  // Prevent form refresh

        let user_name = document.querySelector('input.username').value;
        let user_input = document.querySelector('input.message').value;

        if (user_name && user_input) {
            socket.emit('sign_in', user_name);
            document.querySelector('input.username').disabled = true; // Disabling username change, simple hack but doesn't work on reload of page 
            socket.emit('my event', { user_name: user_name, message: user_input });
            document.querySelector('input.message').value = '';
            document.querySelector('input.message').focus();
        }
    });
});

socket.on('my response', (msg) => {
    console.log(msg);
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

/* Cors 
const fetchPromise = fetch("https://bar.other");

fetchPromise
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
  });

*/