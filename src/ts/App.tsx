import * as React from "react";
import * as ReactDOM from "react-dom";
import { Events } from "./Components/Events";

class App extends React.Component<{}> {

    render() {
        return (<Events />);
    }
}


ReactDOM.render(<App />, document.getElementById("app-body"));