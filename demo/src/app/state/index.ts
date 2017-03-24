import { Todo, TodoFilter } from './todo';

export interface State {
    todos?: Todo[];
    filter?: TodoFilter;
}