import { AddTodoAction } from '../state/action';
import { Component } from '@angular/core';

@Component({
  selector: 'todo-header',
  template: `
    <header id="header">
      <h1>todos</h1>
      <form id="todo-form" (submit)="addTodo()">
        <input id="new-todo" placeholder="What needs to be done?" [(ngModel)]="todoText" name="todo" autofocus="">
      </form>
    </header>
  `
})
export class TodoHeaderComponent {

  todoText: string;

  addTodo() {
    if (this.todoText === undefined || this.todoText.trim() === '') {
      return;
    }

    const addTodoAction = new AddTodoAction({
      title: this.todoText,
      completed: false
    });

    addTodoAction.dispatch().then(() => this.todoText = '');
  }

}