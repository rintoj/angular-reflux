import { Action } from './reflux';
import { State } from './state';
import { Todo } from './state';

export class AddTodo extends Action<State> { constructor(public todo: Todo) { super(); } }