import { AddTodo } from '../state/actions';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { State } from '../state/state';

function BindAction() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        // descriptor.enumerable = value;
        console.warn(target);
    };
}

@Injectable()
export class TodoStore {

    @BindAction()
    addTodo(state: State, action: AddTodo): Observable<State> {
        return Observable.create((observer: Observer<State>) => {
            observer.next({
                todos: state.todos.concat([action.todo])
            });
            observer.complete();
        }).share();
    }
}