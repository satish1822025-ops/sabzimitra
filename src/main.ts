// Polyfill 'global' for sockjs-client which expects a Node.js environment.
// Must be before any imports that pull in sockjs.
(window as any).global = window;

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
