import { Injectable } from '@angular/core';
import { StateStream } from '../state/reflux';
import { TodoStore } from './todo.store';

@Injectable()
export class Stores {
    constructor(
        private stateStream: StateStream<any>,
        private todoStore: TodoStore
    ) { }
}

export const STORES = [
    Stores,
    TodoStore
];