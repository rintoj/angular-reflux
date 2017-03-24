import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Todo, TodoFilter } from './state/todo';

import { BindData } from 'angular-reflux';
import { FetchTodosAction } from './state/action';
import { State } from './state';
import { Stores } from './store';

export function selectTodos(state: State) {
  return state.todos;
}

export function selectFilter(state: State) {
  return state.filter;
}

@Component({
  selector: 'todo-app',
  template: `
    <div id="todoapp">
      <todo-header></todo-header>
      <todo-list [todos]="todos" [filter]="filter"></todo-list>
      <todo-footer [todos]="todos" [filter]="filter"></todo-footer>
    </div>
    `,
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

  @BindData(selectTodos)
  todos: Todo[];

  @BindData(selectFilter)
  filter: TodoFilter;

  constructor(public stores: Stores) { }

  ngOnInit() {
    new FetchTodosAction().dispatch();
  }
}