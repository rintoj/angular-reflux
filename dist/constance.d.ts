import { Action } from './action';
import { StateStream } from './state-stream';
export declare const REFLUX_ACTION_KEY: symbol;
export declare const REFLUX_DATA_BINDINGS_KEY: symbol;
/**
 * Namespace for global variables
 */
export declare namespace Reflux {
    let lastAction: Action;
    let state: any;
    const stateStream: StateStream;
    const subscriptions: any[];
    const actionIdentities: any[];
}
