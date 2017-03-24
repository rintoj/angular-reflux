import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';
import { SCREENS } from './screen';
import { SERVICES } from './service';
import { STORES } from './store';

/**
 * `AppModule` is the main entry point into Angular2's bootstrapping process
 */
@NgModule({
  declarations: [
    AppComponent,
    ...SCREENS
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    ...STORES,
    ...SERVICES
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
