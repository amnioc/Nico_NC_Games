# Northcoders House of Games API

## Background

Welcome to this API, built with the purpose of accessing application data programmatically. The intention here is to mimic the building of a real world backend service (such as reddit) which will provide this information to the front end architecture.

## How To Clone and Run This Project Locally

You will have accessed this project via github.

From /amnioc/nico_nc_games, copy the HTTPS link to **clone** the repo locally.

To run this, you will need to install the following packages: - Express - PG Format - dotenv

## Accessing the correct database

To successfully connect to the correct databases locally (development and test), **you must** create your own .env files. A '.env.example' has been provided. The files needed are:

- .env.development
- .env.test

Within these files add: PGDATABASE=database_name

For this repo, the database_name is nc_games and nc_games_test respectively.

## Want to make any local edits? Please make your own copy!
