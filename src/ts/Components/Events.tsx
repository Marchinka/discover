import * as React from "react";
import * as ReactDOM from "react-dom";
import * as moment from "moment";
import { Dao } from "../Utils/Dao";

declare var $: any;
declare var window: any;
declare var location: any;

interface State {
    events: AppEvent[];
    start_date: number;
    end_date: number;
}

interface Props {
    
}

interface AppEvent {
    _id: string;
    title: string;
    location: string;
    link: string;
    description: string;
    start_date: string;
    end_date: string;
}

export class Events extends React.Component<Props, State> {
    dao: Dao;

    constructor(props: Props) {
        super(props);
        this.state = { events: [], start_date: null, end_date: null };
        this.dao = new Dao("/");
    }

    componentDidMount() {
        let component = ReactDOM.findDOMNode(this);
        let self = this;
        let startDate = moment();
        let endDate = moment().add(6, 'month');

        self.setState({
            start_date: startDate.unix(),
            end_date: endDate.unix()
        }, () => {
            this.getEvents();
        });
        
		$(component).find('input[name="dateRange"]').daterangepicker({
            startDate: startDate,
            endDate: endDate,
			ranges: {
				'Today': [moment(), moment()],
				'Tomorrow': [moment().add(1, 'days'), moment().add(1, 'days')],
				'Next 7 Days': [moment(), moment().add(6, 'days')],
				'This Month': [ moment(), moment().add(1, 'month')],
				'Next Month':[moment().add(1, 'month'), moment().add(2, 'month')],
			},
			opens: 'right',
			locale: {
				format: 'DD/MMM/YYYY'
			}
		}, function (start: any, end: any, label: any) {
			self.setState({
                start_date: start.unix(),
                end_date: end.unix()
			}, () => {
                self.getEvents();
			});
		});
    }

    getEvents() {
        let self = this;
        let url = "/events";

        if (this.state.start_date && this.state.end_date) {
            url = url + "?start_date=" + this.state.start_date + "&end_date=" + this.state.end_date;
        }
        else if (this.state.start_date) {
            url = url + "?start_date=" + this.state.start_date;
        }
        else if (this.state.end_date) {
            url = url + "?end_date=" + this.state.end_date;
        }

        self.setState({ events: [] }, () => {
            self.dao.send({
                url: url,
                method: "GET"
            }, (response) => {
                self.setState({
                    events: response.data
                });
            });
        });
    }

    getFormattedDate(timestamp: any) {
        let dateString = moment.unix(timestamp).format("DD/MM/YYYY");
        return dateString;
    }

    getTimeSpan(event: AppEvent) {
        if (event.end_date == event.start_date) {
            return this.getFormattedDate(event.start_date)
        } else {
            return this.getFormattedDate(event.start_date) + " - " + this.getFormattedDate(event.end_date);
        }
    }

    openMenu(): void {
        window.w3_open();
    }

    render() {
        return (<div>
            <header id="portfolio">
              <a href="" onClick={() => location.reload()}>
                  <img  src="/img/big-icon.png" 
                        style={{width:"65px"}}
                        className="w3-right w3-margin w3-hide-large w3-hover-opacity" />
            </a>
              <span className="w3-button w3-hide-large w3-xxlarge w3-hover-text-grey" onClick={() => this.openMenu()}><i className="fa fa-bars"></i></span>
              <div className="w3-container">
              <h1><b className="title">Instage Events</b></h1>
              <div className="w3-section w3-bottombar w3-padding-16">
                <span className="w3-margin-right">Filter:</span> 
                <input 
                    className="dateFilter" 
                    type="text" 
                    name="dateRange" />
              </div>
              </div>

              </header>
              
                <div className="w3-row-padding">
                    {(this.state.events || []).map((event) => {
                        return (<a className="w3-third w3-container w3-margin-bottom event-link" href={event.link} key={event._id} target="_blank">
                                    <div className="w3-container event-card">
                                        <p className="title"><b>{event.title}</b></p>
                                        <div className="fs-12px sub-title">
                                            <span><b>{event.location}</b>&nbsp;</span>
                                        </div>
                                        <div className="fs-12px">
                                            <span><b>{this.getTimeSpan(event)}</b>&nbsp;</span>
                                        </div>
                                        <div className="description-container">
                                            {event.description && <p className="description">{event.description}</p>}

                                            {!event.description && <div className="filler">
                                                <i className="fas fa-theater-masks filler-icon"></i>
                                            </div>}
                                        </div>
                                    </div>
                                </a>);
                    }, this)}
                </div>
            </div>);
    }
}