"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constance_1 = require("./constance");
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
        if (Reflect.hasMetadata(constance_1.REFLUX_ACTION_KEY, target)) {
            refluxActions = Reflect.getMetadata(constance_1.REFLUX_ACTION_KEY, target);
        }
        refluxActions[propertyKey] = metadata[1];
        Reflect.defineMetadata(constance_1.REFLUX_ACTION_KEY, refluxActions, target);
        return {
            value: function (state, action) {
                return descriptor.value.call(this, state, action);
            }
        };
    };
}
exports.BindAction = BindAction;
//# sourceMappingURL=bind-action.js.map