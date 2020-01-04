import React = require("react");

interface Props {
    if: boolean;
}

export class Show extends React.Component<Props>
{
    render() {
        if (this.props.if) {
            return this.props.children;
        }
        return (null);
    }
}