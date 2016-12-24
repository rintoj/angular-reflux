import { AddTodoAction, FetchTodosAction, RemoveTodoAction, ToggleTodoAction, ToggleTodoListAction } from '../state/actions';
import { BindAction, Store } from '../state/reflux';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { State } from '../state';
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
            action.todo.id = this.generateId();
            this.todoService.add(action.todo).subscribe(
                todos => observer.next({ todos: todos }),
                error => observer.error(error),
                () => observer.complete()
            );
        }).share();
    }

    @BindAction()
    toggleTodo(state: State, action: ToggleTodoAction): Observable<State> {
        return Observable.create((observer: Observer<State>) => {
            let todo = Object.assign({}, action.todo, {
                completed: !action.todo.completed
            });
            this.todoService.update(todo).subscribe(
                todos => observer.next({ todos: todos }),
                error => observer.error(error),
                () => observer.complete()
            );
        }).share();
    }

    @BindAction()
    removeTodo(state: State, action: RemoveTodoAction): Observable<State> {
        return Observable.create((observer: Observer<State>) => {
            this.todoService.remove(action.todo.id).subscribe(
                todos => observer.next({ todos: todos }),
                error => observer.error(error),
                () => observer.complete()
            );
        }).share();
    }

    @BindAction()
    toggleTodoList(state: State, action: ToggleTodoListAction): Observable<State> {
        return Observable.create((observer: Observer<State>) => {
            observer.next({
                showTodo: !state.showTodo
            });
        }).share();
    }

    private generateId() {
        return btoa(Math.random() + '').substr(4, 6).toLowerCase();
    }
}