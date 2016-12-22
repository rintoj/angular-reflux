// import { BindData } from './state/reflux';

import { Component } from '@angular/core';
import { State } from './state/application-state';
import { StateSelector } from './state/reflux';
import { Todo } from './state/todo';

export function BindData(selector: Function) {

    return function (target: any, propertyKey: string) {

        console.info(target, propertyKey);

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
            <li *ngFor="let todo of todos">
                <span class="selector" [class.selected]="todo.completed"></span>
                <span class="text">{{todo.title}}</span>
                <span class="tags">
                    <span class="tag" *ngFor="let tag of item.tags">{{tag}}</span>
                </span>
            </li>
        </ul>
    `
})
export class TodoListComponent {

    // @BindData(state => state.todos)
    protected todo: Todo[];
}