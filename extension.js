(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {
        socket.close();
    };

    var socket = null;
    var pendingMessages = [];
    var awaitingUsername = true;

    function sendMessage(message) {
        socket.send(message);
    }

    ext.connect = function(addr, username, callback) {
        if (socket != null) {
            socket.close();
            awaitingUsername = true;
        }

        socket = new WebSocket("ws://" + addr + ":1337");

        socket.onopen = function(event) {
            sendMessage(username);
        }   

        socket.onmessage = function(event) {
            var received = event.data;

            if (awaitingUsername) {
                awaitingUsername = false;
                console.log("callbacking");
                callback();
            }

            pendingMessages.push(received);
            console.log(pendingMessages);
        }
    }

    ext.getNextMessage = function() {
        if (pendingMessages == [] || pendingMessages == '') {
            return "no new message";
        } else {
            return pendingMessages.pop();
        }
    }

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['w', 'connect to %s as user %s', 'connect', '', ''],
            [' ', 'send message %s', 'sendMessage', 'Hello, World!'],
            ['r', 'next message', 'getNextMessage']
        ],
        menus: {
           
        }
    };

    // Register the extension
    ScratchExtensions.register('Code Club Chat', descriptor, ext);
})({});