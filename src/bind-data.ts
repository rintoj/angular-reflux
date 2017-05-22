import { REFLUX_DATA_BINDINGS_KEY } from './constance'
import { State } from './state'
import { StateSelector } from './state-selector'
import { Subscription } from 'rxjs/Subscription'

declare var Reflect: any

/**
 * Bind data for give key and target using a selector function
 *
 * @param {any} target
 * @param {any} key
 * @param {any} selectorFunc
 */
export function bindData<S>(target: any, key: string, selector: StateSelector): Subscription {
  return State
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
    }

    bindingsMeta.selectors[propertyKey] = selector
    if (bindImmediate) {
      bindingsMeta.subscriptions.push(bindData(target, propertyKey, selector))
    }
    Reflect.defineMetadata(REFLUX_DATA_BINDINGS_KEY, bindingsMeta, target)
  }
}