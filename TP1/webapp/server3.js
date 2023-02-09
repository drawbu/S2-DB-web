const fs = require('fs');
const http = require('http');
const host = 'localhost';
const port = 8080;
const server = http.createServer();

server.on('request', (req, res) => {
  if (req.url === '/') {
    const index = fs.readFileSync('./index.html');
    res.end(index);
  } else {
    const filename = fs.existsSync(`.${req.url}`) ? `.${req.url}` : './error.html';
    let file;
    if (filename.endsWith('.html') || filename.endsWith('.css')) {
      file = fs.readFileSync(filename, 'utf-8');
    } else {
      file = fs.readFileSync(filename);
    }
    res.end(file);
  }
})

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
