# Bases de données et programmation web


## Introduction

This is a project for the course "Bases de données et programmation web" at
[l'Université de Bordeaux](https://www.u-bordeaux.fr/). The goal of this project
is to create a website from scratch using Node.js and PostgreSQL.


## Installation

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [PostgreSQL](https://www.postgresql.org/)


### Installation

1. Install the node dependencies with
```shell
npm install
```
2. Export the environment variables for the database (this works on Linux and
macOS, if you're on Windows, good luck)
```shell
export PGHOST=/tmp/$LOGNAME
export PGPORT=$UID
```
**OPTIONAL:** On the CREMI computer (Linux boot), more steps are required to
connect to the database. (This needs to be done only once)
```shell
/usr/lib/postgresql/11/bin/pg_ctl  -D /tmp/$LOGNAME/ -l /tmp/$LOGNAME/startup.log start
```
3. Create the database
```shell
psql -d postgres
```
On the postgres prompt:
```postgresql
\i photo.sql
```


## Usage

### Starting the server

To start the server, run
```shell
npm run start
```


## Documentation

### Server Side Rendering

All the pages except the index page are generated server side. This is done to
generate the HTML dynamically, and to avoid having to write the same HTML code
over and over again (it also allows the user to access the website even if
JavaScript is disabled).

The router uses a simple if else statement to determine which page to render.

Example:
```js
if (req.url === '/') {
  // Render the index page
} else if (fs.existsSync(`.${req.url}`)) {
  // Render the static file
} else if (req.url === '/all-images') {
  // Render the register page
} else if (req.url.startsWith('/image')) {
  // Render the profile page
} else {
  // Render the 404 page
}
```

All Server Side Rendered pages are generated using the `createPage` function to
avoid repetition of the header and the footer all over the pages.

Example:
```js
const user = {
  name: 'John Doe',
  age: 42,
};
const page = `<p>Hello ${user.name}.<p>`;
// This is the content of the page

const HTML = createPage(page, 'my cool website');
// This creates a page with the header and the footer.
// "my cool website" is the title of the page and will be displayed in the tab,
// and in a <h1> tag on top of the page.
// This will also create a <head> and a <body> tag, import the CSS files, etc.

res.end(HTML);
// This sends the HTML to the client.
```

### Database

The database is a PostgreSQL database. It contains 3 tables: `commentaires`,
`orientations`, `photographes` and `photos`.


### Routes

- `/` (GET): The index page
- `/{file}` (GET): The static file on *./{file}*
- `/{html_document}` (GET): The HTML document on *./static/{html_document}.html*
- `/all-images` or `/mur-images` (GET): The register page
- `/image{id}` (GET): The image page
- `{invalid}` (GET): The 404 page


- `/image-description` (POST): The route to add a description to an image
