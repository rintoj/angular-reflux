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