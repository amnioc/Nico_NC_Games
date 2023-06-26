# Northcoders House of Games API

## Background

Welcome to this NC Games API, built with the purpose of accessing application data programmatically. The intention here is to mimic the building of a real world backend service (such as reddit) which will provide this information to the front end architecture.

Including examples of POST, PATCH and DELETE methods for the client to interact with the service as you see fit.

View the hosted API here: https://nicos-nc-games.onrender.com/api

The front-end app that uses this API can be found here: https://nicos-nc-games.onrender.com/api
Nico's NC Games Front-end repo can be found here: https://github.com/amnioc/nico-nc-games

## How To Clone and Run This Project Locally

You will have accessed this project via github.

From /amnioc/nico_nc_games, copy the HTTPS link to **clone** the repo locally.

From your terminal, identify an appropriate location and use the command:

- git clone <insert_url_here>

To run this, you will need to install the following dependencies packages:

- **Express**: npm install express
- **PG Format**: npm install pg
- **dotenv**: npm install dotenv

Commands added April '23. Any issues, please refer to related docs online.

The minimum requirements to run this project are:

- Node.js: v19.8.1
- Postgres: 14.7

### Seeding and Testing

1. **Setup** databases before you proceed: npm setup-dbs

2. **Seed** the project by running: npm seed

3. **Test** the project with: npm run test

## Accessing the correct database

To successfully connect to the correct databases locally (development and test), **you must** create your own .env files. A '.env.example' has been provided. The files needed are:

- .env.development
- .env.test

Within these files add: PGDATABASE=database_name

For this repo, the database_name is nc_games and nc_games_test respectively. **Remember to create a .gitignore file!**

## Want to make any local edits? Please fork your own repository!
