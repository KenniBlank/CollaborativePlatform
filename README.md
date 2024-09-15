# CollaborativePlatform
A collaborative platform which supports multiple users at the same time

# Documentation:

- WebSocket + Flask for the basic chat application. No fanciness yet
- Cross Origin Resource Sharing
- Cookies to handle reconnection

## Video Connecting feature:
- using webRTC and plain JS


## TODO list:
Had made this a while ago, so reusing it: [Link to Code](https://github.com/KenniBlank/Todo_List.git)
Favicon from: [Flaticon](https://www.flaticon.com/free-icons/live-chat)

## JSON and WHY?
instead of sending in dictionary from server which is unreliable in case of server failure(Experienced it at another project), storing the whole data in a JSON file allows reliable storage and transfer to all users.

format:
```json
{
    "chatLog":{
        "username": "Message"
    },
    "taskLog":{
        "taskName": {
            "status": false,
            "Description": ""
        }
    }
}
```