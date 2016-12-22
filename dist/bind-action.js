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
var core_1 = require('@angular/core');
// function BindAction(ActionClass?: any) {
//     // console.log('before', actionClass);
//     return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
//         // new ActionClass().subscribe(target[propertyKey], target);
//         debugger;
//     };
// }
var TodoStore = (function () {
    function TodoStore() {
    }
    // @BindAction(undefined)
    TodoStore.prototype.addTodo = function () {
        return undefined;
    };
    // @BindAction(undefined)
    TodoStore.prototype.removeTodo = function () {
        return undefined;
    };
    TodoStore = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], TodoStore);
    return TodoStore;
}());
exports.TodoStore = TodoStore;
//# sourceMappingURL=bind-action.js.map