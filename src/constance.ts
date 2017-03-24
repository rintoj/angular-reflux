import * as Immutable from 'seamless-immutable'

import { Action } from './action'
import { StateStream } from './state-stream'

export const REFLUX_ACTION_KEY = Symbol('reflux:actions')
export const REFLUX_DATA_BINDINGS_KEY = Symbol('reflux:dataBindings')

/**
 * Namespace for global variables
 */
export namespace Reflux {
  'use strict'
  export let lastAction: Action
  export let state = Immutable.from<any>({})
  export const stateStream = new StateStream(Reflux.state)
  export const subscriptions: any[] = []
  export const actionIdentities: any[] = []
}
