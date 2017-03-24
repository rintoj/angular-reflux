import * as Immutable from 'seamless-immutable'

import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { Observer } from 'rxjs/Rx'
import { Subscription } from 'rxjs/Subscription'

/**
 * Use reflection library
 */
declare var Reflect: any

const REFLUX_ACTION_KEY = Symbol('reflux:actions')
const REFLUX_DATA_BINDINGS_KEY = Symbol('reflux:dataBindings')

/**
 * Observer for next value from observable (used by subscribe() function)
 *
 * @export
 * @interface ActionObserver
 */
export interface ActionObserver {
  (state: any, action: Action): Observable<any>
}

/**
 * Observer for an error from observable (used by subscribe() function)
 *
 * @export
 * @interface ErrorObserver
 */
export interface ErrorObserver {
  (error: any): void
}

/**
 * State selector function
 *
 * @export
 * @interface StateSelector
 * @template T
 */
export interface StateSelector {
  (state: any): any
}

/**
 * Represents replaceable state
 *
 * @export
 * @class ReplaceableState
 */
export class ReplaceableState {
  constructor(public state: any) { }
}

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
@Injectable()
export class StateStream {

  private state: any
  private observable: Observable<any>
  private observer: Observer<any>

  constructor(initialState: any) {
    this.observable = Observable.create(observer => {
      this.observer = observer
      this.observer.next(initialState)
    }).share()
  }

  /**
   * Publish next state
   * @param state
   */
  next(state) {
    this.observer.next(state)
  }

  /**
   * Subscribe to the stream
   * @param onNext
   * @param onError
   * @param onComplete
   */
  subscribe(onNext, onError, onComplete) {
    return this.observable.subscribe(onNext, onError, onComplete)
  }

  /**
   * Fires 'next' only when the value returned by this function changed from the previous value.
   *
   * @template T
   * @param {StateSelector<T>} selector
   * @returns {Observable<T>}
   */
  select(selector: StateSelector): Observable<any> {

    return Observable.create(subscriber => {
      let previousState: any
      let subscription = this.subscribe(
        state => {
          let selection = select(state, selector)
          if (selection !== select(previousState, selector)) {
            previousState = state
            subscriber.next(selection)
          }
        },
        error => subscriber.error(error),
        () => subscriber.complete()
      )

      return subscription
    }).share()
  }
}

/**
 * Run selector function on the given state and return it's result. Return undefined if an error occurred
 *
 * @param {*} state
 * @param {StateSelector} selector
 * @returns The value return by the selector, undefined if an error occurred.
 */
function select(state: any, selector: StateSelector) {
  if (state == undefined) return
  if (selector == undefined) return state
  try {
    return selector(state)
  } catch (error) {
    return undefined
  }
}

/**
 * Namespace for global variables
 */
namespace Reflux {
  'use strict'
  export let lastAction: Action
  export let state = Immutable.from<any>({})
  export const stateStream = new StateStream(Reflux.state)
  export const subscriptions: any[] = []
  export const actionIdentities: any[] = []
}

/**
 * Defines an action which an be extended to implement custom actions for a reflux application
 *
 * @example
 *
 * // Create your own action class
 * class PageSwitchAction extends Action {
 *   constructor(public pageId: string) {
 *     super()
 *   }
 * }
 *
 * // Subscribe to your action
 * new PageSwitchAction(undefined).subscribe((state: State, action: PageSwitchAction): Observable<State> => {
 *   return Observable.create((observer: Observer<State>) => {
 *     observer.next(updatedState)
 *       observer.complete()
 *   }).share()
 * }, this)
 *
 * // Dispatch your action
 * new PageSwitchAction('page1').dispatch()
 *
 * @export
 * @class Action
 */
export class Action {

  /**
   * The last action occurred
   *
   * @readonly
   * @static
   *
   * @memberOf Action
   */
  public static get lastAction() {
    return Reflux.lastAction
  }

  /**
   * Returns identity of this class
   *
   * @readonly
   * @type {string}
   */
  get identity(): string {
    let id = Reflux.actionIdentities.indexOf(this.constructor)
    if (id < 0) {
      Reflux.actionIdentities.push(this.constructor)
      id = Reflux.actionIdentities.indexOf(this.constructor)
    }
    return `c${id}`
  }

  /**
   * Subscribe to this action. actionObserver will be called when 'dispatch()' is invoked
   *
   * @param {ActionObserver} actionObserver The function that process the action
   * @param {*} context Context binding
   * @returns {Action}
   */
  public subscribe(actionObserver: ActionObserver, context: any): Action {
    if (!Reflux.subscriptions[this.identity]) {
      Reflux.subscriptions[this.identity] = []
    }
    Reflux.subscriptions[this.identity].push(actionObserver.bind(context))
    return this
  }

