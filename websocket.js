"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = require("ws");
var wss = new WebSocket.Server({ port: 8080 });
function noop() {
}
wss.on('connection', function (client) {
    client.isAlive = true;
    client.on('pong', function () { client.isAlive = true; });
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
    client.send('Welcome in the Chat Corner!');
});
var interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (!ws.isAlive) {
            console.log("Exit");
            ws.terminate();
        }
        ws.isAlive = false;
        ws.ping(noop);
    });
}, 15000);
wss.on('close', function () {
    clearInterval(interval);
});
//# sourceMappingURL=websocket.js.map