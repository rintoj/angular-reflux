"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Immutable = require("seamless-immutable");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var core_1 = require("@angular/core");
var Observable_1 = require("rxjs/Observable");
/**
 * Defines a stream for changing state in a reflux application
 *
 * @example
 *
 * // replace state
 * State.next(state)
 *
 * // subscribe to state stream
 * State.subscribe((state: State) => {
 *   // do your action here
 * })
 *
 * // or listen to a portion of the state
 * State
 *   .select((state: State) => state.application.pageContainer)
 *   .subscribe((state: State) => {
 *     // do your action here
 *   })
 *
 * @export
 * @class StateStream
 * @extends {BehaviorSubject}
 */
var State = (function () {
    function State() {
        this.currentState = Immutable.from({});
        this.subject = new BehaviorSubject_1.BehaviorSubject(this.currentState);
    }
    Object.defineProperty(State, "current", {
        get: function () {
            return State.state.currentState;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Publish next state
     * @param state
     */
    State.next = function (state) {
        State.state.subject.next(state);
    };
    /**
     * Subscribe to the stream
     * @param onNext
     * @param onError
     * @param onComplete
     */
    State.subscribe = function (onNext, onError, onComplete) {
        return State.state.subject.subscribe(onNext, onError, onComplete);
    };
    /**
     * Fires 'next' only when the value returned by this function changed from the previous value.
     *
     * @template T
     * @param {StateSelector<T>} selector
     * @returns {Observable<T>}
     */
    State.select = function (selector) {
        var _this = this;
        return Observable_1.Observable.create(function (subscriber) {
            var previousState;
            var subscription = _this.subscribe(function (state) {
                var selection = select(state, selector);
                if (selection !== select(previousState, selector)) {
                    previousState = state;
                    subscriber.next(selection);
                }
            }, function (error) { return subscriber.error(error); }, function () { return subscriber.complete(); });
            return subscription;
        }).share();
    };
    return State;
}());
State.state = new State();
State.decorators = [
    { type: core_1.Injectable },
];
/** @nocollapse */
State.ctorParameters = function () { return []; };
exports.State = State;
/**
 * Run selector function on the given state and return it's result. Return undefined if an error occurred
 *
 * @param {*} state
 * @param {StateSelector} selector
 * @returns The value return by the selector, undefined if an error occurred.
 */
function select(state, selector) {
    if (state == undefined)
        return;
    if (selector == undefined)
        return state;
    try {
        return selector(state);
    }
    catch (error) {
        return undefined;
    }
}
//# sourceMappingURL=state.js.map