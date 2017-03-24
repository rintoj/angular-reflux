import { Todo, TodoFilter } from './todo';

import { Action } from 'angular-reflux';
import { State } from './';

export class FetchTodosAction extends Action { constructor() { super(); } }
export class AddTodoAction extends Action { constructor(public todo: Todo) { super(); } }
export class UpdateTodoAction extends Action { constructor(public todo: Todo) { super(); } }
export class ToggleTodoAction extends Action { constructor(public id: string) { super(); } }
export class RemoveTodoAction extends Action { constructor(public id: string) { super(); } }
export class MarkAllTodosAction extends Action { constructor(public complete: boolean) { super(); } }
export class ClearCompletedTodosAction extends Action { constructor() { super(); } }
export class SetFilterAction extends Action { constructor(public filter: TodoFilter) { super(); } }