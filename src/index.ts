import express from "express";
import * as bodyParser from 'body-parser';
const app = express();
const port = 8080; // default port to listen


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
// define a route handler for the default home page

import appRoutes from './routes/app.routes';
app.use('/', appRoutes());
app.get( "/", ( req, res ) => {
    res.send( "Hello world!" );
} );

// start the Express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );