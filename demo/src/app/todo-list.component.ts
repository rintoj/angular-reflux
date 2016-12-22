// import { BindData } from './state/reflux';

import { RemoveTodoAction, ToggleTodoAction } from './state/actions';

import { BindData } from './state/reflux';
import { Component } from '@angular/core';
import { State } from './state/application-state';
import { Todo } from './state/todo';

@Component({
    selector: 'todo-list',
    template: `
        <ul>
            <li *ngFor="let todo of todos" [class.completed]="todo?.completed" (click)="toggleTodo(todo)">
                <span class="text">{{todo?.title}}</span>
                <button (click)="removeTodo(todo)">Remove</button>
            </li>
        </ul>
    `,
    styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent {

    @BindData((state: State) => state.todos)
    protected todos: Todo[];

    toggleTodo(todo: Todo) {
        new ToggleTodoAction(todo).dispatch();
    }

    removeTodo(todo: Todo) {
        new RemoveTodoAction(todo).dispatch();
    }
}