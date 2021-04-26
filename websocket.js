"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = require("ws");
var express = require('express');
var port = process.env.PORT || 8080;
var server = express()
    .listen(port, function () { return console.log("Listening on " + port); });
var wss = new WebSocket.Server({ server: server });
wss.on('connection', function (client) {
    client.on('message', function (data) {
        client.send(data);
        // for (let client1 of Array.from(wss.clients)) {
        //     if (client1 !== client) {
        //         client1.send(data);
        //     }
        // }
        console.log(data);
        Array.from(wss.clients)
            .filter(function (connectedClient) { return connectedClient !== client; })
            .forEach(function (connectedClient) { return connectedClient.send(data); });
    });
    client.send('Welcome in the Chat Corner!');
});
//# sourceMappingURL=websocket.js.map