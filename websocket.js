"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = require("ws");
var ws = require('ws');
var wss = new WebSocket.Server({ port: 8080 });
function heartbeat() {
    ws.isAlive = true;
}
wss.on('connection', function (client) {
    client.on('pong', function () {
        ws.isAlive = true;
        console.log("here");
    });
    client.on('message', function (data) {
        for (var _i = 0, _a = Array.from(wss.clients); _i < _a.length; _i++) {
            var client2 = _a[_i];
            if (client2 !== client) {
                client2.send(data);
            }
        }
        /* Array.from(wss.clients)
             .filter(client1 => client1 !== client)
             .forEach(client1 => client1.send(data));*/
    });
    setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            var extWs = ws;
            extWs.on('pong', function () {
                console.log(extWs.isAlive);
            });
            if (!extWs.isAlive) {
                console.log("Exited");
                ws.terminate();
            }
            extWs.ping("test", false, function (err) {
                console.log(err);
            });
            extWs.isAlive = false;
        });
    }, 2000);
    client.send('Welcome in the Chat Corner!');
});
//# sourceMappingURL=websocket.js.map