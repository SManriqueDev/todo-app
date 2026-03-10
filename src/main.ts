import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { IonicStorageModule } from '@ionic/storage-angular';
import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { FirebaseConfigService } from './app/core/services';

function initializeRemoteConfig(firebaseConfigService: FirebaseConfigService): () => Promise<void> {
  return () => firebaseConfigService.init();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(IonicStorageModule.forRoot()),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeRemoteConfig,
      deps: [FirebaseConfigService],
      multi: true,
    },
  ],
});
