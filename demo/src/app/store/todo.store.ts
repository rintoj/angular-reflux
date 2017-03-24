import {
  AddTodoAction,
  ClearCompletedTodosAction,
  FetchTodosAction,
  MarkAllTodosAction,
  RemoveTodoAction,
  SetFilterAction,
  ToggleTodoAction,
  UpdateTodoAction,
} from '../state/action';
import { BindAction, Store } from 'angular-reflux';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { State } from '../state';
import { TodoService } from '../service/todo.service';

@Injectable()
export class TodoStore extends Store {

  constructor(private service: TodoService) {
    super();
  }

  @BindAction()
  fetchTodos(state: State, action: FetchTodosAction): Observable<State> {
    return Observable.create((observer: Observer<State>) => {
      this.service.fetch().subscribe(
        todos => observer.next({ todos: todos }),
        error => observer.error(error),
        () => observer.complete()
      );
    }).share();
  }

  @BindAction()
  addTodo(state: State, action: AddTodoAction): Observable<State> {
    return Observable.create((observer: Observer<State>) => {
      this.service.add(action.todo).subscribe(
        todos => observer.next({ todos: todos }),
        error => observer.error(error),
        () => observer.complete()
      );
    }).share();
  }

  @BindAction()
  removeTodo(state: State, action: RemoveTodoAction): Observable<State> {
    return Observable.create((observer: Observer<State>) => {
      this.service.remove(action.id).subscribe(
        todos => observer.next({ todos: todos }),
        error => observer.error(error),
        () => observer.complete()
      );
    }).share();
  }

  @BindAction()
  updateTodo(state: State, action: UpdateTodoAction): Observable<State> {
    return Observable.create((observer: Observer<State>) => {
      this.service.update(action.todo).subscribe(
        todos => observer.next({ todos: todos }),
        error => observer.error(error),
        () => observer.complete()
      );
    }).share();
  }

  @BindAction()
  toggleTodo(state: State, action: ToggleTodoAction): Observable<State> {
    return Observable.create((observer: Observer<State>) => {
      this.service.toggle(action.id).subscribe(
        todos => observer.next({ todos: todos }),
        error => observer.error(error),
        () => observer.complete()
      );
    }).share();
  }

  @BindAction()
  clearCompletedTodos(state: State, action: ClearCompletedTodosAction): Observable<State> {
    return Observable.create((observer: Observer<State>) => {
      this.service.clearCompleted().subscribe(
        todos => observer.next({ todos: todos }),
        error => observer.error(error),
        () => observer.complete()
      );
    }).share();
  }

  @BindAction()
  markAllTodos(state: State, action: MarkAllTodosAction): Observable<State> {
    return Observable.create((observer: Observer<State>) => {
      this.service.markAll(action.complete).subscribe(
        todos => observer.next({ todos: todos }),
        error => observer.error(error),
        () => observer.complete()
      );
    }).share();
  }

  @BindAction()
  setFilter(state: State, action: SetFilterAction): Observable<State> {
    return Observable.create((observer: Observer<State>) => {
      observer.next({
        filter: action.filter
      });
      observer.complete();
    }).share();
  }

}