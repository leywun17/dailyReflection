import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { HttpClientModule } from '@angular/common/http';
import { BaseChartDirective  } from 'ng2-charts';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    // estrategia de cache de páginas Ionic
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // core de Ionic
    provideIonicAngular(),
    // importamos los módulos NgModules tradicionales
    importProvidersFrom(
      HttpClientModule,
      BaseChartDirective   // << importa el módulo aquí
    ),
    // enrutamiento con pre-carga de todos los módulos
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
