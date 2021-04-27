import * as WebSocket from "ws";

const wss = new WebSocket.Server({port: 8080});

function noop() {
}

wss.on('connection', (client: WebSocket) => {

    client.isAlive = true;
    client.on('pong', () => { client.isAlive = true});

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

    client.send('Welcome in the Chat Corner!')
});



const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {

        if (!ws.isAlive) {
            console.log("Exit");
            ws.terminate();
        }
        ws.isAlive = false;
        ws.ping(noop);

    });
}, 15000);

wss.on('close', () => {
    clearInterval(interval);
});



