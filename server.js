// Libraries
const fs = require("fs");
const express = require('express');
const { Client } = require('pg');

// HTTP Server
const host = 'localhost';
const port = 8080;
const app = express();

// Variables
const descriptions = {};

// Database
const client = new Client({
    database: 'photo',
    port : process.env.UID
});

//Connection à la base de données
client.connect()
      .then(() => {
        console.log('Connected to database');
      }).catch((e) => {
        console.log('Error connecting to database', e);
        process.exit(1);
      });

// Routes

// All requests starting with /public return the matching file in ./public
app.use('/public', express.static('./public'));
// Init ejs
app.set('view engine', 'ejs');
app.set('views', './ejs-templates');

app.get('/', (_, res) => {
    res.redirect('/public/index.html');
});

app.get('/index', (_, res) => {
    res.redirect('/public/index.html');
});

app.get('/index.html', (_, res) => {
    res.redirect('/public/index.html');
});

app.get('/all-images', (_, res) => {
    res.redirect('/mur-images');
});

app.get('/mur-images', async (req, res) => {
  /*
  Displays all the stored images in the table "photos" of the database.
  Shows also the description of the image if it exists.
  */

  const photos = await client.query(
    'SELECT id, fichier, nom, id_photographe from photos'
  );

  res.render('mur', { photos, descriptions});
});

app.get('/image:id', async (req, res) => {
  /*
  Displays the image with the primary key {id} on the database, its name,
  its photographer and its description if it exists.
  */

  const image_id = parseInt(req.params.id);

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
      ${description ? `<p class="description">"${description}"</p>` : ''}
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
})

function createPage(content, title = undefined, head = undefined) {
  return `<!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="./public/style.css">
      <title>Clément Boillot - ${title}</title>
      ${head? head : ''}
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
    'Page non trouvée',
    `La page ou fichier "${url}" n'a pas été trouvé. <br>
    Elle a surement été renommée ou supprimée et est temporairement indisponible.`
  );
}

function createErrorPage(error, message, description) {
  const HTMLPage = `
    <div class="error">
      <p class="code">${error ? error : 500}</p>
      <p class="message">${message ? message : 'Une erreur est survenue'}</p>
      ${description ? ('<p class="description">' + description + '</p>') : ''}
      <a href="/" class="button">Accueil</a>
    </div>`;
  return createPage(HTMLPage);
}

app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});
