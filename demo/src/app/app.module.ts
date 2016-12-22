import { Action, StateStream } from '../../../src/reflux';

import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { INITIAL_STATE } from './state';
import { NgModule } from '@angular/core';
import { STORES } from './store';

// const initialState = Symbol('initial-state');

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule
    ],
    providers: [
        { provide: 'initial-state', useValue: INITIAL_STATE },
        { provide: StateStream, useFactory: Action.stateStreamFactory, deps: ['initial-state'] },
        ...STORES
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
