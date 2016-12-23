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
 * Namespace for global variables
 */
var Reflux;
(function (Reflux) {
    'use strict';
    Reflux.state = Immutable.from({});
    Reflux.stateStream = new StateStream(Reflux.state);
    Reflux.subscriptions = [];
})(Reflux || (Reflux = {}));
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
            return Reflux.lastAction;
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
        if (!Reflux.subscriptions[this.identity]) {
            Reflux.subscriptions[this.identity] = [];
        }
        Reflux.subscriptions[this.identity].push(actionObserver.bind(context));
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
        Reflux.lastAction = this;
        var subscriptions = Reflux.subscriptions[this.identity];
        if (subscriptions == undefined || subscriptions.length === 0) {
            return new Promise(function (resolve) { return resolve(); });
        }
        ;
        var observable = Rx_2.Observable.from(subscriptions)
            .flatMap(function (actionObserver) {
            var value = actionObserver(Reflux.state, _this);
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
                Reflux.state = nextState;
                return nextState;
            }
            else if (state != undefined) {
                // merge the state with existing state;
                Reflux.state = Reflux.state.merge(state, { deep: true });
            }
            return state;
        })
            .skipWhile(function (state, i) { return i + 1 < subscriptions.length; })
            .map(function (state) {
            if (state != undefined) {
                Reflux.stateStream.next(Reflux.state);
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
        target.__actions__ = target.__actions__ || (target.__actions__ = {});
        target.__actions__[propertyKey] = metadata[1];
        return {
            value: function (state, action) {
                return descriptor.value.call(this, state, action);
            }
        };
    };
}
exports.BindAction = BindAction;
/**
 * Bind data for give key and target using a selector function
 *
 * @param {any} target
 * @param {any} key
 * @param {any} selectorFunc
 */
function bindData(target, key, selector) {
    target.__dataBindings__.subscriptions.push(Reflux.stateStream
        .select(selector)
        .subscribe(function (data) { return target[key] = data; }));
}
/**
 * Bind data to a variable
 *
 * @example
 * @BindData(state => state.todos)
 * todos: Todo[];
 *
 * @export
 * @param {*} selector
 * @returns
 */
function BindData(selector) {
    return function (target, propertyKey) {
        if (target.__dataBindings__ == undefined) {
            target.__dataBindings__ = { selectors: {}, subscriptions: [], destroyed: false };
            var originalInit_1 = target.ngOnInit;
            target.ngOnInit = function ngOnInit() {
                var _this = this;
                if (this.__dataBindings__.destroyed !== true)
                    return;
                Object.keys(this.__dataBindings__.selectors)
                    .forEach(function (key) { return bindData(_this, key, _this.__dataBindings__.selectors[key]); });
                this.__dataBindings__.destroyed = false;
                return originalInit_1 && originalInit_1();
            };
            var originalDestroy_1 = target.ngOnDestroy;
            target.ngOnDestroy = function ngOnDestroy() {
                this.__dataBindings__.subscriptions.forEach(function (subscription) { return subscription.unsubscribe(); });
                this.__dataBindings__.subscriptions = [];
                this.__dataBindings__.destroyed = true;
                return originalDestroy_1 && originalDestroy_1();
            };
        }
        target.__dataBindings__.selectors[propertyKey] = selector;
        bindData(target, propertyKey, selector);
    };
}
exports.BindData = BindData;
/**
 * Extend this class to create a store
 *
 * @export
 * @class Store
 */
var Store = (function () {
    function Store() {
        var _this = this;
        if (this.__actions__ == undefined)
            return;
        Object.keys(this.__actions__).forEach(function (name) { return new _this.__actions__[name]().subscribe(_this[name], _this); });
    }
    return Store;
}());
exports.Store = Store;
//# sourceMappingURL=reflux.js.map