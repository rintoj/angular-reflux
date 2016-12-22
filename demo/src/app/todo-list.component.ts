// import { BindData } from './state/reflux';

import { RemoveTodoAction, ToggleTodoAction } from './state/actions';

import { Component } from '@angular/core';
import { STATE_STREAM } from './state/reflux';
import { State } from './state/application-state';
import { Todo } from './state/todo';

export function BindData(selector: any) {

    return function (target: any, propertyKey: string) {

        console.info(STATE_STREAM, target, propertyKey);

        STATE_STREAM.select(selector).subscribe(data => target[propertyKey] = data);

        // let metadata = Reflect.getMetadata('design:paramtypes', target, propertyKey);
        // if (metadata.length < 2) throw new Error('BindAction: function must have two arguments!');
        // target.actions = target.actions || (target.actions = {});
        // target.actions[propertyKey] = metadata[1];

        // return {
        //     get: function () {
        //         return [];
        //     }
        // };
        // return descriptor;
    };
}

@Component({
    selector: 'todo-list',
    template: `
        <ul>
            <li *ngFor="let todo of todos" [class.completed]="todo?.completed" (click)="toggleTodo(todo)">
                <span class="selector"></span>
                <span class="text">{{todo?.title}}</span>
                <span class="tags">
                    <span class="tag" *ngFor="let tag of todo?.tags">{{tag}}</span>
                </span>
                <button (click)="removeTodo(todo)">X Remove</button>
            </li>
        </ul>
    `,
    styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent {

    @BindData(state => state.todos)
    protected todos: Todo[];

    toggleTodo(todo: Todo) {
        new ToggleTodoAction(todo).dispatch();
    }

    removeTodo(todo: Todo) {
        new RemoveTodoAction(todo).dispatch();
    }
}