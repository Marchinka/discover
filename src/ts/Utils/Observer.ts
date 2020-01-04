export default class Observer<TEventArguments> {

    private callbacks: ((args: TEventArguments) => void)[];

    constructor() {
        this.callbacks = [];
    }

    on(callback: ((args: TEventArguments) => void)) {
        this.callbacks.push(callback);
    }

    raise(args: TEventArguments) {
        this.callbacks.map((callback) => {
            callback(args);
        });
    }
}