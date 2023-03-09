const fs = require('fs');
const http = require('http');

const host = 'localhost';
const port = 8080;
const server = http.createServer();

server.on('request', (req, res) => {
  if (req.url === '/') {
    const index = fs.readFileSync('./pages/index.html');
    res.end(index);
    return;
  }

  if (req.url.startsWith('/image') && !req.url.startsWith('/images')) {
    const index = fs.readFileSync('./pages/image.html');
    res.end(index);
    return;
  }

  let filename = `.${req.url}`

  if (fs.existsSync(`./pages${req.url}.html`))
    filename = `./pages${req.url}.html`;

  if (!fs.existsSync(filename)) {
    if (fs.existsSync(`./pages${req.url}.html`)) {
      filename = `./pages${req.url}.html`;
    } else {
      res.writeHead(302, {
        location: "/error"
      });
      res.end();
      return;
    }
  }

  let file;
  if (filename.endsWith('.html') || filename.endsWith('.css')) {
    file = fs.readFileSync(filename, 'utf-8');
  } else {
    file = fs.readFileSync(filename);
  }
  res.end(file);
})

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
