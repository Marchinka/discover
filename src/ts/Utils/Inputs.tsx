import React = require("react");
import { NavigationComponent, Link } from "./Navigation";
import { Route, RouteId } from "./Magellan";
import { Dao } from "./Dao";
import Utils from "./Utils";
import Constants from "./Constants";
import ReactDOM = require("react-dom");
declare var $: any;

export interface InputChange {
    field: string;
    value: any;
    isUserChange: boolean;
}

interface State {
}

export interface SelectOption {
    id: any;
    name: string;
}

interface InputProps {
    model: any;
    name: string;
    disabled?: boolean;
    label: string;
    onChange: (inputChange : InputChange) => void;
}

interface SelectProps extends InputProps {
    options: SelectOption[];
}

export class InputSelect extends React.Component<SelectProps> {
    id: number;

    constructor(props: any) {
        super(props);
        this.state = {} as State;
    }

    componentDidMount() {
        this.setDefaultValue();
        this.initializePlugin();
    }

    componentDidUpdate() {
        let component = ReactDOM.findDOMNode(this);
        let $select = $(component).find("select");
        $select.trigger("chosen:updated");
    }
    
    private initializePlugin() {
        let component = ReactDOM.findDOMNode(this);
        let $select = $(component).find("select");
        $select.chosen({
            placeholder_text_single: "    "
        });
        let _this = this;
        $select.change(function (e: any) {
            _this.onChange(e);
        });
    }

    private setDefaultValue() {
        let component = ReactDOM.findDOMNode(this);
        let $select = $(component).find("select");
        let value = this.getValue();
        this.id = Math.random() * 10000;

        let hasValue = value;
        let hasOptions = (this.props.options || []).length > 0;
        
        if (!hasValue && hasOptions) {
            let firstValue = this.props.options[0];
            let inputChange = {
                field: this.props.name,
                value: firstValue.id,
                isUserChange: false
            } as InputChange;
            $select.trigger("chosen:updated");
            this.props.onChange(inputChange);
        }
    }

    onChange(e: any): void {
        let value = e.target.value;
        let inputChange = {
            field: this.props.name,
            value: value,
            isUserChange: true
        } as InputChange;
        this.props.onChange(inputChange);
    }

    getValue() : any {
        let value = this.props.model[this.props.name];
        if (value) {
            return value;
        } else {
            return "-1";
        }
    }

    private getInputId(): string {
        return this.props.name + "_" + this.id;
    }

    clear(): void {
        let component = ReactDOM.findDOMNode(this);
        let $select = $(component).find("select");
        let inputChange = {
            field: this.props.name,
            value: null,
            isUserChange: true
        } as InputChange;
        $select.trigger("chosen:updated");
        this.props.onChange(inputChange);
    }

    render() {
        return (<div className="field-container">
                <button disabled={this.props.disabled} className="clear-button" type="button" onClick={() => this.clear()}>&times;</button>
                <label htmlFor={this.getInputId()}>{this.props.label}</label>
                <select 
                    disabled={this.props.disabled}
                    placeholder=""
                    id={this.getInputId()} 
                    name={this.props.name} 
                    value={this.getValue()}
                    onChange={e => this.onChange(e)}>
                    <option value={"-1"}></option>
                    {(this.props.options || []).map(option => {
                        return (<option key={option.id + "_" + option.name} value={option.id}>{option.name}</option>);
                    })}
                </select>
            </div>);
    }
}


export class InputText extends React.Component<InputProps> {
    id: number;

    constructor(props: any) {
        super(props);
        this.state = {} as State;
        this.id = Math.random() * 10000;
    }

    componentDidMount() {
    }
    
    onChange(e: any): void {
        let value = e.target.value;
        let inputChange = {
            field: this.props.name,
            value: value,
            isUserChange: true
        } as InputChange;
        this.props.onChange(inputChange);
    }

    getValue() : any {
        let value = this.props.model[this.props.name];
        return value;
    }

    private getInputId(): string {
        return this.props.name + "_" + this.id;
    }

    clear(): void {
        let inputChange = {
            field: this.props.name,
            value: "",
            isUserChange: true
        } as InputChange;
        this.props.onChange(inputChange);
    }

    render() {
        return (<div className="field-container">
                <button disabled={this.props.disabled} className="clear-button" type="button" onClick={() => this.clear()}>&times;</button>
                <label htmlFor={this.getInputId()}>{this.props.label}</label>
                <input 
                    autoComplete="off"
                    disabled={this.props.disabled}
                    type="text"
                    id={this.getInputId()} 
                    name={this.props.name} 
                    value={this.props.model[this.props.name]}
                    onChange={e => this.onChange(e)}
                />
            </div>);
    }
}