let serializeObject = (obj: any) => {
    let serialization = "";
    let useConcatenation = false;

    for (let key in obj) {
        let member = obj[key];

        if (!member) {
            continue;
        }

        if(typeof member === "function") {
            continue;
        }
        
        let value = member.toString();
        if (useConcatenation) {
            serialization += "&";
        }
        let delta = key + "=" + value;
        let encodedDelta = encodeURI(delta);
        serialization += encodedDelta;
        useConcatenation = true;
    }
    return serialization;
};

let flattenRoutes = (routes : string[]) => {
    return routes.join(",");
};

let deserializeFragment = (fragment: string) : any => {
    let obj = {} as any;
    let parts = fragment.split("&");
    parts.map((part) => {
        var items = part.split("=");
        if(items.length >= 2) {
            let key = items[0];
            let value = items[1];
            let decodedKey = decodeURI(key);
            let decodedValue = decodeURI(value);
            obj[decodedKey] = decodedValue;
        }
    });
    return obj;
}

class RouteCallbacks {
    callbacksDictionary: { [id: string] : ((parameters : any) => void)[]};

    constructor() {
        this.callbacksDictionary = {} as { [id: string] : ((parameters : any) => void)[]};
    }

    add(routeId: string, callback : (parameters : any) => void) : void {
        let id = (routeId || "");
        if(!this.callbacksDictionary[id]){
            this.callbacksDictionary[id] = [];
        }

        this.callbacksDictionary[id].push(callback);
    }

    _get(routeId: string) : ((parameters : any) => void)[] {
        let id = (routeId || "");
        if(!this.callbacksDictionary[id]){
            return [];
        }

        return this.callbacksDictionary[id];
    }

    get(routeId :string) : ((parameters : any) => void)[] {
        routeId = routeId || "";
        let callbacks = [] as ((parameters : any) => void)[];
        for (let key in this.callbacksDictionary) {
            let startsWith = routeId.indexOf(key) == 0;
            if (startsWith) {
                callbacks = callbacks.concat(this._get(key));
            }
        }
        return callbacks;
    }

    getAllExcept(routeId :string) : ((parameters : any) => void)[] {
        routeId = routeId || "";
        let callbacks = [] as ((parameters : any) => void)[];
        for (let key in this.callbacksDictionary) {
            let startsWith = routeId.indexOf(key) == 0;
            if (!startsWith) {
                callbacks = callbacks.concat(this._get(key));
            }
        }
        return callbacks;
    }
}

export abstract class Route {
    abstract getRouteIds(): string[];

    hasRoute(routeString: string){
        return this.getRouteIds().indexOf(routeString) >= 0;
    }
    
    getFragement(): string {
        let _this = this as any;
        let data = {} as any;
        for(let key in _this) {
            data[key] = _this[key];
        }
        
        return serializeObject(data);
    }

    isMatching() {
        let fragment = Magellan.get().getFragment();
        var routeObject = deserializeFragment(fragment);            
        let currentRouteId = routeObject.routeId || routeObject.routeid || "";
        let routeIds = flattenRoutes(this.getRouteIds());
        return currentRouteId.indexOf(routeIds) == 0;
    }
}

export class ConcreteRoute extends Route {
    data: any;
    
    constructor(data:any = {}) {
        super();
        this.data = data;
        let _this = this as any;
        for(let key in data) {
            _this[key] = data[key];
        }
    }

    getRouteIds() {
        return this.data.routeId;
    }
}

export class RouteId extends Route {

    private routeId :string[];

    getRouteIds(): string[] {
        return this.routeId;
    }

    constructor(...routes: string[]) {
        super();
        this.routeId = routes;
    }
} 

export enum Mode {
    Hash,
    History,
    SessionStorage,
    LocalStorage,
}

export class Magellan {

    private static instance: Magellan;
    private static mode: Mode = Mode.Hash;

    private defaultRoute: Route;
    private routeCallbacks : RouteCallbacks;
    private negativeCallbacks : RouteCallbacks;
    private changeCallback : RouteCallbacks;
    private intervalId: number;
    private currentFragment: string;

    private constructor() {
        this.routeCallbacks = new RouteCallbacks();
        this.negativeCallbacks = new RouteCallbacks();
        this.changeCallback = new RouteCallbacks();
    }
    
    public get mode() : string {
        return this.mode;
    }

    static get(): Magellan {
        if (!this.instance) {
            this.instance = new Magellan();
        }

        return this.instance;
    }

    start() {
        this.checkRoute(true);
        this.intervalId = setInterval(() => {
            this.checkRoute();
        }, 50);
    }

