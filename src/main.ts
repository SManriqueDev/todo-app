import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { IonicStorageModule } from '@ionic/storage-angular';
import { importProvidersFrom, inject, provideAppInitializer } from '@angular/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { FirebaseConfigService } from './app/core/services';

function initializeRemoteConfig(): Promise<void> {
  return inject(FirebaseConfigService).init();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(IonicStorageModule.forRoot()),
    provideAppInitializer(initializeRemoteConfig),
  ],
});
