
# angular-reflux
This module will help you implement a unidirectional data flow (Flux architecture) for an Angular 2 (or above) application in an elegant way. This is inspired by [refluxjs](https://github.com/reflux/refluxjs) and [redux](http://redux.js.org/).

## Update (24 Mar 2017)

Since version `1.0.0`, this module is compatible with Angular's Ahead-of-Time Compilation (AOT). I have updated all examples to reflect this change. If you are here for the first time, never mind, continue reading. But if you have had used this module before and you want to refactor your code to make it AOT compatible check [Making Your Code AOT Compatible](#making-your-code-aot-compatible) section.

## About

Flux is an architecture for unidirectional data flow. By forcing the data to flow in a single direction, Flux makes it easy to reason *how data-changes will affect the application* depending on what actions have been issued. The components themselves may only update  application-wide data by executing an action to avoid double maintenance nightmares.

Inspired by redux and refluxjs, I wrote this library to help you implement a unidirectional data flow in 5 simple steps.

## Install

```
npm install angular-reflux seamless-immutable --save
```

## 5 Simple Steps

### 1. Define State
To get the best out of TypeScript, declare an interface that defines the structure of the application-state.

```ts
export interface Todo {
  id?: string;
  title?: string;
  completed?: boolean;
}

export interface State {
  todos?: Todo[];
  selectedTodo?: Todo;
}
```

### 2. Define Action
Define actions as classes with the necessary arguments passed on to the constructor. This way we will benefit from the type checking; never again we will miss-spell an action, miss a required parameter or pass a wrong parameter. Remember to extend the action from `Action` class. This makes your action listenable and dispatch-able.

```ts
import { Action } from 'angular-reflux';

export class AddTodoAction extends Action {
  constructor(public todo: Todo) { super(); }
}
```

### 3. Create Store & Bind Action
Use `@BindAction` decorator to bind a reducer function with an Action. The second parameter to the reducer function (`addTodo`) is an action (of type `AddTodoAction`); `@BindAction` uses this information to bind the correct action. Also remember to extend this class from `Store`.

```ts
import { Injectable } from '@angular/core';
import { BindAction, Store } from 'angular-reflux';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

@Injectable()
export class TodoStore extends Store {

  @BindAction()
  addTodo(state: State, action: AddTodoAction): Observable<State> {
    return Observable.create((observer: Observer<State>) => {
      observer.next({ todos: state.todos.concat([action.todo]) });
      observer.complete();
    });
  }
}
```

Did you notice `@Injectable()`? Well, stores are injectable modules and uses Angular's dependency injection to instantiate. So take care of adding store to `providers` and to inject into `app.component`. Read [Organizing Stores](#organizing-stores) to understand more.

### 4. Dispatch Action

No singleton dispatcher! Instead this module lets every action act as dispatcher by itself. One less dependency to define, inject and maintain.

```ts
new AddTodoAction({ id: 'sd2wde', title: 'Sample task' }).dispatch();
```

### 5. Consume Data

Use `@BindData` decorator and a selector function (parameter to the decorator) to get updates from application state. The property gets updated only when the value, returned by the selector function, changes from previous state to the current state. Additionally, just like a map function, you could map the data to another value as you choose.

We may, at times need to derive additional properties from the data, sometimes using complex calculations. Therefore `@BindData` can be used with functions as well.

```ts
import { BindData, DataObserver } from 'angular-reflux';

export function selectTodos(state: State) {
  return state.todos;
}

export function computeHasTodos(state: State) {
  return state.todos && state.todos.length > 0;
}

@Component({
    ....
})
export class TodoListComponent extends DataObserver {

  // mapping a direct value from state
  @BindData(selectTodos)
  protected todos: Todo[];

  // mapping a different value from state
  @BindData(computeHasTodos)
  protected hasTodos: boolean;

  // works with functions to allow complex calculations
  @BindData(selectTodos)
  protected todosDidChange(todos: Todo[]) {
    // your calculations
  }
}
```

## Making Your Code AOT Compatible

The selector function to `@BindData()` decorator must be an exported standalone function, to avoid the below AOT error:

```bash
ERROR in Error encountered resolving symbol values statically. Function calls are not supported. Consider replacing the function or lambda with a reference to an exported function
```

Therefore refactor your code from:

```ts
@Component({
  ....
})
export class TodoComponent {

  @BindData((state: State) => state.todos)
  todos: Todo[]
}
```

to:

```ts
export function selectTodos(state: State) {
  return state.todos;
}

@Component({
  ....
})
export class TodoComponent extends DataObserver {

  @BindData(selectTodos)
  todos: Todo[]
}
```

Remember to extend your class from `DataObserver`. It is essential to instruct Angular Compiler to keep `ngOnInit` and `ngOnDestroy` life cycle events, which can only be achieved by implementing `OnInit` and `OnDestroy` interfaces. Because of this constraint all components using `@BindData` must extend itself from `DataObserver` which sets `ngOnInit` and `ngOnDestroy` properly; `@BindData` inturn depends on these functions. However if you would like to extend your class from your-own base class you may do so after making sure `ngOnInit` and `ngOnDestroy` are implemented properly.

## Reducer Functions & Async Tasks

Reducer functions can return either of the following

* A portion of the application state as plain object
```ts
@BindAction()
add(state: State, action: AddTodoAction): State {
  return {
    todos: (state.todos || []).concat(action.todo)
  }
}
```

* A portion of the application state wrapped in Promise, if it needs to perform an async task.
```ts
@BindAction()
add(state: State, action: AddTodoAction): Promise<AppStore> {
  return new Promise((resolve, reject) => {
    asyncTask().then(() => {
      resolve({
        todos: (state.todos || []).concat(action.todo)
      })
    })
  })
}
```

* A portion of the application state wrapped in Observables, if the application state needs update multiple times over a period of time, all when handling an action. For example, you have to show loader before starting the process, and hide loader after you have done processing, you may use this.
```ts
@BindAction()
add(state: State, action: AddTodoAction): Observable<State> {
  return Observable.create((observer: Observer<State>) => {
    observer.next({ showLoader: true })
    asyncTask().then(() => {
      observer.next({
        todos: (state.todos || []).concat(action.todo),
        showLoader: false
      })
      observer.complete()
    })
  })
}
```

## Initializing State & Enabling HotLoad

```ts
...
import { INITIAL_STATE } from './../state'
import { environment } from '../environments/environment'
import { initialize } from 'angular-reflux'

initialize(INITIAL_STATE, {
  hotLoad: !environment.production,
  domain: 'my-app'
})

@NgModule({
  ....
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Immutable Application State
To take advantage of Angular 2’s change detection strategy — OnPush — we need to ensure that the state is indeed immutable. This module uses [seamless-immutable](https://github.com/rtfeldman/seamless-immutable) for immutability.

Since application state is immutable, the reducer functions will not be able to update  state; any attempt to update the state will result in error. Therefore a reducer function should either return a portion of the state that needs change (recommended) or a new application state wrapped in `ReplaceableState`, instead.

```ts
export class TodoStore extends Store {

  @BindAction()
  selectTodo(state: State, action: SelectTodoAction): Observable<State> {
    return Observable.create((observer: Observer<State>) => {

      // returns only the changes
      observer.next({
          selectedTodo: action.todo
      });

      observer.complete();
    });
  }

  @BindAction()
  resetTodos(state: State, action: ResetTodosAction): Observable<State> {
    return Observable.create((observer: Observer<State>) => {

      // returns the entire state (use with CAUTION)
      observer.next(new ReplaceableState({
        todos: [],
        selectedTodo: undefined
      }));

      observer.complete();
    });
  }
}

```

## Organizing Stores

Store must be injectable, so add `@Injectable`. Create `STORES` array and a class `Stores` (again injectable) to maintain stores. When you create a new store remember to, inject to the `Stores`'s constructor and add it to the `STORES` array.

```ts
import { Injectable } from '@angular/core';
import { TodoStore } from './todo.store';

@Injectable()
export class Stores {
  constructor( private todoStore: TodoStore) { }
}

export const STORES = [
  Stores,
  TodoStore
];
```

Add `STORES` to the `providers` in `app.module.ts`.

```ts
import { STORES } from './store/todo.store';
....

@NgModule({
  ....
  providers: [
    ...STORES,
    ...
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

```

And finally, inject `Stores` into your root component (`app.component.ts`)

```ts
@Component({
  ....
})
export class AppComponent {

  constructor(private stores: STORES) { }

  ....
}
```

## Sample Code

Sample code is right [here](https://github.com/rintoj/angular-reflux-starter). You can clone my repo to get started with angular2 project integrated with this module.

```sh
git clone https://github.com/rintoj/angular-reflux-starter
```

### Hope this module is helpful to you. Please make sure to checkout my other [projects](https://github.com/rintoj) and [articles](https://medium.com/@rintoj). Enjoy coding!

## Contributing
Contributions are very welcome! Just send a pull request. Feel free to contact [me](mailto:rintoj@gmail.com) or checkout my [GitHub](https://github.com/rintoj) page.

## Author

**Rinto Jose** (rintoj)

Follow me:
  [GitHub](https://github.com/rintoj)
| [Facebook](https://www.facebook.com/rinto.jose)
| [Twitter](https://twitter.com/rintoj)
| [Google+](https://plus.google.com/+RintoJoseMankudy)
| [Youtube](https://youtube.com/+RintoJoseMankudy)

## Versions
[Check CHANGELOG](https://github.com/rintoj/angular-reflux/blob/master/CHANGELOG.md)

## License
```
The MIT License (MIT)

Copyright (c) 2016 Rinto Jose (rintoj)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
