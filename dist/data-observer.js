"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        // implementation will be injected by @BindAction
    };
    DataObserver.prototype.ngOnDestroy = function () {
        // implementation will be injected by @BindAction
    };
    return DataObserver;
}());
exports.DataObserver = DataObserver;
//# sourceMappingURL=data-observer.js.map