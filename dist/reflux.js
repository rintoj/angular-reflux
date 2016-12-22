"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Immutable = require('seamless-immutable');
var Rx_1 = require('rxjs/Rx');
var core_1 = require('@angular/core');
var Rx_2 = require('rxjs/Rx');
/**
 * Represents replaceable state
 *
 * @export
 * @class ReplaceableState
 */
var ReplaceableState = (function () {
    function ReplaceableState(state) {
        this.state = state;
    }
    return ReplaceableState;
}());
exports.ReplaceableState = ReplaceableState;
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
var StateStream = (function (_super) {
    __extends(StateStream, _super);
    function StateStream() {
        _super.apply(this, arguments);
    }
    /**
     * Fires 'next' only when the value returned by this function changed from the previous value.
     *
     * @template T
     * @param {StateSelector<T>} selector
     * @returns {Observable<T>}
     */
    StateStream.prototype.select = function (selector) {
        var _this = this;
        return Rx_2.Observable.create(function (subscriber) {
            var previousState;
            var subscription = _this.subscribe(function (state) {
                try {
                    if (state === undefined)
                        return;
                    var currentValue = selector(state);
                    var previousValue = previousState != undefined ? selector(previousState) : undefined;
                    if (currentValue !== previousValue) {
                        previousState = state;
                        subscriber.next(currentValue);
                    }
                }
                catch (error) {
                }
            }, function (error) { return subscriber.error(error); }, function () { return subscriber.complete(); });
            return subscription;
        }).share();
    };
    StateStream = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], StateStream);
    return StateStream;
}(Rx_1.BehaviorSubject));
exports.StateStream = StateStream;
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
var Action = (function () {
    function Action() {
    }
    /**
     * Create new state stream using the 'initialState'. This is used by Angular 2 bootstrap provider
     *
     * @static
     * @param {State} initialState The initial state of the application
     * @returns The state stream.
     */
    Action.stateStreamFactory = function (initialState) {
        Action.state = Immutable.from(initialState);
        Action.stateStream = new StateStream(initialState);
        return Action.stateStream;
    };
    Object.defineProperty(Action, "lastAction", {
        /**
         * The last action occurred
         *
         * @readonly
         * @static
         *
         * @memberOf Action
         */
        get: function () {
            return Action._lastAction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Action.prototype, "identity", {
        /**
         * Returns identity of this class
         *
         * @readonly
         * @type {string}
         */
        get: function () {
            return this.constructor && this.constructor.toString();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Subscribe to this action. actionObserver will be called when 'dispatch()' is invoked
     *
     * @param {ActionObserver} actionObserver The function that process the action
     * @param {*} context Context binding
     * @returns {Action}
     */
    Action.prototype.subscribe = function (actionObserver, context) {
        if (!Action.subscriptions[this.identity]) {
            Action.subscriptions[this.identity] = [];
        }
        Action.subscriptions[this.identity].push(actionObserver.bind(context));
        return this;
    };
    /**
     * Dispatch this action. Returns an observable which will be completed when all action subscribers
     * complete it's processing
     *
     * @returns {Observable<S>}
     */
    Action.prototype.dispatch = function () {
        var _this = this;
        Action._lastAction = this;
        var subscriptions = Action.subscriptions[this.identity];
        if (subscriptions == undefined || subscriptions.length === 0) {
            return new Promise(function (resolve) { return resolve(); });
        }
        ;
        var observable = Rx_2.Observable.from(subscriptions)
            .flatMap(function (actionObserver) {
            var value = actionObserver(Action.state, _this);
            if (!(value instanceof Rx_2.Observable)) {
                throw 'Store must return "Observable"';
            }
            return value;
        })
            .map(function (state) {
            if (state instanceof ReplaceableState) {
                // replace the state with the new one if not 'undefined'
                var nextState = state.state;
                if (nextState == undefined)
                    return;
                Action.state = nextState;
                return nextState;
            }
            else if (state != undefined) {
                // merge the state with existing state;
                Action.state = Action.state.merge(state, { deep: true });
            }
            return state;
        })
            .skipWhile(function (state, i) { return i + 1 < subscriptions.length; })
            .map(function (state) {
            if (state != undefined) {
                Action.stateStream.next(Action.state);
            }
            return state;
        })
            .catch(function (error) { return Rx_2.Observable.empty(); })
            .share();
        return new Promise(function (resolve, reject) {
            // to trigger observable
            observable.subscribe(function () {
                // empty function
            }, reject, resolve);
        });
    };
    Action.subscriptions = [];
    return Action;
}());
exports.Action = Action;
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
function BindAction() {
    return function (target, propertyKey, descriptor) {
        var metadata = Reflect.getMetadata('design:paramtypes', target, propertyKey);
        if (metadata.length < 2)
            throw new Error('BindAction: function must have two arguments!');
        target.actions = target.actions || (target.actions = {});
        target.actions[propertyKey] = metadata[1];
        return {
            value: function (state, action) {
                return descriptor.value.call(this, state, action);
            }
        };
    };
}
exports.BindAction = BindAction;
/**
 * Extend this class to create a store
 *
 * @export
 * @class Store
 */
var Store = (function () {
    function Store() {
        this.bindActions();
    }
    Store.prototype.bindActions = function () {
        var _this = this;
        if (this.actions == undefined)
            return;
        Object.keys(this.actions).forEach(function (name) { return new _this.actions[name]().subscribe(_this[name], _this); });
    };
    return Store;
}());
exports.Store = Store;
//# sourceMappingURL=reflux.js.map