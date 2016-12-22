import { Action } from './reflux';
import { State } from './index';
import { Todo } from './todo';

export class AddTodoAction extends Action<State> { constructor(public todo: Todo) { super(); } }
export class RemoveTodoAction extends Action<State> { constructor(public todo: Todo) { super(); } }