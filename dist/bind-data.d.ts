import { StateSelector } from './state-selector';
import { Subscription } from 'rxjs/Subscription';
/**
 * Bind data for give key and target using a selector function
 *
 * @param {any} target
 * @param {any} key
 * @param {any} selectorFunc
 */
export declare function bindData<S>(target: any, key: string, selector: StateSelector): Subscription;
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
