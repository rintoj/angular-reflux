import { Injectable } from '@angular/core';

// function BindAction(ActionClass?: any) {

//     // console.log('before', actionClass);

//     return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
//         // new ActionClass().subscribe(target[propertyKey], target);
//         debugger;
//     };
// }

@Injectable()
export class TodoStore {

    // @BindAction(undefined)
    addTodo() {
        return undefined;
    }

    // @BindAction(undefined)
    removeTodo() {
        return undefined;
    }
}