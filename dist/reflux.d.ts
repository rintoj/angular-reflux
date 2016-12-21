/**
 * @copyright © 2014 Tata Consultancy Services Limited. ALL RIGHTS RESERVED.
 *
 * @license The data contained herein shall not be disclosed, duplicated, or used
 * in whole or in part for any purpose other than to evaluate the proposal, provided
 * that if a contract is awarded to this offer as a result of, or in connection with,
 * the submission of these data, the recipient shall have the right to duplicate,
 * use or disclose the data to the extent provided in the agreement. This restriction
 * does not limit the right to use information contained in the data if it is obtained
 * from another source without restriction.
 *
 * @author Tata Consultancy Services (TCS)
 * @version v3.5
 * @since v3.5
 */
import * as Immutable from 'seamless-immutable';
import { BehaviorSubject } from 'rxjs/Rx';
import { Observable } from 'rxjs/Rx';
import { State } from './application-state';
export { State } from './application-state.ts';
/**
 * Observer for next value from observable (used by subscribe() function)
 *
 * @export
 * @interface ActionObserver
 */
export interface ActionObserver {
    (state: State, action: Action): Observable<State>;
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
export interface StateSelector<T> {
    (state: State): T;
}
/**
 * Represents replaceable state
 *
 * @export
 * @class ReplaceableState
 */
export declare class ReplaceableState {
    state: State;
    constructor(state: State);
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
export declare class StateStream extends BehaviorSubject<State> {
    /**
     * Fires 'next' only when the value returned by this function changed from the previous value.
     *
     * @template T
     * @param {StateSelector<T>} selector
     * @returns {Observable<T>}
     */
    select<T>(selector: StateSelector<T>): Observable<T>;
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
export declare class Action {
    protected static subscriptions: any[];
    protected static state: Immutable<State>;
    protected static stateStream: StateStream;
    protected static _lastAction: Action;
    /**
     * Create new state stream using the 'initialState'. This is used by Angular 2 bootstrap provider
     *
     * @static
     * @param {State} initialState The initial state of the application
     * @returns The state stream.
     */
    static stateStreamFactory(initialState: State): StateStream;
    /**
     * The last action occurred
     *
     * @readonly
     * @static
     *
     * @memberOf Action
     */
    static readonly lastAction: Action;
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
    subscribe(actionObserver: ActionObserver, context: any): Action;
    /**
     * Dispatch this action. Returns an observable which will be completed when all action subscribers
     * complete it's processing
     *
     * @returns {Observable<State>}
     */
    dispatch(): Promise<State>;
}
