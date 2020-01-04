import React = require("react");
import Observer from "./Observer";

export interface State {
    show: boolean;
}

export interface Props {
    popupController: PopUpController;
}

export class PopUpController {
    onClose: Observer<{}> = new Observer<{}>();
    onOpen: Observer<{}> = new Observer<{}>();

    closePopUp(entity: any = {}) {
        this.onClose.raise(entity);
    }

    openPopUp(entity: any = {}) {
        this.onOpen.raise(entity);
    }
}

export class PopUp extends React.Component<Props, State> {

    constructor(props :any){
        super(props);
        this.state = {
            show: false
        } as State;
    }

    componentDidMount() {
        this.props.popupController.onOpen.on(() => {
            this.open();
        });

        this.props.popupController.onClose.on((e: any) => {
            if (!e.isProgrammatic) {
                this.close();
            }
        });
    }

    open() {
        this.setState({ show: true });
    }

    close() {
        this.props.popupController.onClose.raise({ isProgrammatic: true });
        this.setState({ show: false });
    }

    getStyle(): React.CSSProperties {
        return {
            "display": this.state.show ? "block" : "none"
        }
    }

    render() {
        return (
            <div className="modal" onClick={() => this.close()} style={this.getStyle()}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="close" onClick={() => this.close()}>&times;</span>
                {this.props.children}
              </div>
            </div>);
    }
}