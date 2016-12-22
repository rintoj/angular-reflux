import * as Immutable from 'seamless-immutable';

import { BehaviorSubject } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

/**
 * Use reflection library
 */
declare var Reflect: any;

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
export class ReplaceableState<S> {
    constructor(public state: S) { }
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
export class StateStream<S> extends BehaviorSubject<S> {

    /**
     * Fires 'next' only when the value returned by this function changed from the previous value.
     *
     * @template T
     * @param {StateSelector<T>} selector
     * @returns {Observable<T>}
     */
    select<T>(selector: StateSelector<T, S>): Observable<T> {

        return Observable.create(subscriber => {
            let previousState: S;
            let subscription = this.subscribe(
                (state: S) => {
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
                error => subscriber.error(error),
                () => subscriber.complete()
            );

            return subscription;
        }).share();
    }
}

namespace Reflux {
    'use strict';
    export let lastAction: Action<any>;
    export let state = Immutable.from<any>({});
    export const stateStream = new StateStream(Reflux.state);
    export const subscriptions: any[] = [];
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
export class Action<S> {

    /**
     * The last action occurred
     *
     * @readonly
     * @static
     *
     * @memberOf Action
     */
    public static get lastAction() {
        return Reflux.lastAction;
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
    public subscribe(actionObserver: ActionObserver<S>, context: any): Action<S> {
        if (!Reflux.subscriptions[this.identity]) {
            Reflux.subscriptions[this.identity] = [];
        }
        Reflux.subscriptions[this.identity].push(actionObserver.bind(context));
        return this;
    }

    /**
     * Dispatch this action. Returns an observable which will be completed when all action subscribers
     * complete it's processing
     *
     * @returns {Observable<S>}
     */
    dispatch(): Promise<S> {

        Reflux.lastAction = this;
        let subscriptions: ActionObserver<S>[] = Reflux.subscriptions[this.identity];
        if (subscriptions == undefined || subscriptions.length === 0) {
            return new Promise(resolve => resolve());
        };

        let observable: Observable<any> = Observable.from(subscriptions)

            // convert 'Observable' returned by action subscribers to state
            .flatMap((actionObserver: ActionObserver<S>): Observable<any> => {
                let value = actionObserver(Reflux.state, this);
                if (!(value instanceof Observable)) {
                    throw 'Store must return "Observable"';
                }
                return value;
            })

            // merge or replace state
            .map((state: any) => {
                if (state instanceof ReplaceableState) {
                    // replace the state with the new one if not 'undefined'
                    let nextState = (state as ReplaceableState<S>).state;
                    if (nextState == undefined) return;
                    Reflux.state = nextState;
                    return nextState;

                } else if (state != undefined) {
                    // merge the state with existing state;
                    Reflux.state = Reflux.state.merge(state, { deep: true });
                }
                return state;
            })

            // wait until all the subscripts have completed processing
            .skipWhile((state: S, i: number) => i + 1 < subscriptions.length)

            // push 'next' state to 'stateStream' if there has been a change to the state
            .map((state: any) => {
                console.info('State Changed', state);
                if (state != undefined) {
                    Reflux.stateStream.next(Reflux.state);
                }
                return state;
            })

            // catch any error occurred
            .catch((error: any): any => Observable.empty())

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
export function BindAction() {

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {

        let metadata = Reflect.getMetadata('design:paramtypes', target, propertyKey);
        if (metadata.length < 2) throw new Error('BindAction: function must have two arguments!');
        target.actions = target.actions || (target.actions = {});
        target.actions[propertyKey] = metadata[1];

        return {
            value: function (state: any, action: Action<any>): Observable<any> {
                return descriptor.value.call(this, state, action);
            }
        };
    };
}

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
export function BindData<S>(selector: StateSelector<any, S>) {
    return function (target: any, propertyKey: string) {
        Reflux.stateStream
            .select(selector)
            .subscribe(data => target[propertyKey] = data);
    };
}

/**
 * Extend this class to create a store
 *
 * @export
 * @class Store
 */
export class Store {

    protected actions: any;

    constructor() {
        this.bindActions();
    }

    protected bindActions() {
        if (this.actions == undefined) return;
        Object.keys(this.actions).forEach(name => new this.actions[name]().subscribe(this[name], this));
    }
}

