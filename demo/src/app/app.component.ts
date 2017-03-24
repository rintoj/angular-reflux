import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Todo, TodoFilter } from './state/todo';

import { BindData } from 'angular-reflux';
import { FetchTodosAction } from './state/action';
import { State } from './state';
import { Stores } from './store';

@Component({
  selector: 'todo-app',
  template: `
    <div id="todoapp">
      <todo-header></todo-header>
      <todo-list [todos]="todos" [filter]="filter"></todo-list>
      <todo-footer [todos]="todos" [filter]="filter"></todo-footer>
    </div>
    `,
  styles: [
    require('./app.component.scss')
  ],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

  @BindData((state: State) => state.todos)
  protected todos: Todo[];

  @BindData((state: State) => state.filter)
  protected filter: TodoFilter;

  constructor(public stores: Stores) { }

  ngOnInit() {
    new FetchTodosAction().dispatch();
  }
}