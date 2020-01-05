import * as React from "react";
import * as ReactDOM from "react-dom";
import * as moment from "moment";
import { Dao } from "../Utils/Dao";

declare var $: any;
declare var window: any;

interface State {
    logs: AppLog[];
}

interface Props {
    
}

interface AppLog {
    _id: string;
    engine: string;
    events_count: number;
    is_successful: boolean;
    last_run: number;
}

export class Side extends React.Component<Props, State> {
    dao: Dao;

    constructor(props: Props) {
        super(props);
        this.state = { logs: [] };
        this.dao = new Dao("/");
    }

    componentDidMount() {
        this.getLogs();
        this.runScraping();
    }

    getLogs() {
        let self = this;
        self.setState({ logs: [] }, () => {
            self.dao.send({
                url: "/logs",
                method: "GET"
            }, (response) => {
                self.setState({
                    logs: response.data
                });
            });
        });
    }

    runScraping() {
        let self = this;
        self.setState({ logs: [] }, () => {
            self.dao.send({
                url: "/run_scraping",
                method: "GET"
            }, (response) => {
            });
        });
    }

    private getIcon(log: AppLog) {
        let hasFoundElements = log.events_count > 0;

        if (log.is_successful && hasFoundElements) {

            return <i className="log-icon fas fa-check-circle green"></i>;

        } else if (!log.is_successful && hasFoundElements) {

            return <i className="log-icon fas fa-exclamation-triangle yellow"></i>;
            
        } else {

            return <i className="log-icon fas fa-radiation-alt reg"></i>;

        }
    }

    render() {
        return (<div>
                    {(this.state.logs || []).map((log) => {
                        return (<div key={log._id}>
                            <a href="#contact" className="w3-bar-item w3-button w3-padding">
                                <div>{this.getIcon(log)}{log.engine}</div>
                                <div>
                                    <span className="log-details"><strong>{log.events_count} events</strong> {moment.unix(log.last_run).format("DD/MM/YYYY")}</span>
                                </div>  
                            </a>
                        </div>);
                    }, this)}
            </div>);
    }
}