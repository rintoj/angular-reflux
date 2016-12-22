import { AddTodoAction, FetchTodosAction } from './state/actions';
import { Component, OnInit } from '@angular/core';

import { Stores } from './store';
import { Todo } from './state/todo';
import { ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
        <form>
            <input [(ngModel)]="todoText" name="title" placeholder="Enter todo here">
            <button type="submit" (click)="addTodo()">+ Add</button>
        </form>
        <todo-list></todo-list>
    `,
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

    protected todoText: string;

    constructor(private stores: Stores) { }

    ngOnInit() {
        new FetchTodosAction().dispatch();
    }

    addTodo() {
        if (this.todoText == undefined || this.todoText.trim() === '') return;
        new AddTodoAction({
            title: this.todoText.trim(),
            completed: false
        }).dispatch();
    }
}
