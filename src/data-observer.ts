import { OnDestroy, OnInit } from '@angular/core'

import { REFLUX_DATA_BINDINGS_KEY } from './constance'
import { State } from './state'
import { StateSelector } from './state-selector'
import { Subscription } from 'rxjs/Subscription'
import { bindData } from './bind-data'

declare var Reflect: any

/**
 * Every component that uses `@BindAction` must extends from this
 * class in order to make sure that AOT won't delete OnInit and
 * OnDestroy life-cycle events used by the decorator, irrespective
 * of the fact that it may or may not be used by the component itself
 *
 * @export
 * @class DataObserver
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
export class DataObserver implements OnInit, OnDestroy {

  ngOnInit() {
    let dataBindings = Reflect.getMetadata(REFLUX_DATA_BINDINGS_KEY, this)
    if (dataBindings != undefined && dataBindings.destroyed === true) {
      dataBindings.subscriptions = dataBindings.subscriptions.concat(
        Object.keys(dataBindings.selectors)
          .map(key => bindData(this, key, dataBindings.selectors[key]))
      )

      dataBindings.destroyed = false
      Reflect.defineMetadata(REFLUX_DATA_BINDINGS_KEY, dataBindings, this)
    }
  }

  ngOnDestroy() {
    let dataBindings = Reflect.getMetadata(REFLUX_DATA_BINDINGS_KEY, this)
    if (dataBindings != undefined) {
      dataBindings.subscriptions.forEach(subscription => subscription.unsubscribe())
      dataBindings.subscriptions = []
      dataBindings.destroyed = true
      Reflect.defineMetadata(REFLUX_DATA_BINDINGS_KEY, dataBindings, this)
    }
  }
}