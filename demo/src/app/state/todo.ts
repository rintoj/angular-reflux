export enum TodoFilter {
    ALL, ACTIVE, COMPLETED
}

export interface Todo {
    id?: string;
    title?: string;
    completed?: boolean;
}