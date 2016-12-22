import { Action, StateStream } from '../../../src/reflux';

import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';
import { SERVICES } from './service';
import { STORES } from './store';
import { TodoListComponent } from './todo-list.component';

// import { INITIAL_STATE } from './state/application-state';
// const initialState = Symbol('initial-state');

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
        { provide: 'initial-state', useValue: { todos: [] } },
        { provide: StateStream, useFactory: Action.stateStreamFactory, deps: ['initial-state'] },
        ...STORES,
        ...SERVICES
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
