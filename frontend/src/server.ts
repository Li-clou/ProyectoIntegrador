import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

// Railway pone tu app detrás de un proxy inverso que agrega cabeceras
// X-Forwarded-* con el dominio/protocolo real de la petición. Angular v22
// necesita DOS cosas para aceptar esto:
//   1. trustProxyHeaders -> confiar en esas cabeceras del proxy.
//   2. allowedHosts -> lista explícita de los hostnames válidos de tu app.
// Sin el 2, Angular rechaza la petición con 400 Bad Request aunque el
// header sea confiable. Más info:
// https://angular.dev/best-practices/security#configuring-trusted-proxy-headers
// https://angular.dev/best-practices/security#preventing-server-side-request-forgery-ssrf
const angularApp = new AngularNodeAppEngine({
  trustProxyHeaders: ['x-forwarded-host', 'x-forwarded-proto', 'x-forwarded-for'],
  allowedHosts: ['kunibo.up.railway.app'],
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);