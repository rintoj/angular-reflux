import { Todo } from './todo';

// define application state
export interface State {
    todos?: Todo[];
}

// define the initial state
export const INITIAL_STATE: State = {
    todos: []
};