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

  if (req.url.startsWith('/image') && !req.url.startsWith('/images/')) {
    const index = parseInt(
      req.url.replace('/image', '')
             .replace('.html', '')
    )

    let HTMLPage = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="./style/global.css">
  <title>Clément Boillot - TP2</title>
</head>
<body>
  <main>
    <a href="/" class="button">Accueil</a>
    <div class="image">
      <img src="./images/image${index}.jpg" alt="Image ${index}">
      <p class="description">Image ${index}</p>
    </div>
    <div class="images-navigator">`

    if (fs.existsSync(`./images/image${index - 1}.jpg`)) {
      HTMLPage += `
      <a href="/image${index - 1}">
        <img src="./images/image${index - 1}_small.jpg" alt="Image ${index - 1}">
      </a>`
    } else {
      HTMLPage += `
      <div></div>`
    }

    if (fs.existsSync(`./images/image${index + 1}.jpg`)) {
      HTMLPage += `
      <a href="/image${index + 1}">
        <img src="./images/image${index + 1}_small.jpg" alt="Image ${index + 1}">
      </a>`
    } else {
      HTMLPage += `
      <div></div>`
    }

    HTMLPage += `
    </div>
  </main>
</body>
</html>`
    res.end(HTMLPage);
    return;
  }

  if (req.url === '/all-images') {
    let HTMLPage = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="./style/global.css">
  <title>Clément Boillot - All Images</title>
</head>
<body>
  <main>
    <h1>Mur d'images</h1>
    <div class="buttons">
      <a href="/" class="button">accueil</a>
    </div>
    <div class="images-container">`

    const images = fs.readdirSync('./images/')
    let j = -1;
    for (let i = 0; i < images.length; i++) {
      if (images[i].endsWith('_small.jpg')) {
        if (j === -1) {
          HTMLPage += `<div>`
          j = 0;
        }
        HTMLPage += `<img src="./images/${images[i]}" alt="An image">`;
        j++;
      }

      if (j === 3 || (j !== -1 && i === images.length)) {
        j = -1;
        HTMLPage += `</div>`
      }
    }

    HTMLPage += `
    </div>
  </main>
</body>
</html>`;
    res.end(HTMLPage);
    return;
  }

  let filename = `.${req.url}`

  /* e.g: /error == /pages/error.html */
  if (fs.existsSync(`./pages${req.url}.html`)) {
    filename = `./pages${req.url}.html`;
  }

  /* If file/path does not exist, redirect to /error */
  if (!fs.existsSync(filename)) {
    res.writeHead(302, {
      location: '/error'
    });
    res.end();
    return;
  }

  /* Open the file with the corresponding format */
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
