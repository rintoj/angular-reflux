import { Action } from './reflux';
import { State } from './application-state';
import { Todo } from './todo';

export class AddTodoAction extends Action<State> { constructor(public todo: Todo) { super(); } }
export class RemoveTodoAction extends Action<State> { constructor(public todo: Todo) { super(); } }
export class ToggleTodoAction extends Action<State> { constructor(public todo: Todo) { super(); } }
export class FetchTodosAction extends Action<State> { constructor() { super(); } }