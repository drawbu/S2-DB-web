const fs = require('fs');
const http = require('http');

const host = 'localhost';
const port = 8080;
const server = http.createServer();
const descriptions = {};

server.on('request', (req, res) => {
  if (req.method === "GET") {
    if (req.url === '/') {
      /* / is the index and display the content of ./index/index.html */

      const index = fs.readFileSync('./pages/index.html', 'utf-8');
      res.end(index);
    } else if (fs.existsSync(`.${req.url}`)) {
      /* /bar/foo.css --> ./bar/foo.html if the file exists */

      const filename = `.${req.url}`
      let file;

      if (filename.endsWith('.html') || filename.endsWith('.css')) {
        file = fs.readFileSync(filename, 'utf-8');
      } else {
        file = fs.readFileSync(filename);
      }
      res.end(file);
    } else if (fs.existsSync(`./pages${req.url}`)) {
      /* /hello.html --> ./pages/hello.html if the file exists */

      const file = fs.readFileSync(`./pages${req.url}`, 'utf-8');
      res.end(file);
    } else if (fs.existsSync(`./pages${req.url}.html`)) {
      /* /hello --> ./pages/hello.html if the file exists */

      const file = fs.readFileSync(`./pages${req.url}.html`, 'utf-8');
      res.end(file)
    } else if (req.url.startsWith('/image')) {
      /* /imageN shows a unique pas for the image ./images/imageN.jpg */

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
        HTMLPage += `<div></div>`
      }

      if (fs.existsSync(`./images/image${index + 1}.jpg`)) {
        HTMLPage += `
          <a href="/image${index + 1}">
            <img src="./images/image${index + 1}_small.jpg" alt="Image ${index + 1}">
          </a>`
      } else {
        HTMLPage += `<div></div>`
      }

      HTMLPage += `
            </div>
          </main>
        </body>
        </html>`
      res.end(HTMLPage);
    } else if (req.url === '/all-images') {
      /* /all-images display all the stored images in ./images */

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
              <a href="/image-description.html" class="button">Ajouter une description</a>
            </div>
            <div class="images-container">`

      const images = fs.readdirSync('./images/');
      let j = -1;
      for (let i = 0; i < images.length; i++) {
        if (images[i].endsWith('_small.jpg')) {
          if (j === -1) {
            HTMLPage += `<div>`;
            j = 0;
          }

          const fullImageURL = (
            images[i].replace('.jpg', '')
              .replace('_small', '')
          )

          HTMLPage += `
            <a href="/${fullImageURL}">
              <img src="./images/${images[i]}" alt="An image">
            </a>`;
          j++;
        }

        if (j === 3 || (j !== -1 && i === images.length)) {
          j = -1;
          HTMLPage += `</div>`;
        }
      }

      HTMLPage += `
            </div>
          </main>
        </body>
        </html>`;
      res.end(HTMLPage);
    } else {
      /* If file/path does not exist, redirect to /error */

      res.writeHead(302, {
        location: '/error'
      });
      res.end();
    }
  } else if (req.method === "POST") {
    if (req.url === '/image-description') {
      /* Get values sent from the form on ./pages/image-description.html */

      let donnees = '';
      req.on("data", (data) => {
        donnees += data.toString();
      });
      req.on("end", () => {
        console.log({donnees});
        const paramValeur = donnees.split("&");
        const index = paramValeur[0].split("=")[1];
        const description = paramValeur[1].split("=")[1];
        descriptions[index] = description;
        res.statusCode = 200;

        let HTMLPage = `<!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="../style/global.css">
            <title>Clément Boillot - Error 404</title>
          </head>
          <body>
            <main>
              <h2>Commentaire ajouté!</h2>
              <p>Le commentaire "${description}" a été rajouté à l'image numéro ${index}.</p>        
            </main>
          </body>
          </html>`

        res.end(HTMLPage);
      })
    }
  }
})

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