  /**
   * Dispatch this action. Returns an observable which will be completed when all action subscribers
   * complete it's processing
   *
   * @returns {Observable<S>}
   */
  dispatch(): Promise<any> {

    Reflux.lastAction = this
    let subscriptions: ActionObserver[] = Reflux.subscriptions[this.identity]
    if (subscriptions == undefined || subscriptions.length === 0) {
      return new Promise(resolve => resolve())
    }

    let observable: Observable<any> = Observable.from(subscriptions)

      // convert 'Observable' returned by action subscribers to state
      .flatMap((actionObserver: ActionObserver): Observable<any> => {
        let value = actionObserver(Reflux.state, this)
        if (!(value instanceof Observable)) {
          throw 'Store must return "Observable"'
        }
        return value
      })

      // merge or replace state
      .map((state: any) => {
        if (state instanceof ReplaceableState) {
          // replace the state with the new one if not 'undefined'
          let nextState = (state as ReplaceableState).state
          if (nextState == undefined) return
          Reflux.state = nextState
          return nextState

        } else if (state != undefined) {
          // merge the state with existing state
          Reflux.state = Reflux.state.merge(state, { deep: true })
        }
        return state
      })

      // wait until all the subscripts have completed processing
      .skipWhile((state: any, i: number) => i + 1 < subscriptions.length)

      // push 'next' state to 'stateStream' if there has been a change to the state
      .map((state: any) => {
        if (state != undefined) {
          Reflux.stateStream.next(Reflux.state)
        }
        return state
      })

      // catch any error occurred
      .catch((error: any): any => Observable.empty())

      // make this sharable (to avoid multiple copies of this observable being created)
      .share()

    return new Promise((resolve, reject) => {
      // to trigger observable
      observable.subscribe(() => {
        // empty function
      }, reject, resolve)
    })
  }
}

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
export function BindAction() {

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {

    let metadata = Reflect.getMetadata('design:paramtypes', target, propertyKey)
    if (metadata.length < 2) throw new Error('BindAction: function must have two arguments!')

    let refluxActions = {}
    if (Reflect.hasMetadata(REFLUX_ACTION_KEY, target)) {
      refluxActions = Reflect.getMetadata(REFLUX_ACTION_KEY, target)
    }
    refluxActions[propertyKey] = metadata[1]
    Reflect.defineMetadata(REFLUX_ACTION_KEY, refluxActions, target)

    return {
      value: (state: any, action: Action): Observable<any> => {
        return descriptor.value.call(this, state, action)
      }
    }
  }
}

/**
 * Bind data for give key and target using a selector function
 *
 * @param {any} target
 * @param {any} key
 * @param {any} selectorFunc
 */
function bindData<S>(target: any, key: string, selector: StateSelector): Subscription {
  return Reflux.stateStream
    .select(selector)
    .subscribe(data => {
      if (typeof target[key] === 'function') return target[key].call(target, data)
      target[key] = data
    })
}

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
export function BindData<S>(selector: StateSelector, bindImmediate?: boolean) {
  return (target: any, propertyKey: string) => {

    let bindingsMeta = Reflect.getMetadata(REFLUX_DATA_BINDINGS_KEY, target)
    if (!Reflect.hasMetadata(REFLUX_DATA_BINDINGS_KEY, target)) {
      bindingsMeta = { selectors: {}, subscriptions: [], destroyed: !bindImmediate }

      let originalInit = target.ngOnInit
      target.ngOnInit = function ngOnInit() {
        let dataBindings = Reflect.getMetadata(REFLUX_DATA_BINDINGS_KEY, this)
        if (dataBindings != undefined && dataBindings.destroyed === true) {

          dataBindings.subscriptions = dataBindings.subscriptions.concat(
            Object.keys(dataBindings.selectors)
              .map(key => bindData(this, key, dataBindings.selectors[key]))
          )

          dataBindings.destroyed = false
          Reflect.defineMetadata(REFLUX_DATA_BINDINGS_KEY, dataBindings, this)
        }
        return originalInit && originalInit.call(this)
      }

      let originalDestroy = target.ngOnDestroy
      target.ngOnDestroy = function ngOnDestroy() {
        let dataBindings = Reflect.getMetadata(REFLUX_DATA_BINDINGS_KEY, this)
        if (dataBindings != undefined) {
          dataBindings.subscriptions.forEach(subscription => subscription.unsubscribe())
          dataBindings.subscriptions = []
          dataBindings.destroyed = true
          Reflect.defineMetadata(REFLUX_DATA_BINDINGS_KEY, dataBindings, this)
        }
        return originalDestroy && originalDestroy.call(this)
      }
    }

    bindingsMeta.selectors[propertyKey] = selector
    if (bindImmediate) {
      bindingsMeta.subscriptions.push(bindData(target, propertyKey, selector))
    }
    Reflect.defineMetadata(REFLUX_DATA_BINDINGS_KEY, bindingsMeta, target)
  }
}

/**
 * Extend this class to create a store
 *
 * @export
 * @class Store
 */
export class Store {
  constructor() {
    if (!Reflect.hasMetadata(REFLUX_ACTION_KEY, this)) return
    let refluxActions = Reflect.getMetadata(REFLUX_ACTION_KEY, this)
    Object.keys(refluxActions).forEach(name => new refluxActions[name]().subscribe(this[name], this))
  }
}