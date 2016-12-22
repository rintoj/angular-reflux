import { AddTodoAction, RemoveTodoAction } from '../state/actions';

import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { State } from '../state';

function BindAction(ActionClass?: any) {

    // console.log('before', actionClass);

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        new ActionClass().subscribe(target[propertyKey], target);
    };
}

@Injectable()
export class TodoStore {

    constructor(private http: Http) {
        console.log(http);
    }

    @BindAction(AddTodoAction)
    addTodo(state: State, action: AddTodoAction): Observable<State> {
        debugger;
        return Observable.create((observer: Observer<State>) => {
            observer.next({
                todos: state.todos.concat([action.todo])
            });
            observer.complete();
        }).share();
    }

    @BindAction(RemoveTodoAction)
    removeTodo(state: State, action: RemoveTodoAction): Observable<State> {
        debugger;
        return Observable.create((observer: Observer<State>) => {
            observer.next({
                todos: state.todos.concat([action.todo])
            });
            observer.complete();
        }).share();
    }
}