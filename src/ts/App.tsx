import * as React from "react";
import * as ReactDOM from "react-dom";
import { Events } from "./Components/Events";
import { Side } from "./Components/Side";

class AppMain extends React.Component<{}> {

    render() {
        return (<Events />);
    }
}

class AppSide extends React.Component<{}> {

  render() {
      return (<Side />);
  }
}

ReactDOM.render(<AppMain />, document.getElementById("app-body"));
ReactDOM.render(<AppSide />, document.getElementById("app-side"));