import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';
import { SERVICES } from './service';
import { STORES } from './store';
import { TodoListComponent } from './todo-list.component';

@NgModule({
    declarations: [
        AppComponent,
        TodoListComponent
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
