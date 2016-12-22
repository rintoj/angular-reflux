import { AddTodoAction, FetchTodosAction, RemoveTodoAction, ToggleTodoAction } from '../state/actions';
import { BindAction, Store } from '../state/reflux';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { State } from '../state/application-state';
import { TodoService } from '../service/todo.service';

@Injectable()
export class TodoStore extends Store {

    constructor(private todoService: TodoService) {
        super();
    }

    @BindAction()
    fetchTodos(state: State, action: FetchTodosAction): Observable<State> {
        return Observable.create((observer: Observer<State>) => {
            this.todoService.fetch().subscribe(
                todos => observer.next({ todos: todos }),
                error => observer.error(error),
                () => observer.complete()
            );
        }).share();
    }

    @BindAction()
    addTodo(state: State, action: AddTodoAction): Observable<State> {
        return Observable.create((observer: Observer<State>) => {

            console.log('add todo', action);

            // calculate next todo
            action.todo.id = this.generateId();
            let todos = state.todos.concat([action.todo]);

            // use service to save
            this.todoService.save(todos).subscribe(
                () => observer.next({ todos: todos }),
                error => observer.error(error),
                () => observer.complete()
            );

        }).share();
    }

    @BindAction()
    toggleTodo(state: State, action: ToggleTodoAction): Observable<State> {
        return Observable.create((observer: Observer<State>) => {

            console.log('toggle todo', action);
            // calculate next todo
            let todos = state.todos.map(todo => {
                if (todo.id === action.todo.id) {
                    return Object.assign({}, todo, {
                        completed: !todo.completed
                    });
                }
                return todo;
            });

            // use service to save
            this.todoService.save(todos).subscribe(
                () => observer.next({ todos: todos }),
                error => observer.error(error),
                () => observer.complete()
            );

        }).share();
    }

    @BindAction()
    removeTodo(state: State, action: RemoveTodoAction): Observable<State> {
        return Observable.create((observer: Observer<State>) => {
            // calculate next todo
            let todos = state.todos.filter(item => item.id !== action.todo.id);

            // use service to save
            this.todoService.save(todos).subscribe(
                () => observer.next({ todos: todos }),
                error => observer.error(error),
                () => observer.complete()
            );
        }).share();
    }

    private generateId() {
        return btoa(Math.random() + '').substr(4, 6).toLowerCase();
    }
}