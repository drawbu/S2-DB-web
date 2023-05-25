// Libraries
const fs = require('fs');
const express = require('express');
const { Client } = require('pg');

// HTTP Server
const host = 'localhost';
const port = 8080;
const app = express();

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

app.get(/\/mur-images|\/all-images/, async (req, res) => {
  /*
  Displays all the stored images in the table "photos" of the database.
  Shows also the description of the image if it exists.
  */

  const sortByParams = {
    'id': 'photos.id',
    'date': 'photos.date',
    'likes': 'photos.likes',
    'photographe': 'photos.id_photographe',
    'orientation': 'photos.orientation',
  };

  const photos = await client.query(`
    SELECT photos.id, photos.fichier, photos.id_photographe,
           photos.nom, photos.likes, photos.orientation,
           pgr.nom AS nom_photographe, pgr.prenom AS prenom_photographe,
           com.id_photo, com.texte AS description
    FROM photos
    INNER JOIN photographes pgr ON photos.id_photographe = pgr.id
    LEFT JOIN commentaires com ON com.id_photo = photos.id
    ORDER BY ${sortByParams[req.query['sortby']] || sortByParams['id']};
  `);

  res.render('mur', { photos });
});

app.get('/image/:id', async (req, res) => {
  /*
  Displays the image with the primary key {id} on the database, its name,
  its photographer and its description if it exists.
  */

  const imageId = parseInt(req.params.id);

  if (isNaN(imageId)) {
    res.render('error', {
      error: 400,
      message: 'Mauvais format de l\'id',
      description: `L'id "${req.params.id}" n'est pas un nombre.`
    });
    return;
  }

  const queryImage = await client.query(`
    SELECT img.id, img.fichier, img.id_photographe, img.nom,
           pgr.nom as nom_photographe, pgr.prenom as prenom_photographe,
           com.id_photo, com.texte AS description
    FROM photos img
    INNER JOIN photographes pgr ON img.id_photographe = pgr.id
    LEFT JOIN commentaires com ON com.id_photo = img.id
    WHERE img.id = ${imageId};
  `);

  if (queryImage.rows.length === 0) {
    res.render('error', {
      error: 404,
      message: 'Image non trouvée',
      description: `L'image avec l'id "${req.url}" n'a pas été trouvé dans la
        base de données. Le fichier existe peut-être mais n'a pas été ajouté
        à la base de données.`
    });
    return;
  }

  const image = queryImage.rows[0];

  const queryPrev = await client.query(`
    SELECT id, fichier FROM photos
    WHERE id = ${imageId - 1};
  `);
  const prev = (queryPrev.rows.length > 0) ? queryPrev.rows[0] : undefined;

  const queryNext = await client.query(`
    SELECT id, fichier FROM photos
    WHERE id = ${imageId + 1};
  `);
  const next = (queryNext.rows.length > 0) ? queryNext.rows[0] : undefined;

  res.render('image', { image, prev, next });
});

app.get('/j-aime/:id', async (req, res) => {
  const imageId = parseInt(req.params.id);

  if (isNaN(imageId)) {
    res.statusCode = 400;
    res.end();
    return;
  }

  const queryImage = await client.query(`
    SELECT likes FROM photos
    WHERE id = ${imageId};
  `);

  if (queryImage.rows.length === 0) {
    res.statusCode = 404;
    res.end();
    return;
  }

  await client.query(`
    UPDATE photos
    SET likes = ${queryImage.rows[0]['likes'] + 1}
    WHERE id = ${imageId};
  `);

  res.statusCode = 201;
  res.end();
});

app.get('*', (req, res) => {
  /*
  * If the router could not respond to the requests, check if the request
  * correspond to a file following these patterns and redirect:
  * - /public{req.url}.html
  * - /public{req.url}
  * If not, render an 404 error page.
  * */

  if (fs.existsSync('./public' + req.url + '.html')) {
    res.redirect('/public' + req.url + '.html');
    return;
  }

  if (fs.existsSync('./public' + req.url)) {
    res.redirect('/public' + req.url);
    return;
  }

  res.render('error', {
    error: 404,
    message: 'Page non trouvée',
    description: `La page ou fichier "${req.url}" n'a pas été trouvé.
      Elle a surement été renommée ou supprimée et est temporairement
      indisponible.`
  });
});

app.post('/image-description', (req, res) => {
  /*
  * Get values sent from the form on ./public/image-description.html and store
  * them in the descriptions object. Then, create a page to confirm that the
  * description has been added.
  * */

  let data = '';
  req.on('data', (event_data) => {
    data += event_data.toString().replace(/\+/g, ' ');
  });
  req.on('end', async () => {
    const paramValeur = decodeURIComponent(data).split('&');
    const index = paramValeur[0].split('=')[1];
    const texte = paramValeur[1].split('=')[1];

    const queryCommentaire = await client.query(`
      SELECT id_photo
      FROM commentaires
      WHERE id_photo = ${index};
    `);

    if (queryCommentaire.rows.length === 0) {
      await client.query(`
        INSERT INTO commentaires (texte, id_photo)
        VALUES ('${texte}', '${index}');
      `);
    } else {
      await client.query(`
        UPDATE commentaires
        SET texte = '${texte}'
        WHERE id_photo = ${index}
      `);
    }

    res.statusCode = 200;
    res.render('description-ajoutee', {description: texte, index});
  });
});

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
