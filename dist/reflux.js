"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Immutable = require("seamless-immutable");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var core_1 = require("@angular/core");
var Rx_1 = require("rxjs/Rx");
var REFLUX_ACTION_KEY = Symbol('reflux:actions');
var REFLUX_DATA_BINDINGS_KEY = Symbol('reflux:dataBindings');
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
var StateStream = (function () {
    function StateStream(initialState) {
        this.subject = new BehaviorSubject_1.BehaviorSubject(initialState);
    }
    /**
     * Publish next state
     * @param state
     */
    StateStream.prototype.next = function (state) {
        this.subject.next(state);
    };
    /**
     * Subscribe to the stream
     * @param onNext
     * @param onError
     * @param onComplete
     */
    StateStream.prototype.subscribe = function (onNext, onError, onComplete) {
        return this.subject.subscribe(onNext, onError, onComplete);
    };
    /**
     * Fires 'next' only when the value returned by this function changed from the previous value.
     *
     * @template T
     * @param {StateSelector<T>} selector
     * @returns {Observable<T>}
     */
    StateStream.prototype.select = function (selector) {
        var _this = this;
        return Rx_1.Observable.create(function (subscriber) {
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
    return StateStream;
}());
StateStream = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [Object])
], StateStream);
exports.StateStream = StateStream;
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
/**
 * Namespace for global variables
 */
var Reflux;
(function (Reflux) {
    'use strict';
    Reflux.state = Immutable.from({});
    Reflux.stateStream = new StateStream(Reflux.state);
    Reflux.subscriptions = [];
    Reflux.actionIdentities = [];
})(Reflux || (Reflux = {}));
/**
 * Defines an action which an be extended to implement custom actions for a reflux application
 *
 * @example
 *
 * // Create your own action class
 * class PageSwitchAction extends Action {
 *   constructor(public pageId: string) {
 *     super()
 *   }
 * }
 *
 * // Subscribe to your action
 * new PageSwitchAction(undefined).subscribe((state: State, action: PageSwitchAction): Observable<State> => {
 *   return Observable.create((observer: Observer<State>) => {
 *     observer.next(updatedState)
 *       observer.complete()
 *   }).share()
 * }, this)
 *
 * // Dispatch your action
 * new PageSwitchAction('page1').dispatch()
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
            var id = Reflux.actionIdentities.indexOf(this.constructor);
            if (id < 0) {
                Reflux.actionIdentities.push(this.constructor);
                id = Reflux.actionIdentities.indexOf(this.constructor);
            }
            return "c" + id;
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
        var observable = Rx_1.Observable.from(subscriptions)
            .flatMap(function (actionObserver) {
            var value = actionObserver(Reflux.state, _this);
            if (!(value instanceof Rx_1.Observable)) {
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
                // merge the state with existing state
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
            .catch(function (error) { return Rx_1.Observable.empty(); })
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
 *    return Observable.create((observer: Observer<State>) => {
 *       observer.next({
 *          todos: state.todos.concat([action.todo])
 *       })
 *       observer.complete()
 *    }).share()
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
        var refluxActions = {};
        if (Reflect.hasMetadata(REFLUX_ACTION_KEY, target)) {
            refluxActions = Reflect.getMetadata(REFLUX_ACTION_KEY, target);
        }
        refluxActions[propertyKey] = metadata[1];
        Reflect.defineMetadata(REFLUX_ACTION_KEY, refluxActions, target);
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
    return Reflux.stateStream
        .select(selector)
        .subscribe(function (data) {
        if (typeof target[key] === 'function')
            return target[key].call(target, data);
        target[key] = data;
    });
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
function BindData(selector, bindImmediate) {
    return function (target, propertyKey) {
        var bindingsMeta = Reflect.getMetadata(REFLUX_DATA_BINDINGS_KEY, target);
        if (!Reflect.hasMetadata(REFLUX_DATA_BINDINGS_KEY, target)) {
            bindingsMeta = { selectors: {}, subscriptions: [], destroyed: !bindImmediate };
            var originalInit_1 = target.ngOnInit;
            target.ngOnInit = function ngOnInit() {
                var _this = this;
                var dataBindings = Reflect.getMetadata(REFLUX_DATA_BINDINGS_KEY, this);
                if (dataBindings != undefined && dataBindings.destroyed === true) {
                    dataBindings.subscriptions = dataBindings.subscriptions.concat(Object.keys(dataBindings.selectors)
                        .map(function (key) { return bindData(_this, key, dataBindings.selectors[key]); }));
                    dataBindings.destroyed = false;
                    Reflect.defineMetadata(REFLUX_DATA_BINDINGS_KEY, dataBindings, this);
                }
                return originalInit_1 && originalInit_1.call(this);
            };
            var originalDestroy_1 = target.ngOnDestroy;
            target.ngOnDestroy = function ngOnDestroy() {
                var dataBindings = Reflect.getMetadata(REFLUX_DATA_BINDINGS_KEY, this);
                if (dataBindings != undefined) {
                    dataBindings.subscriptions.forEach(function (subscription) { return subscription.unsubscribe(); });
                    dataBindings.subscriptions = [];
                    dataBindings.destroyed = true;
                    Reflect.defineMetadata(REFLUX_DATA_BINDINGS_KEY, dataBindings, this);
                }
                return originalDestroy_1 && originalDestroy_1.call(this);
            };
        }
        bindingsMeta.selectors[propertyKey] = selector;
        if (bindImmediate) {
            bindingsMeta.subscriptions.push(bindData(target, propertyKey, selector));
        }
        Reflect.defineMetadata(REFLUX_DATA_BINDINGS_KEY, bindingsMeta, target);
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
        if (!Reflect.hasMetadata(REFLUX_ACTION_KEY, this))
            return;
        var refluxActions = Reflect.getMetadata(REFLUX_ACTION_KEY, this);
        Object.keys(refluxActions).forEach(function (name) { return new refluxActions[name]().subscribe(_this[name], _this); });
    }
    return Store;
}());
exports.Store = Store;
//# sourceMappingURL=reflux.js.map