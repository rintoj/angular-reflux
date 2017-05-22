"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constance_1 = require("./constance");
var state_1 = require("./state");
/**
 * Bind data for give key and target using a selector function
 *
 * @param {any} target
 * @param {any} key
 * @param {any} selectorFunc
 */
function bindData(target, key, selector) {
    return state_1.State
        .select(selector)
        .subscribe(function (data) {
        if (typeof target[key] === 'function')
            return target[key].call(target, data);
        target[key] = data;
    });
}
exports.bindData = bindData;
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
        var bindingsMeta = Reflect.getMetadata(constance_1.REFLUX_DATA_BINDINGS_KEY, target);
        if (!Reflect.hasMetadata(constance_1.REFLUX_DATA_BINDINGS_KEY, target)) {
            bindingsMeta = { selectors: {}, subscriptions: [], destroyed: !bindImmediate };
            var originalInit_1 = target.ngOnInit;
            target.ngOnInit = function ngOnInit() {
                var _this = this;
                var dataBindings = Reflect.getMetadata(constance_1.REFLUX_DATA_BINDINGS_KEY, this);
                if (dataBindings != undefined && dataBindings.destroyed === true) {
                    dataBindings.subscriptions = dataBindings.subscriptions.concat(Object.keys(dataBindings.selectors)
                        .map(function (key) { return bindData(_this, key, dataBindings.selectors[key]); }));
                    dataBindings.destroyed = false;
                    Reflect.defineMetadata(constance_1.REFLUX_DATA_BINDINGS_KEY, dataBindings, this);
                }
                return originalInit_1 && originalInit_1.call(this);
            };
            var originalDestroy_1 = target.ngOnDestroy;
            target.ngOnDestroy = function ngOnDestroy() {
                var dataBindings = Reflect.getMetadata(constance_1.REFLUX_DATA_BINDINGS_KEY, this);
                if (dataBindings != undefined) {
                    dataBindings.subscriptions.forEach(function (subscription) { return subscription.unsubscribe(); });
                    dataBindings.subscriptions = [];
                    dataBindings.destroyed = true;
                    Reflect.defineMetadata(constance_1.REFLUX_DATA_BINDINGS_KEY, dataBindings, this);
                }
                return originalDestroy_1 && originalDestroy_1.call(this);
            };
        }
        bindingsMeta.selectors[propertyKey] = selector;
        if (bindImmediate) {
            bindingsMeta.subscriptions.push(bindData(target, propertyKey, selector));
        }
        Reflect.defineMetadata(constance_1.REFLUX_DATA_BINDINGS_KEY, bindingsMeta, target);
    };
}
exports.BindData = BindData;
//# sourceMappingURL=bind-data.js.map