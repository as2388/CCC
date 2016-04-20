(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {
        socket.close();
    };

    var socket = null;
    var pendingMessages = [];
    var awaitingUsername = true;

    ext.sendMessage = function(message) {
        socket.send(message);
    }

    ext.connect = function(addr, username, callback) {
        if (socket != null) {
            socket.close();
            awaitingUsername = true;
            pendingMessages = [];
        }

        socket = new WebSocket("ws://" + addr + ":1337");

        socket.onopen = function(event) {
            ext.sendMessage(username);
        }   

        socket.onmessage = function(event) {
            var received = event.data;

            if (awaitingUsername) {
                awaitingUsername = false;
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

    ext.hatNewMessage = function() {
       return !(pendingMessages == [] || pendingMessages == '');
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['w', 'connect to %s as user %s', 'connect', '', ''],
            [' ', 'send message %s', 'sendMessage', 'Hello, World!'],
            ['r', 'next message', 'getNextMessage'],
            ['h', 'when new message received', 'hatNewMessage']
        ],
        menus: {
           
        }
    };

    // Register the extension
    ScratchExtensions.register('Code Club Chat', descriptor, ext);
})({});