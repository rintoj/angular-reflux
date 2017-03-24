import { Action } from './action'
import { Observable } from 'rxjs/Observable'
import { REFLUX_ACTION_KEY } from './constance'

declare var Reflect: any

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
export function BindAction() {

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {

    let metadata = Reflect.getMetadata('design:paramtypes', target, propertyKey)
    if (metadata.length < 2) throw new Error('BindAction: function must have two arguments!')

    let refluxActions = {}
    if (Reflect.hasMetadata(REFLUX_ACTION_KEY, target)) {
      refluxActions = Reflect.getMetadata(REFLUX_ACTION_KEY, target)
    }
    refluxActions[propertyKey] = metadata[1]
    Reflect.defineMetadata(REFLUX_ACTION_KEY, refluxActions, target)

    return {
      value: function (state: any, action: Action): Observable<any> {
        return descriptor.value.call(this, state, action)
      }
    }
  }
}