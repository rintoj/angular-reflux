import { Action } from './action';
import { Observable } from 'rxjs/Observable';
/**
 * Decorator for defining an action handler
 *
 * @example
 *  @BindAction()
 *  addTodo(state: State, action: AddTodoAction): Observable<State> {
 *    return Observable.create((observer: Observer<State>) => {
 *       observer.next({
 *          todos: state.todos.concat([action.todo])
 *       })
 *       observer.complete()
 *    }).share()
 *  }
 *
 * @export
 * @template S
 * @returns
 */
export declare function BindAction(): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    value: (state: any, action: Action) => Observable<any>;
};
