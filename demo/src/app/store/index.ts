import { Injectable } from '@angular/core';
import { TodoStore } from './todo.store';

@Injectable()
export class Stores {
  constructor(
    todoStore: TodoStore
  ) {
    // empty block
  }
}

export const STORES = [
  Stores,
  TodoStore
];