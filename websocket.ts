import * as WebSocket from "ws";

const express = require('express');

const port = process.env.PORT || 8080;

const server = express()
    .listen(port, () => console.log(`Listening on ${port}`));


const wss = new WebSocket.Server({ server });


wss.on('connection', (client: WebSocket) => {

    client.on('message', data => {

        client.send(data);
        // for (let client1 of Array.from(wss.clients)) {
        //     if (client1 !== client) {
        //         client1.send(data);
        //     }
        // }
        console.log(data);
        Array.from(wss.clients)
            .filter(connectedClient => connectedClient !== client)
            .forEach(connectedClient => connectedClient.send(data));

    });

    client.send('Welcome in the Chat Corner!');
});

