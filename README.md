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

All the pages except the index and the `/image-description` page are generated
server side with [ejs](#ejs). This is done to generate the HTML dynamically, and
to avoid having to write the same HTML code over and over again (it also allows
the user to access the website even if JavaScript is disabled).

The router is the default router from express.

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


### EJS

[ejs](https://ejs.co) is a front-end framework with simple syntax and allow to
use plain Javascript and HTML.

It is used in the project to generate the HTML pages dynamically.

All the pages uses the partials `head.ejs` and `footer.ejs` to avoid having to
write the same code over and over again. Its basically just a header with the
correct meta tags and a footer with some text.
