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

      const index = fs.readFileSync('./public/index.html', 'utf-8');
      res.end(index);
    } else if (fs.existsSync(`.${req.url}`)) {
      /* /bar/foo.html --> renders ./bar/foo.html, if the file exists */

      const filename = `.${req.url}`;
      let file;

      if (filename.endsWith('.html') || filename.endsWith('.css')) {
        file = fs.readFileSync(filename, 'utf-8');
      } else {
        file = fs.readFileSync(filename);
      }
      res.end(file);
    } else if (fs.existsSync(`./public${req.url}.html`)) {
      /* /foo_bar --> renders ./public/foo_bar.html, if the file exists */

      const file = fs.readFileSync(`./public${req.url}.html`, 'utf-8');
      res.end(file);
    } else if (req.url.startsWith('/image')) {
      /* /imageN shows a unique page for the image number N */

      const index = parseInt(
        req.url.replace('/image', '')
               .replace('.html', '')
      );

      const description = (descriptions[index]) ? descriptions[index] : `Image ${index}`;

      let HTMLPage = `
        <a href="/" class="button">Accueil</a>
        <div class="image">
          <img src="./public/images/image${index}.jpg" alt="${description}">
          <p class="description">${description}</p>
        </div>
        <div class="images-navigator">`;

      if (fs.existsSync(`./public/images/image${index - 1}.jpg`)) {
        HTMLPage += `
          <a href="/image${index - 1}">
            <img src="./public/images/image${index - 1}_small.jpg" alt="Image ${index - 1}">
          </a>`;
      } else {
        HTMLPage += `<div></div>`;
      }

      if (fs.existsSync(`./public/images/image${index + 1}.jpg`)) {
        HTMLPage += `
          <a href="/image${index + 1}">
            <img src="./public/images/image${index + 1}_small.jpg" alt="Image ${index + 1}">
          </a>`;
      } else {
        HTMLPage += `<div></div>`;
      }
      res.end(createPage(HTMLPage));
    } else if (req.url === '/all-images') {
      /* /all-images display all the stored images in ./public/images */

      let HTMLPage = `
        <div class="buttons center">
          <a href="/" class="button">accueil</a>
          <a href="/image-description" class="button">Ajouter une description</a>
        </div>
        <div class="images-container">`;

      let indexInRow = 0;
      for (let i = 1; fs.existsSync(`./public/images/image${i}.jpg`); i++) {
        const image = {
          normal: `./public/images/image${i}.jpg`,
          small: `./public/images/image${i}_small.jpg`,
          pageUrl: `/image${i}`,
          desc: descriptions[i],
          name: `Image ${i}`,
        };

        if (indexInRow === 0) {
          HTMLPage += `<div>`;
        }

        HTMLPage += `
          <span>
            <a href="${image.pageUrl}">
              <img src="${image.small}" alt="${(image.desc) ? image.desc : image.name}">
            </a>`;
        if (image.desc) {
          HTMLPage += `<p>${image.desc}</p>`;
        }
        HTMLPage += `</span>`;

        indexInRow++;
        if (indexInRow === 3 || !fs.existsSync(`./public/images/image${i + 1}.jpg`)) {
          indexInRow = 0;
          HTMLPage += `</div>`;
        }
      }
      res.end(createPage(HTMLPage, 'Mur d\'images'));
    } else {
      /* If file/path does not exist, redirect to /error */

      const HTMLPage = `
        <div class="error">
          <p class="code">404</p>
          <p class="message">Page non trouvé</p>
          <p class="description">
            La page ou fichier "${req.url}" n'a pas été trouvé. <br>
            Elle a surement été renommée ou supprimée et est temporairement indisponible.
          </p>
          <a href="/" class="button">Accueil</a>
        </div>`;
      res.end(createPage(HTMLPage));
    }
  } else if (req.method === 'POST') {
    if (req.url === '/image-description') {
      /* Get values sent from the form on ./public/image-description.html */

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

        let HTMLPage = `
          <div class="buttons center">
            <a href="/" class="button">Accueil</a>
            <a href="/all-images" class="button">Mur d'images</a>
          </div>
          <p>Le commentaire "${description}" a été rajouté à l'image numéro ${index}.</p>`
        res.end(createPage(HTMLPage, 'Description ajoutée'));
      })
    }
  }
})

function createPage(content, title) {
  return `<!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="./public/style.css">
      <title>Clément Boillot - ${title}</title>
    </head>
    <body>
      <div id="app">
        <main>
          ${title? `<h1>${title}</h1>` : ''}
          
         ${content}
         
        </main>
        <footer>
          <p>
            Site créé par <a href="https://github.com/drawbu">Clément Boillot</a> 
            dans le cadre du cours de “Développement Web et bases de données” à 
            <a href="https://www.u-bordeaux.fr">l'Université de Bordeaux</a>.
          </p>
        </footer>
      </div>
    </body>
    </html>`;
}

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
