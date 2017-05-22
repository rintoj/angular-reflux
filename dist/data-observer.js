"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constance_1 = require("./constance");
var bind_data_1 = require("./bind-data");
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
var DataObserver = (function () {
    function DataObserver() {
    }
    DataObserver.prototype.ngOnInit = function () {
        var _this = this;
        var dataBindings = Reflect.getMetadata(constance_1.REFLUX_DATA_BINDINGS_KEY, this);
        if (dataBindings != undefined && dataBindings.destroyed === true) {
            dataBindings.subscriptions = dataBindings.subscriptions.concat(Object.keys(dataBindings.selectors)
                .map(function (key) { return bind_data_1.bindData(_this, key, dataBindings.selectors[key]); }));
            dataBindings.destroyed = false;
            Reflect.defineMetadata(constance_1.REFLUX_DATA_BINDINGS_KEY, dataBindings, this);
        }
    };
    DataObserver.prototype.ngOnDestroy = function () {
        var dataBindings = Reflect.getMetadata(constance_1.REFLUX_DATA_BINDINGS_KEY, this);
        if (dataBindings != undefined) {
            dataBindings.subscriptions.forEach(function (subscription) { return subscription.unsubscribe(); });
            dataBindings.subscriptions = [];
            dataBindings.destroyed = true;
            Reflect.defineMetadata(constance_1.REFLUX_DATA_BINDINGS_KEY, dataBindings, this);
        }
    };
    return DataObserver;
}());
exports.DataObserver = DataObserver;
//# sourceMappingURL=data-observer.js.map