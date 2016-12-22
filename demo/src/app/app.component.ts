import { AddTodoAction, RemoveTodoAction } from './state/actions';

import { Component } from '@angular/core';
import { Stores } from './store';
import { Todo } from './state/todo';
import { ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
        <input [(ngModel)]="todoText" placeholder="Enter todo here">
        <button (click)="addTodo()">Add Todo</button>
        <button (click)="removeTodo()">Remove Todo</button>
    `,
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent {

    protected todoText: string;
    protected todo: Todo;

    constructor(private stores: Stores) { }

    addTodo() {
        new AddTodoAction({
            title: 'Sample Task',
            completed: false
        }).dispatch();
    }

    removeTodo() {
        new RemoveTodoAction({
            title: 'Sample Task',
            completed: false
        }).dispatch();
    }

}
