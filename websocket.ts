import * as WebSocket from "ws";

const ws = require('ws');

const wss = new WebSocket.Server({port: 8080});

interface ExtWebSocket extends WebSocket {
    isAlive: boolean;
}

function heartbeat() {
    ws.isAlive = true;
}

wss.on('connection', (client: WebSocket) => {

    client.on('pong', () => {
        ws.isAlive = true
        console.log("here");
    });

    client.on('message', data => {
        for (let client2 of Array.from(wss.clients)) {
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
            const extWs = ws as ExtWebSocket;
            extWs.on('pong', () => {
                console.log(extWs.isAlive);
            })
            if (!extWs.isAlive) {
                console.log("Exited");
                ws.terminate();
            }
            extWs.ping("test", false, err => {
                console.log(err);
            });
            extWs.isAlive = false;
        });
    }, 2000);


    client.send('Welcome in the Chat Corner!')
});
