import { Action, StateStream } from '../../../src/reflux';

import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { INITIAL_STATE } from './state/state';
import { NgModule } from '@angular/core';

const initialState = Symbol('initial-state');

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
        { provide: initialState, useValue: INITIAL_STATE },
        { provide: StateStream, useFactory: Action.stateStreamFactory, deps: [initialState] }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
