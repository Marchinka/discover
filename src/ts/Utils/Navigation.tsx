import React = require("react");
import { Magellan, Mode, Route } from "./Magellan";
import ReactDOM = require("react-dom");

export interface NavigationState {
    show: boolean;
}

export interface NavigationProps {
    routeId: string;
}

interface LinkProperties {
    target?: string;
    className?: string;
    route: Route;
    clicked?: boolean;
}

export class Link extends React.Component<LinkProperties> {

    onLinkClick(e :any): void {
        e.preventDefault();
        Magellan.get().goTo(this.props.route);
    }

    render() {
        return (<a href="" onClick={(e) => this.onLinkClick(e)} target={this.props.target} className={this.props.className}>{this.props.children}</a>);
    }
}

export abstract class NavigationComponent<
    TRoute extends Route, 
    TProps,
    TState> 
     extends React.Component<TProps, TState> {

    constructor(props :any) {
        super(props);
    }

    componentDidMount() {
        var magellan =  Magellan.get();
        var routeDummy = this.getRoute();

        magellan.onRouteId(routeDummy.getRouteIds(), () => {
            this.display(magellan);
        });

        magellan.notOnRouteId(routeDummy.getRouteIds(), () => {
            this.hide();
        });

        var currentRoute = magellan.getCurrentRoute<TRoute>();
        if (routeDummy.getRouteIds() == currentRoute.getRouteIds()) {
            this.display(magellan);
        } else {
            this.hide();
        }  
    }

    private display(magellan: Magellan) {
        const node = ReactDOM.findDOMNode(this) as any;
        node.style.display = "block";
        this.onNavigation(magellan.getCurrentRoute<TRoute>());
        window.scrollTo(0,0);
    }

    private hide() {
        const node = ReactDOM.findDOMNode(this) as any;
        this.onCeaseNavigation();
        node.style.display = "none";
    }

    abstract onNavigation(route : TRoute) : void;

    onCeaseNavigation() {

    }

    abstract render(): any;

    abstract getRoute() : Route;
}