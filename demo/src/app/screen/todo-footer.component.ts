import { ClearCompletedTodosAction, SetFilterAction } from '../state/action';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Todo, TodoFilter } from '../state/todo';

@Component({
    selector: 'todo-footer',
    template: `
        <footer id="footer">
            <span id="todo-count"><strong>{{leftCount}}</strong>
                {{leftCount > 1 ? 'items' : 'item' }} left
            </span>
            <ul id="filters">
                <li>
                    <a href="#"
                        [class.selected]="filterText == undefined || filterText === 'ALL'"
                        (click)="setFilter('ALL')">All</a>
                </li>
                <li>
                    <a href="#"
                        [class.selected]="filterText === 'ACTIVE'"
                        (click)="setFilter('ACTIVE')">Active</a>
                </li>
                <li>
                    <a href="#"
                        [class.selected]="filterText === 'COMPLETED'"
                        (click)="setFilter('COMPLETED')">Completed</a>
                </li>
            </ul>
            <button id="clear-completed" (click)="clearCompletedTodos()" *ngIf="completedCount > 0">Clear completed</button>
        </footer>
    `
})
export class TodoFooterComponent implements OnChanges {

    @Input()
    protected todos: Todo[];

    @Input()
    protected filter: TodoFilter;

    protected filterText: string;
    protected leftCount: number;
    protected completedCount: number;

    ngOnChanges(changes: SimpleChanges) {
        if (this.todos == undefined) return;
        this.completedCount = this.todos.filter(item => item.completed).length;
        this.leftCount = this.todos.length - this.completedCount;
        this.filterText = TodoFilter[this.filter];
    }

    clearCompletedTodos() {
        new ClearCompletedTodosAction().dispatch();
    }

    setFilter(filter: string) {
        new SetFilterAction(TodoFilter[filter]).dispatch();
    }

}