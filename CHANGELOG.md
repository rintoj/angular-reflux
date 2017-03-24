# v1.1.0

* Add `DataObserver` class to prevent angular compiler from removing `ngOnInit` and `ngOnDestroy` functions

# v1.0.0

## Breaking Change: This module is now AOT compatible.

The selectorFunction to `@BindData()` decorator must be an exported standalone function, to avoid the below AOT error:

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
export class TodoComponent {

  @BindData(selectTodos)
  todos: Todo[]
}
```

## Other fixes

* Bug fix: Context was missing when `ngOnInit` and `ngOnDestroy` functions were called by reflux

# v0.2.0

* Bug fix: Added `bindImmediate` flag to `BindData` decorator to enable it to be used with non-components.

# v0.1.0

* Bug fix: After compiling a production build using `ng build --prod`, actions subscribers received incorrect action.

# v0.0.3

* Updating documentation

# v0.0.2

* Initial version
