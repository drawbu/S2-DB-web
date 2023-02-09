const http = require('http');
const server = http.createServer();

const fs = require('fs');

server.on('request', (request, response) => {
    const indexPage = fs.readFileSync('index.html','utf-8');
    response.end(indexPage);
});

const host = 'localhost';
const port = 8080;


server.listen(port, () => {
    console.log(`Le serveur écoute sur http://localhost:8080`)
})
