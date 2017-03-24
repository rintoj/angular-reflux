import { StateSelector } from './state-selector';
/**
 * Bind data to a variable or to a function
 *
 * @example
 * @BindData(state => state.todos)
 * todos: Todo[]
 *
 * @BindDAta(state => state.todos)
 * todosDidChange(todos: Todo[]) {
 *   // your logic
 * }
 *
 *
 * @export
 * @param {*} selector
 * @returns
 */
export declare function BindData<S>(selector: StateSelector, bindImmediate?: boolean): (target: any, propertyKey: string) => void;
