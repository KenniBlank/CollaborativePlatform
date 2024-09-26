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


function openWindow(id) {
    const Window = document.getElementById(id);
    
    if (Window.style.display === 'none' || Window.style.display === '') {
        Window.style.display = 'block';        
        ToFocus(id);
    }
    else if(Window.style.zIndex == "0" && Window.style.display == "block"){
        ToFocus(id);
    }
}

function closeWindow(id){
    document.getElementById(id).style.display = "none";
}

function dragWindow(id){
    Window = document.getElementById(id);
}

function ToFocus(id){
    document.getElementById(id).style.zIndex = "1";
    if (id === "taskWindow")
        document.getElementById("chatWindow").style.zIndex = "0"; 
    else
        document.getElementById("taskWindow").style.zIndex = "0"; 
}

function convertDateString(dateString) {
    const [datePart, timePart] = dateString.split('*');
    const [year, month, day] = datePart.split('-');
    const time = timePart.split('.')[0];
    return `(${year}-${month}-${day}) ${time}`;
}

// Tasks
document.getElementById("addTask").onclick = taskAdd;

socket.on("task", (newTask) => {
    let task_holder = document.querySelector('div.task_holder');

    let task = document.createElement('div');
    task.classList.add("task");
    
    const taskName = Object.keys(newTask)[0];
    task.id = taskName;
    
    let taskDescription = newTask[taskName]["description"];
    let taskState = newTask[taskName]["status"];

    console.log(taskName, taskDescription, taskState);

    checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.onclick = () => taskStateUpdate(taskName);
        
    let label = document.createElement('label');
    label.innerHTML = `<b style="color: #000">${taskName}</b>: ${taskDescription}`;

    let deleteButton = document.createElement('img');
    deleteButton.src = "../static/img/task/bin.png";
    deleteButton.alt = "delete task button";
    deleteButton.style.cursor = "pointer";
    deleteButton.classList.add("taskImage");
    deleteButton.onclick = () => deleteTask(taskName);

    task.appendChild(checkbox);
    task.appendChild(label);
    task.appendChild(deleteButton);

    task_holder.appendChild(task);
});

function deleteTask(taskId){
    socket.emit("deleteTask", taskId);
}

socket.on("deleteFromLocalTask", (taskId)=> {
    let deleteButton = document.getElementById(taskId);
    if (deleteButton) {
        let parentDiv = deleteButton.closest('div.task');
        if (parentDiv)
            parentDiv.remove();
    }
})

function taskStateUpdate(taskId) {
    let task = document.getElementById(taskId);
    let color = "";
    if (task) {
        if (task.style.backgroundColor == "")
            color = "rgb(249, 74, 74)";
        else
            color = "";
        socket.emit("changeInStatusOfTask", { taskId: taskId, color: color });
    }
}

socket.on("changeColorOfTask", (data) => {
    let { taskId, color } = data;
    let task = document.getElementById(taskId);
    let checkbox = task.querySelectorAll('input[type="checkbox"]');
    if (task)
        task.style.backgroundColor = color;
    if (color)    
        task.style.color = "White";
    else
        task.style.color = "black";
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

socket.on("taskLogForNewUsers", (taskLog) => {
    let taskHolder = document.querySelector('div.task_holder');
    
    // Clear the task holder to avoid duplicates (if needed)
    taskHolder.innerHTML = '';

    for (const taskName in taskLog) {        
        let taskDescription = taskLog[taskName]["description"];
        let taskState = taskLog[taskName]["status"];

        // Create a task element with a checkbox and delete button
        let task = document.createElement('div');
        task.classList.add("task");
        if (taskState == false)
            task.style.backgroundColor = "";
        else
            task.style.backgroundColor = "Red";
        task.id = taskName;

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = taskState;
        checkbox.onclick = () => taskStateUpdate(taskName);

        let label = document.createElement('label');
        label.innerHTML = `<b style="color: #000">${taskName}</b>: ${taskDescription}`;
        
        let deleteButton = document.createElement('img');
        deleteButton.src = "../static/img/task/bin.png";
        deleteButton.alt = "delete task button";
        deleteButton.style.cursor = "pointer";
        deleteButton.classList.add("taskImage");
        deleteButton.onclick = () => deleteTask(taskName);

        task.appendChild(checkbox);
        task.appendChild(label);
        task.appendChild(deleteButton);
        taskHolder.appendChild(task);
    }
});

