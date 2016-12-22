import { Injectable } from '@angular/core';
import { TodoStore } from './todo.store';

@Injectable()
export class Stores {
    constructor(
        private todoStore: TodoStore
    ) { }
}

export const STORES = [
    Stores,
    TodoStore
];