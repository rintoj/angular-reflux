import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Todo } from '../state/todo';

@Injectable()
export class TodoService {

    private readonly url: string = '/todo';
    private _todos: Todo[];

    fetch(): Observable<Todo[]> {
        return Observable.create((observer: Observer<Todo[]>) => {
            this._todos = JSON.parse(localStorage.getItem(this.url) || '[]');
            observer.next(this._todos);
            observer.complete();
        });
    }

    add(todo: Todo): Observable<Todo[]> {
        return Observable.create((observer: Observer<Todo>) => {
            this.todos = this.todos.concat([todo]);
            observer.next(this.todos);
            observer.complete();
        });
    }

    remove(id: string): Observable<Todo[]> {
        return Observable.create((observer: Observer<Todo>) => {
            this.todos = this.todos.filter(item => item.id !== id);
            observer.next(this.todos);
            observer.complete();
        });
    }

    update(todo: Todo): Observable<Todo[]> {
        return Observable.create((observer: Observer<Todo>) => {
            if (todo != undefined) {
                this.todos = this.todos.map(item => {
                    if (item.id === todo.id) return todo;
                    return item;
                });
                observer.next(this.todos);
            }
            observer.complete();
        });
    }

    private get todos(): Todo[] {
        return this._todos || [];
    }

    private set todos(todos: Todo[]) {
        this._todos = todos;
        localStorage.setItem(this.url, JSON.stringify(todos));
    }
}