import { Action } from './reflux';
import { State } from './';
import { Todo } from './todo';

export class AddTodoAction extends Action<State> { constructor(public todo: Todo) { super(); } }
export class RemoveTodoAction extends Action<State> { constructor(public todo: Todo) { super(); } }
export class ToggleTodoAction extends Action<State> { constructor(public todo: Todo) { super(); } }
export class FetchTodosAction extends Action<State> { constructor() { super(); } }
export class ToggleTodoListAction extends Action<State> { constructor() { super(); } }