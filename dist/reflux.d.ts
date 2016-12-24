import { BehaviorSubject } from 'rxjs/Rx';
import { Observable } from 'rxjs/Rx';
/**
 * Observer for next value from observable (used by subscribe() function)
 *
 * @export
 * @interface ActionObserver
 */
export interface ActionObserver<S> {
    (state: S, action: Action<S>): Observable<S>;
}
/**
 * Observer for an error from observable (used by subscribe() function)
 *
 * @export
 * @interface ErrorObserver
 */
export interface ErrorObserver {
    (error: any): void;
}
/**
 * State selector function
 *
 * @export
 * @interface StateSelector
 * @template T
 */
export interface StateSelector<T, S> {
    (state: S): T;
}
/**
 * Represents replaceable state
 *
 * @export
 * @class ReplaceableState
 */
export declare class ReplaceableState<S> {
    state: S;
    constructor(state: S);
}
/**
 * Defines a stream for changing state in a reflux application
 *
 * @example
 *
 * // subscribe to state stream
 * stateStream.subscribe((state: State) => {
 *      // do your action here
 * });
 *
 * // or listen to a portion of the state
 * stateStream
 *      .select((state: State) => state.application.pageContainer)
 *      .subscribe((state: State) => {
 *          // do your action here
 *      });
 *
 * @export
 * @class StateStream
 * @extends {BehaviorSubject<State>}
 */
export declare class StateStream<S> extends BehaviorSubject<S> {
    /**
     * Fires 'next' only when the value returned by this function changed from the previous value.
     *
     * @template T
     * @param {StateSelector<T>} selector
     * @returns {Observable<T>}
     */
    select<T>(selector: StateSelector<T, S>): Observable<T>;
}
/**
 * Defines an action which an be extended to implement custom actions for a reflux application
 *
 * @example
 *
 * // Create your own action class
 * class PageSwitchAction extends Action {
 *      constructor(public pageId: string) {
 *          super();
 *      }
 * }
 *
 * // Subscribe to your action
 * new PageSwitchAction(undefined).subscribe((state: State, action: PageSwitchAction): Observable<State> => {
 *      return Observable.create((observer: Observer<State>) => {
 *          observer.next(updatedState);
 *          observer.complete();
 *      }).share();
 * }, this);
 *
 * // Dispatch your action
 * new PageSwitchAction('page1').dispatch();
 *
 * @export
 * @class Action
 */
export declare class Action<S> {
    /**
     * The last action occurred
     *
     * @readonly
     * @static
     *
     * @memberOf Action
     */
    static readonly lastAction: Action<any>;
    /**
     * Returns identity of this class
     *
     * @readonly
     * @type {string}
     */
    readonly identity: string;
    /**
     * Subscribe to this action. actionObserver will be called when 'dispatch()' is invoked
     *
     * @param {ActionObserver} actionObserver The function that process the action
     * @param {*} context Context binding
     * @returns {Action}
     */
    subscribe(actionObserver: ActionObserver<S>, context: any): Action<S>;
    /**
     * Dispatch this action. Returns an observable which will be completed when all action subscribers
     * complete it's processing
     *
     * @returns {Observable<S>}
     */
    dispatch(): Promise<S>;
}
/**
 * Decorator for defining an action handler
 *
 * @example
 *  @BindAction()
 *  addTodo(state: State, action: AddTodoAction): Observable<State> {
 *      return Observable.create((observer: Observer<State>) => {
 *          observer.next({
 *              todos: state.todos.concat([action.todo])
 *          });
 *          observer.complete();
 *      }).share();
 *  }
 *
 * @export
 * @template S
 * @returns
 */
export declare function BindAction(): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    value: (state: any, action: Action<any>) => Observable<any>;
};
/**
 * Bind data to a variable
 *
 * @example
 * @BindData(state => state.todos)
 * todos: Todo[];
 *
 * @export
 * @param {*} selector
 * @returns
 */
export declare function BindData<S>(selector: StateSelector<any, S>): (target: any, propertyKey: string) => void;
/**
 * Extend this class to create a store
 *
 * @export
 * @class Store
 */
export declare class Store {
    constructor();
}
