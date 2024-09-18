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
    socket.emit("getTaskLog");
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
        user_name = user_name.trim();
        let user_input = document.querySelector('input.message').value;
        if (!validation(user_input, user_name)) return;     // validation cause dont trust user at all  

        let hours = 24;
        const expiryTime = new Date(Date.now() + hours * 60 * 60 * 1000).toUTCString();
        document.cookie = `username=${encodeURIComponent(user_name)}; expires=${expiryTime}; path=/;`; //Adding User as cookie for reconnection logic
        
        if (document.querySelector('input.username').disabled != true)
            socket.emit('sign_in', user_name);
        document.querySelector('input.username').disabled = true; // Disabling username change, simple hack
        socket.emit('my event', { user_name: user_name, message: user_input});
        document.querySelector('input.message').value = '';
        document.querySelector('input.message').focus();
    });
});

socket.on("invalidUsername", () => {
    let usernameInput = document.querySelector("input.username");
    usernameInput.value = ""; 
    usernameInput.setCustomValidity("Username Already Exists"); 
    usernameInput.reportValidity();

    usernameInput.setCustomValidity("");
    usernameInput.reportValidity();
});


socket.on('my response', (msg) => {
    if (typeof msg.user_name !== 'undefined') {
        let message_holder = document.querySelector('div.message_holder');
        let new_message = document.createElement('div');
        let timeName = msg.user_name.split(" ");
        new_message.innerHTML = `<b>${timeName[1]}</b>: ${msg.message}`;
        message_holder.appendChild(new_message);
    }
});

socket.on("chatLogForNewUsers", (chatLog)=>{
    for (const key in chatLog) {
        let message_holder = document.querySelector('div.message_holder');
        let new_message = document.createElement('div');
        let timeName = key.split(" ");
        new_message.innerHTML = `<b style="color: #000">${timeName[1]}</b>: ${chatLog[key]}<br>`;
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
    else if (!/^[a-zA-Z0-9]+$/.test(name)) {
        let usernameInput = document.querySelector("input.username");
        usernameInput.setCustomValidity("Invalid Username");
        usernameInput.reportValidity();
    } else {
        let usernameInput = document.querySelector("input.username");
        usernameInput.setCustomValidity("");
        usernameInput.reportValidity();
        return true;
    } 
    return false;
}


function toggleWindow(id) {
    const chatWindow = document.getElementById(id);
    if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
        chatWindow.style.display = 'block';
    } else {
        chatWindow.style.display = 'none';
    }
}


function convertDateString(dateString) {
    const [datePart, timePart] = dateString.split('*');
    const [year, month, day] = datePart.split('-');
    const time = timePart.split('.')[0];
    return `(${year}-${month}-${day}) ${time}`;
}

// Tasks
document.getElementById("addTask").onclick = taskAdd;

socket.on("task", (data) => {
    let task_holder = document.querySelector('div.task_holder');
    let new_task = document.createElement('div');
    for (const taskName in data)
    {
        taskDescription = data[taskName]["description"];
        taskState = data[taskName]["status"];

        new_task.innerHTML = `<b style="color: #000">${taskName}</b>: ${taskDescription}<br>`;
        task_holder.appendChild(new_task);
    }
});

function taskAdd(e) {
    e.preventDefault();
    const taskName = document.getElementById("taskName").value;
    const taskDescription = document.getElementById("taskDescription").value; // Corrected selector
    socket.emit("newTask", {
        taskName: taskName,
        taskDescription: taskDescription
    });
}

socket.on("taskLogForNewUsers", (taskLog)=>{
    for (const taskName in taskLog) {
        let task_holder = document.querySelector('div.task_holder');
        let new_task = document.createElement('div');

        taskDescription = taskLog[taskName]["description"];
        taskState = taskLog[taskName]["status"];

        new_task.innerHTML = `<b style="color: #000">${taskName}</b>: ${taskDescription}<br>`;
        task_holder.appendChild(new_task);
    }
});

