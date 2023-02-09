const fs = require("fs");
const http = require("http");
const host = 'localhost';
const port = 8080;
const server = http.createServer();

server.on("request", (req, res) => {
    if (req.url === '/image1') {
        const image1 = fs.readFileSync("./image1.jpg");
        res.end(image1);
    } else if (req.url === '/sound1') {
        const sound1 = fs.readFileSync("./sound1.mp3");
        res.end(sound1);
    } else if (req.url === '/video1.mp4') {
        const video1 = fs.readFileSync("./video1.mp4");
        res.end(video1);
    } else if (req.url === '/word1') {
        const word1 = fs.readFileSync("./word1.docx");
        res.end(word1);
    } else {
        const index = fs.readFileSync("./index.html", "utf-8");
        res.end(index);
    }
})

server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});