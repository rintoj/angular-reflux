"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Immutable = require("seamless-immutable");
var state_stream_1 = require("./state-stream");
exports.REFLUX_ACTION_KEY = Symbol('reflux:actions');
exports.REFLUX_DATA_BINDINGS_KEY = Symbol('reflux:dataBindings');
/**
 * Namespace for global variables
 */
var Reflux;
(function (Reflux) {
    'use strict';
    Reflux.state = Immutable.from({});
    Reflux.stateStream = new state_stream_1.StateStream(Reflux.state);
    Reflux.subscriptions = [];
    Reflux.actionIdentities = [];
})(Reflux = exports.Reflux || (exports.Reflux = {}));
//# sourceMappingURL=constance.js.map