    stop() {
        clearInterval(this.intervalId);
    }
    
    setDefaultRouteId(routeId: string) {
        this.defaultRoute = new RouteId(routeId);
    }
    
    setDefault(defaultRoute: Route) {
        this.defaultRoute = defaultRoute;
    }

    getCurrentRoute<T>(): T {
        var fragment = this.getFragment();
        var routeObject = deserializeFragment(fragment);
        var route = new ConcreteRoute(routeObject) as any;
        return route as T;
    }

    private checkRoute(force : boolean = false) {
        var fragment = this.getFragment();   
        if(force || fragment !== this.currentFragment) {
            var routeObject = deserializeFragment(fragment);            
            let routeId = routeObject.routeId || routeObject.routeid;
            let callbacksToExecute = this.routeCallbacks.get(routeId);
            let oldFragment = this.currentFragment;
            this.currentFragment = fragment;

            callbacksToExecute.map((callback) => {
                try {
                    callback(routeObject);
                } catch (e) {
                    console.error(e);
                }
            });

            let negativeCallbacks = this.negativeCallbacks.getAllExcept(routeId);

            negativeCallbacks.map((callback) => {
                try {
                    callback(routeObject);
                } catch (e) {
                    console.error(e);
                }
            });

            let changeCallbacks = this.changeCallback.get("");

            changeCallbacks.map((callback) => {
                try {
                    callback(routeObject);
                } catch (e) {
                    console.error(e);
                }
            });

            // console.log("Magellan", {
            //     oldFragment: oldFragment,
            //     currentFragment: this.currentFragment,
            //     callbacksToExecute: callbacksToExecute.length,
            //     negativeCallbacks: negativeCallbacks.length,
            //     changeCallbacks: changeCallbacks.length,
            //     activateDefault: callbacksToExecute.length == 0
            // });

            const noCallbackExecuted = callbacksToExecute.length == 0 && negativeCallbacks.length != 0;
            const emptyFragment = !this.currentFragment;
            if(noCallbackExecuted || emptyFragment) {
                this.goTo(this.defaultRoute);
            }
        }     
    }

    on<T extends Route>(type: (new () => T), callback: (route : T) => void) : void {
        let instance = new type();
        let routeId = instance.getRouteIds();

        if(!routeId) {
            console.error("A route implementation must have a default route Id specification");
            return;
        }

        this.routeCallbacks.add(flattenRoutes(routeId), (obj) => {
            callback(obj as T);
        });
    }

    onRouteChange(callback: (route : any) => void) : void {
        this.changeCallback.add("", (obj) => {
            callback(obj);
        });
    }

    onRouteId(routeId: string[], callback: (params : any) => void) : void {
        this.routeCallbacks.add(flattenRoutes(routeId), (obj) => {
            callback(callback);
        });
    }

    
    notOn<T extends Route>(type: (new () => T), callback: (route : T) => void, isDefault :boolean = false) : void {
        let instance = new type();
        let routeId = instance.getRouteIds();

        if(!routeId) {
            console.error("A route implementation must have a default route Id specification");
            return;
        }

        this.negativeCallbacks.add(flattenRoutes(routeId), (obj) => {
            callback(obj as T);
        });
    }

    notOnRouteId(routeId: string[], callback: (params : any) => void, isDefault :boolean = false) : void {
        this.negativeCallbacks.add(flattenRoutes(routeId), (obj) => {
            callback(callback);
        });
    }

    goTo<T>(route : T)  : void {
        let fragment = this.serializeObject(route);
        this.setFragment(fragment);
    }

    private serializeObject(obj : any) :string {
        return serializeObject(obj);
    }

    getFragment() : string {
        switch (Magellan.mode) {
            case Mode.Hash:
                let match = window.location.href.match(/#(.*)$/);
                let fragment = match ? match[1] : '';
                return fragment;
            case Mode.History:
                break;
            case Mode.LocalStorage:
                return (localStorage.getItem("Magellan_fragement") || "");
            case Mode.SessionStorage:
                return (sessionStorage.getItem("Magellan_fragement") || "");
        } 
    }

    private setFragment(fragment: string) {
        switch (Magellan.mode) {
            case Mode.Hash:
                window.location.hash = fragment;
                break;
            case Mode.History:
                break;
            case Mode.LocalStorage:
                localStorage.setItem("Magellan_fragement", fragment);
                break;
            case Mode.SessionStorage:
                sessionStorage.setItem("Magellan_fragement", fragment);
                break;
        } 
    }
}