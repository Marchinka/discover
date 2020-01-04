import React = require("react");
import Observer from "./Observer";

interface Props {
}

interface State {
    show: boolean;
}

export class LoaderManager {
    private static controller: LoaderController;

    static getController() {
        if (!this.controller) {
            this.controller = new LoaderController();
        }

        return this.controller;
    }
}

class LoaderController {
    showObserver: Observer<{}> = new Observer<{}>();
    hideObserver: Observer<{}> = new Observer<{}>();
    timeoutId: number;

    onShow(callback: () => void) {
        this.showObserver.on(callback);
    }

    onHide(callback: () => void) {
        this.hideObserver.on(callback);
    }

    show(waitTime: number = 0) {
        if (waitTime == 0) {
            this.showObserver.raise({});
        } else {
            if (!this.timeoutId) {
                this.timeoutId = setTimeout(() => {
                    this.showObserver.raise({});
                    this.timeoutId = null;
                }, waitTime);
            }
        }
    }

    hide () {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
        this.hideObserver.raise({});
    }
}

export class Loader extends React.Component<Props, State> {

    constructor (props :any) {
        super(props);
        this.state = { show: false };
    }

    componentDidMount() {
        LoaderManager.getController().onShow(() => {
            this.setState({ show: true });
        });
        LoaderManager.getController().onHide(() => {
            this.setState({ show: false });
        });
    }

    getLoaderStyle() {
        if (this.state.show) {
            return { display: "block" };
        } else {
            return { display: "none" };
        }
    }

    render() {
        return (<div className="modal" style={this.getLoaderStyle()}>
            <div className="loader-div">
                <div className="container">
                    <div className="cell">
                        <div className="loader">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        </div>
                    </div>
                </div>
            </div>
    </div>);
    }
}

let win = window as any;
win.showLoader = () => {
    LoaderManager.getController().show();
};
win.hideLoader = () => {
    LoaderManager.getController().hide();
};