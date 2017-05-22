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