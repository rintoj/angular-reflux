import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Todo } from '../state/todo';

@Injectable()
export class TodoService {

    private readonly id: string = 'todos';

    save(todos: Todo[]): Observable<any> {
        return Observable.create((observer: Observer<any>) => {
            localStorage.setItem(this.id, JSON.stringify(todos));
            observer.complete();
        });
    }

    fetch(): Observable<Todo[]> {
        return Observable.create((observer: Observer<Todo[]>) => {
            observer.next(JSON.parse(localStorage.getItem(this.id) || '[]'));
            observer.complete();
        });
    }
}