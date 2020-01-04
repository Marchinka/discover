import Observer from "./Observer";

export default class ViewModel<TEntity> {
    private _value: TEntity;
    private observer: Observer<TEntity> = new Observer<TEntity>();

    constructor(entity: TEntity = null) {
        this._value = entity;
    }

    get value(): TEntity {
        return this._value;
    }

    set value(value: TEntity) {
        this._value = value;
        this.observer.raise(value);
    }

    onModelChange(callback : (entity: TEntity) => void){
        this.observer.on(callback);
        if(this.value) {
            callback(this.value);
        }
    }

    update() {
        this.observer.raise(this._value);
    }

    set(entity: TEntity) {
        let obj = entity as any;
        let value = this._value as any;
        for (let key in obj) {
            value[key] = obj[key];
        }
        this.value = value;
    }
}
