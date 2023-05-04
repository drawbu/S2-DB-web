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

app.get('/image/:id', async (req, res) => {
  /*
  Displays the image with the primary key {id} on the database, its name,
  its photographer and its description if it exists.
  */

  const imageId = parseInt(req.params.id);

  const queryImage = await client.query(`
    SELECT img.id, img.fichier, img.id_photographe, img.nom,
           pgr.nom as nom_photographe, pgr.prenom as prenom_photographe
    FROM photos img
    INNER JOIN photographes pgr ON img.id_photographe = pgr.id
    WHERE img.id = ${imageId};
  `);

  if (queryImage.rows.length === 0) {
    res.render('error', {
      error: 404,
      message: 'Page non trouvée',
      description: `La page ou fichier "${req.url}" n'a pas été trouvé. <br>
        Elle a surement été renommée ou supprimée et est temporairement indisponible.`
    });
    return;
  }

  const image = queryImage.rows[0];
  const description = descriptions[imageId];

  const queryPrev = await client.query(`
    SELECT id, fichier FROM photos
    WHERE id = ${imageId - 1};
  `);
  const prev = (queryPrev.rows.length > 0) ? queryPrev.rows[0] : undefined

  const queryNext = await client.query(`
    SELECT id, fichier FROM photos
    WHERE id = ${imageId + 1};
  `);
  const next = (queryNext.rows.length > 0) ? queryNext.rows[0] : undefined

  res.render('image', { image, description, prev, next })
})

app.get('*', (req, res) => {
  /*
  * If the router could not respond to the requests, check if the request
  * correspond to a file following these patterns and redirect:
  * - /public{req.url}.html
  * - /public{req.url}
  * If not, render an 404 error page.
  * */

  if (fs.existsSync('./public' + req.url + '.html')) {
    res.redirect('/public' + req.url + '.html')
    return;
  }

  if (fs.existsSync('./public' + req.url)) {
    res.redirect('/public' + req.url)
    return;
  }

  res.render('error', {
    error: 404,
    message: 'Page non trouvée',
    description: `La page ou fichier "${req.url}" n'a pas été trouvé. <br>
      Elle a surement été renommée ou supprimée et est temporairement indisponible.`
  });
})

app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});
