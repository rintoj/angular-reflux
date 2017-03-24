import { Component, Input, OnChanges } from '@angular/core';
import { MarkAllTodosAction, RemoveTodoAction, ToggleTodoAction } from '../state/action';
import { Todo, TodoFilter } from '../state/todo';

@Component({
    selector: 'todo-list',
    template: `
        <input id="toggle-all" type="checkbox" [checked]="allChecked" (click)="markAll(!allChecked)">
        <div id="todo-list">
            <li  *ngFor="let todo of filteredTodos">
                <div class="view">
                    <input class="toggle" type="checkbox" [checked]="todo.completed" (click)="toggleTodo(todo)">
                    <label>{{todo.title}}</label>
                    <button class="destroy" (click)="removeTodo($event, todo)"></button>
                </div>
            </li>
        </div>
    `
})
export class TodoListComponent implements OnChanges {

    @Input()
    protected todos: Todo[];

    @Input()
    protected filter: TodoFilter;

    protected filteredTodos: Todo[];
    protected allChecked: boolean;

    ngOnChanges() {
        this.filteredTodos = this.filterTodos(this.todos, this.filter);
        this.allChecked = this.filteredTodos.filter(item => item.completed).length === this.filteredTodos.length;
    }

    markAll(complete: boolean) {
        new MarkAllTodosAction(complete).dispatch();
    }

    toggleTodo(todo: Todo) {
        new ToggleTodoAction(todo.id).dispatch();
    }

    removeTodo(event, todo: Todo) {
        event.stopPropagation();
        new RemoveTodoAction(todo.id).dispatch();
    }

    private filterTodos(todos: Todo[], filter: TodoFilter) {
        return (todos || []).filter(item => {
            if (filter == undefined || filter === TodoFilter.ALL) return true;
            if (filter === TodoFilter.COMPLETED) return item.completed;
            if (filter === TodoFilter.ACTIVE) return !item.completed;
        });
    }
}