import { Observable } from 'rxjs/Observable';
import { StateSelector } from './state-selector';
import { Subscription } from 'rxjs/Subscription';
/**
 * Defines a stream for changing state in a reflux application
 *
 * @example
 *
 * // subscribe to state stream
 * stateStream.subscribe((state: State) => {
 *   // do your action here
 * })
 *
 * // or listen to a portion of the state
 * stateStream
 *   .select((state: State) => state.application.pageContainer)
 *   .subscribe((state: State) => {
 *     // do your action here
 *   })
 *
 * @export
 * @class StateStream
 * @extends {BehaviorSubject}
 */
export declare class StateStream {
    private state;
    private subject;
    constructor(initialState: any);
    /**
     * Publish next state
     * @param state
     */
    next(state: any): void;
    /**
     * Subscribe to the stream
     * @param onNext
     * @param onError
     * @param onComplete
     */
    subscribe(onNext: any, onError: any, onComplete: any): Subscription;
    /**
     * Fires 'next' only when the value returned by this function changed from the previous value.
     *
     * @template T
     * @param {StateSelector<T>} selector
     * @returns {Observable<T>}
     */
    select(selector: StateSelector): Observable<any>;
}
