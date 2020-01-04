import React = require("react");
import { Magellan, Mode, Route } from "./Magellan";
import ReactDOM = require("react-dom");

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
        this.state = {
            show: false
        } as any;
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
        this.setState({
            show: true
        } as any, () => {
            window.scrollTo(0,0);
        });
        this.onNavigation(magellan.getCurrentRoute<TRoute>());
    }

    private hide() {
        this.setState({
            show: false
        } as any);
        this.onCeaseNavigation();
    }

    abstract onNavigation(route : TRoute) : void;

    onCeaseNavigation() {

    }

    render () {
        let state = this.state as any;
        if (state.show) {
            return this.doRender();
        } else {
            return null;
        }
    }

    abstract doRender(): any;

    abstract getRoute() : Route;
}