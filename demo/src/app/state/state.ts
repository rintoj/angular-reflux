
export interface Todo {
    title: string;
    content: string;
    completed: boolean;
    tags: string[];
}

export interface State {
    todos?: Todo[];
}

export const INITIAL_STATE = {
    todos: []
};