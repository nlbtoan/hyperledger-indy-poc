# Hyperledger Indy - NodeJS

This project for Hyperledger-Indy Demo by using web UI. The frontend is generated with [Angular CLI](https://github.com/angular/angular-cli). The backend is made from scratch. Whole stack in [TypeScript](https://www.typescriptlang.org).

This project uses the [MEAN stack](https://en.wikipedia.org/wiki/MEAN_(software_bundle)):
* [**M**ongoose.js](http://www.mongoosejs.com) ([MongoDB](https://www.mongodb.com)): database
* [**E**xpress.js](http://expressjs.com): backend framework
* [**A**ngular 6](https://angular.io): frontend framework
* [**N**ode.js](https://nodejs.org): runtime environment

Other tools and technologies used:
* [Angular CLI](https://cli.angular.io): frontend scaffolding
* [Bootstrap](http://www.getbootstrap.com): layout and styles
* [Font Awesome](http://fontawesome.io): icons
* [JSON Web Token](https://jwt.io): user authentication
* [Angular 2 JWT](https://github.com/auth0/angular2-jwt/tree/v1.0): JWT helper for Angular
* [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js): password encryption
* [Indy-SDK](https://github.com/hyperledger/indy-sdk): setup hyperledger indy network

## Prerequisites
1. Work with Ubuntu 16.04
2. Setup Development/Runtime Environment: `chmod u+x ./prereqs-ubuntu.sh && ./prereqs-ubuntu.sh`
3. Install dependencies: `npm install`

## Setup local ledger
`npm run create`

## Clean up
`npm run clean`

## Start local ledger
`npm run start`

## Stop local ledger
`npm run stop`

## Run Indy script demo
`npm run demo`

## Run Web Demo
### Install dependencies
1. Install Angular CLI: `npm install -g @angular/cli --unsafe-perm=true --allow-root`
2. From project root folder: `npm install --unsafe-perm=true --allow-root`

### Development mode
`npm run dev`: [concurrently](https://github.com/kimmobrunfeldt/concurrently) execute MongoDB, Angular build, TypeScript compiler and Express server.

A window will automatically open at [localhost:4200](http://localhost:4200). Angular and Express files are being watched. Any change automatically creates a new bundle, restart Express server and reload your browser.

### Production mode
`npm run prod`: run the project with a production bundle and AOT compilation listening at [localhost:3000](http://localhost:3000)