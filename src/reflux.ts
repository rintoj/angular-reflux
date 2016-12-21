import * as Immutable from 'seamless-immutable';

import { BehaviorSubject } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

// import { State } from './application-state';
// import { logger } from '../../util/logger';

export interface State {

}

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
export class ReplaceableState {
    constructor(public state: State) { }
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
@Injectable()
export class StateStream extends BehaviorSubject<State> {

    /**
     * Fires 'next' only when the value returned by this function changed from the previous value.
     *
     * @template T
     * @param {StateSelector<T>} selector
     * @returns {Observable<T>}
     */
    select<T>(selector: StateSelector<T>): Observable<T> {

        return Observable.create(subscriber => {
            let previousState: State;
            let subscription = this.subscribe(
                (state: State) => {
                    try {
                        if (state === undefined) return;
                        let currentValue = selector(state);
                        let previousValue = previousState != undefined ? selector(previousState) : undefined;
                        if (currentValue !== previousValue) {
                            previousState = state;
                            subscriber.next(currentValue);
                        }
                    } catch (error) {
                        // logger.error(error);
                        // subscriber.error(error);
                    }
                },
                error => {
                    subscriber.error(error);
                },
                () => subscriber.complete()
            );

            return subscription;
        }).share();
    }
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
export class Action {

    protected static subscriptions: any[] = [];
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
    public static stateStreamFactory(initialState: State) {
        Action.state = Immutable.from<State>(initialState);
        Action.stateStream = new StateStream(initialState);
        return Action.stateStream;
    }

    /**
     * The last action occurred
     *
     * @readonly
     * @static
     *
     * @memberOf Action
     */
    public static get lastAction() {
        return Action._lastAction;
    }

    /**
     * Returns identity of this class
     *
     * @readonly
     * @type {string}
     */
    get identity(): string {
        return this.constructor && this.constructor.toString();
    }

    /**
     * Subscribe to this action. actionObserver will be called when 'dispatch()' is invoked
     *
     * @param {ActionObserver} actionObserver The function that process the action
     * @param {*} context Context binding
     * @returns {Action}
     */
    public subscribe(actionObserver: ActionObserver, context: any): Action {
        if (!Action.subscriptions[this.identity]) {
            Action.subscriptions[this.identity] = [];
        }
        Action.subscriptions[this.identity].push(actionObserver.bind(context));
        return this;
    }

    /**
     * Dispatch this action. Returns an observable which will be completed when all action subscribers
     * complete it's processing
     *
     * @returns {Observable<State>}
     */
    dispatch(): Promise<State> {

        Action._lastAction = this;
        let subscriptions: ActionObserver[] = Action.subscriptions[this.identity];
        if (subscriptions == undefined || subscriptions.length === 0) {
            return new Promise(resolve => resolve());
        };

        let observable: Observable<State> = Observable.from(subscriptions)

            // convert 'Observable' returned by action subscribers to state
            .flatMap((actionObserver: ActionObserver): Observable<any> => {
                let value = actionObserver(Action.state, this);
                if (!(value instanceof Observable)) {
                    throw 'Store must return "Observable"';
                }
                return value;
            })

            // merge or replace state
            .map((state: any) => {
                if (state instanceof ReplaceableState) {
                    // replace the state with the new one if not 'undefined'
                    let nextState = (state as ReplaceableState).state;
                    if (nextState == undefined) return;
                    Action.state = nextState as Immutable<State>;
                    return nextState;

                } else if (state != undefined) {
                    // merge the state with existing state;
                    Action.state = Action.state.merge(state, { deep: true });
                }
                return state;
            })

            // wait until all the subscripts have completed processing
            .skipWhile((state: State, i: number) => i + 1 < subscriptions.length)

            // push 'next' state to 'stateStream' if there has been a change to the state
            .map((state: any) => {
                if (state != undefined) {
                    Action.stateStream.next(Action.state);
                }
                return state;
            })

            // catch any error occurred
            .catch((error: any): any => {
                logger.error(error);
                return Observable.empty();
            })

            // make this sharable (to avoid multiple copies of this observable being created)
            .share();

        return new Promise((resolve, reject) => {
            // to trigger observable
            observable.subscribe(() => {
                // empty function
            }, reject, resolve);
        });
    }
}