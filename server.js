// Libraries
const { Client } = require('pg');
const fs = require('fs');
const http = require('http');

// HTTP Server
const host = 'localhost';
const port = 8080;
const server = http.createServer();

// Variables
const descriptions = {};

// Database
const client = new Client({
    database: 'photo',
    port : process.env.UID
});
client.connect()
      .then(() => {
        console.log('Connected to database');
      }).catch((e) => {
        console.log('Error connecting to database', e);
        process.exit(1);
      });


server.on('request', async (req, res) => {
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

      const image_id = parseInt(
        req.url.replace('/image', '')
               .replace('.html', '')
      );

      const queryImage = await client.query(`
        SELECT id, fichier, nom, id_photographe from photos
        WHERE id = ${image_id};
      `);

      if (queryImage.rows.length === 0) {
        res.end(create404ErrorPage(req.url));
        return;
      }

      const image = queryImage.rows[0];

      const queryPhotographer = await client.query(`
        SELECT id, nom, prenom from photographes
        WHERE id = ${image['id_photographe']};
      `);
      const photographer = queryPhotographer.rows[0];

      const description = descriptions[image_id];

      let HTMLPage = `
        <a href="/" class="button">Accueil</a>
        <div class="image">
          <img src="./public/images/${image['fichier']}" alt="${description}">
          <p class="name">${image['nom']}</p>
          <p class="photographer">${photographer['prenom']} ${photographer['nom']}</p>
          ${description? `<p class="description">"${description}"</p>` : ''}
        </div>
        <div class="images-navigator">`;

      const queryPrevious = await client.query(`
        SELECT id, fichier, nom, id_photographe from photos
        WHERE id = ${image_id - 1};
      `);
      if (queryPrevious.rows.length > 0) {
        const img = queryPrevious.rows[0];
        HTMLPage += `
          <a href="/image${img['id']}">
            <img
              src="./public/images/${img['fichier'].split('.')[0]}_small.jpg"
              alt="Image ${img['id'] - 1}"
            >
          </a>`;
      } else {
        HTMLPage += `<div></div>`;
      }

      const queryNext = await client.query(`
        SELECT id, fichier, nom, id_photographe from photos
        WHERE id = ${image_id + 1};
      `);
      if (queryNext.rows.length > 0) {
        const img = queryNext.rows[0];

        HTMLPage += `
          <a href="/image${img['id']}">
            <img
              src="./public/images/${img['fichier'].split('.')[0]}_small.jpg"
              alt="Image ${img['id'] + 1}"
            >
          </a>`;
      } else {
        HTMLPage += `<div></div>`;
      }
      res.end(createPage(HTMLPage));
    } else if (req.url === '/all-images' || req.url === '/mur-images') {
      /*
      /all-images
      /mur-images

      Displays all the stored images in ./public/images as a grid.
      */

      try {
        const queryPhotos = 'SELECT id, fichier, nom, id_photographe from photos';
        const photos = await client.query(queryPhotos);

        const queryPhotographers = 'SELECT id, nom, prenom from photographes';
        const photographersResult = await client.query(queryPhotographers);
        const photographers = {};
        photographersResult.rows.forEach((photographer) => {
            photographers[photographer['id']] = photographer;
        });

        let HTMLPage = `
        <div class="buttons center">
          <a href="/" class="button">accueil</a>
          <a href="/image-description" class="button">Ajouter une description</a>
        </div>
        <div class="images-grid">`;

        photos.rows.forEach((img) => {
          const photographer = photographers[img['id_photographe']];
          const description = descriptions[img['id']];
          HTMLPage += `
            <a href="/image${img['id']}" >
              <img
                src="./public/images/${img['fichier'].split('.')[0]}_small.jpg"
                alt="${img['nom']} par ${photographer['prenom']} ${photographer['nom']}"
              />
              ${description? `<p class="description">"${description}"</p>` : ''}
            </a>
          `;
        });
        HTMLPage += '</div>';

        res.end(createPage(HTMLPage, 'Mur d\'images'));
      } catch (e) {
        console.log(e);
        res.end(e);
      }
    } else {
      /* If file/path does not exist, redirect to /error */
      res.end(create404ErrorPage(req.url));
    }
  } else if (req.method === 'POST') {
    if (req.url === '/image-description') {
      /* Get values sent from the form on ./public/image-description.html */

      let data = '';
      req.on("data", (event_data) => {
        data += event_data.toString().replace(/\+/g, ' ');
      });
      req.on("end", () => {
        console.log({ data });
        const paramValeur = decodeURIComponent(data).split("&");
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

function create404ErrorPage(url) {
  return createErrorPage(
    404,
    `La page ou fichier "${url}" n'a pas été trouvé. <br>
    Elle a surement été renommée ou supprimée et est temporairement indisponible.`
  );
}

function createErrorPage(error, message) {
  const HTMLPage = `
    <div class="error">
      <p class="code">${error}</p>
      <p class="message">Page non trouvé</p>
      <p class="description">
        ${message}
      </p>
      <a href="/" class="button">Accueil</a>
    </div>`;
  return createPage(HTMLPage);
}

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
