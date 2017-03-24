import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { StateSelector } from './state-selector'
import { Subscription } from 'rxjs/Subscription'

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
  private subject: BehaviorSubject<any>

  constructor(initialState: any) {
    this.subject = new BehaviorSubject(initialState)
  }

  /**
   * Publish next state
   * @param state
   */
  next(state) {
    this.subject.next(state)
  }

  /**
   * Subscribe to the stream
   * @param onNext
   * @param onError
   * @param onComplete
   */
  subscribe(onNext, onError, onComplete): Subscription {
    return this.subject.subscribe(onNext, onError, onComplete)
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
