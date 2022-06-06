import React from 'react';
import { Form } from 'react-bootstrap';
import Widget from '../Widget';

const nmeaTypes = ['GGA', 'RMC', 'GSA', 'GSV', 'GLL']

class FeedWidget extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            nmeaFilters: nmeaTypes
        }
    }

    nmeaType = (msg) => {
        return msg.slice(3, 6)
    }

    handleNmeaCheck(tag) {
        if (this.state.nmeaFilters.includes(tag)) {
            let updated = this.state.nmeaFilters.filter(t => t !== tag)
            this.setState({
                nmeaFilters: updated
            })
        } else {
            let updated = [...this.state.nmeaFilters, tag]
            this.setState({
                nmeaFilters: updated
            })
        }
    }

    scrollToBottom = () => {
        // this.messagesEnd.scrollIntoView(
        //     { behavior: "smooth" }
        // );
    }

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    render() {
        return <Widget style={{
            width:
                this.props.width,
            height: '300px',
            float: 'left'
        }} title={
            <div>
                NMEA feed

                <Form.Group style={{ fontSize: '14px', float: 'right', marginRight: '50px' }}>
                    {
                        nmeaTypes.map(t =>
                            <Form.Check
                                key={`check_${t}`}
                                checked={this.state.nmeaFilters.includes(t)}
                                onChange={e => { this.handleNmeaCheck(t) }}
                                style={{ textAlign: 'center' }}
                                type="checkbox"
                                label={t}
                                inline
                            />
                        )
                    }
                </Form.Group>
            </div>
        }>
            <div style={{
                fontSize: '13px',
                padding: '5px',
                overflowY: 'scroll',
                width: '100%',
                height: '100%',
                position: 'relative'
            }}>
                {
                    this.props.nmeaFeed.filter(
                        line => this.state.nmeaFilters.includes(this.nmeaType(line))
                    ).map((line, i) =>
                        <span key={`feed_${i}`} style={{ display: 'block' }}><b>{line.slice(0, 6)}</b>{line.slice(6)}</span>
                    )
                }
                <div style={{ float: "left", clear: "both" }}
                    ref={(el) => { this.messagesEnd = el; }}>
                </div>
            </div>
        </Widget>
    }
}

export default FeedWidget;