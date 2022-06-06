import GPS from 'gps';
import React from 'react';
import { Card } from 'react-bootstrap';
import { BiPause, BiPlay } from 'react-icons/bi';
import { Slider } from '@mui/material';
import _ from 'lodash';

class FileStream extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            inputStream: null,
            duration: 0,
            second: 0,
        }
    }

    componentCleanup() {
        clearInterval(this.state.inputStream)
    }

    componentWillUnmount() {
        this.componentCleanup();
        window.removeEventListener('beforeunload', this.componentCleanup);
    }

    componentDidMount() {
        // console.log(this.props.src)
        // console.log(this.props.da)

        window.addEventListener('beforeunload', this.componentCleanup);

        this.props.setLoadingPage(true)
        this.nmeaFromFile(this.props.src.content)
    }

    componentWillReceiveProps(newProps) {
        if (newProps.src.content !== this.props.src.content) {
            clearInterval(this.state.inputStream)
            this.setState({
                duration: 0,
                second: 0
            })
            this.props.setLoadingPage(true)
            this.nmeaFromFile(newProps.src.content)
        }
    }

    getStandardDeviation = (mean, values) => Math.sqrt(
        values
            .map(x => Math.pow(x - mean, 2))
            .reduce((a, b) => a + b, 0) / values.length
    )

    stateFromMessages(messages) {
        let tracker = new GPS();
        let sats = [];
        let gnss = messages[0].slice(1, 3)

        messages.forEach(message => {
            tracker.update(message)

            if (message.slice(3, 6) === 'GSV') {
                sats = [...sats, ...GPS.Parse(message).satellites]
            }
        })

        return {
            ...tracker.state,
            gnss_type: gnss,
            satsVisible: sats.map(sat => ({
                ...sat,
                active: _.includes(tracker.state.satsActive, sat.prn),
                prn: gnss === 'GL' ? sat.prn - 64 : sat.prn,
                gnss: gnss
            })),
            satsActive: _.map(tracker.state.satsActive, prn => gnss === 'GL' ? prn - 64 : prn),
            messages: messages
        }
    }

    readLines(lines) {
        let data = _.chain(lines)
            .groupBy(line => line.slice(1, 3))
            .map(lines =>
                lines.reduce((prev, acc) => {
                    let last = _.last(prev)

                    return acc.slice(3, 6) === 'RMC' || _.last(last).slice(3, 6) === 'ZDA' ?
                        [...prev, [acc]] :
                        [...prev.slice(0, -1), [...last, acc]]
                }, [])
                    .filter(
                        messages => _.some(messages, message => message.match(/\$G.(?:ZDA|RMC|GGA),[0-9\.]+,/))
                    )
                    .map(
                        messages => this.stateFromMessages(messages)
                    )
            )
            .filter(states => states.length)
            .map(states =>
                states.map((state, i) => {
                    _.forEach(['lat', 'lon', 'alt', 'speed'], (attr) => {
                        let values = states.slice(0, i).map(state => state[attr]).filter(v => v)
                        let sum = _.sum(values)
                        let mean = sum / i

                        state[attr + '_mean'] = values.length ? mean : undefined
                        state[attr + '_std'] = values.length ? this.getStandardDeviation(mean, values) : undefined
                    })

                    return state
                })
            )
            .value()

        return data
    }

    nmeaFromFile(text) {
        let data = this.readLines(text)

        // gnss systems present in NMEA file
        let start = _.chain(data).map(states => states[0].time).min().value()
        let end = _.chain(data).map(states => _.last(states).time).max().value()
        let duration = (end - start) / 1000

        console.log(data)
        console.log(start);
        console.log(end);

        this.setState({
            data: data,
            start: start,
            end: end,
            duration: duration - 1,
            inputStream: setInterval(() => {
                if (!this.state.paused)
                    this.nextSecond()
            }, 1000),
            paused: false
        })
    }

    nextSecond = () => {
        let nextSec = this.state.second + 1
        if (nextSec === this.state.duration) {
            this.setState({
                paused: true
            })
            return
        }
        this.props.setLoadingPage(false)

        this.setState({
            second: nextSec
        })
    }

    handlePlayPause = () => {
        this.setState({
            paused: !this.state.paused
        })
    }

    handleMoveHandle = (value) => {
        this.setState({
            second: value,
            paused: true
        })
    }

    categorizeStates = (stateLists) => stateLists.reduce(
        (acc, list) => ({ ...acc, [list[0].gnss_type]: list })
        , {})

    componentDidUpdate(prevProps, prevState) {
        if (prevState.second !== this.state.second) {
            // let i = this.state.data.findIndex(e => e.time === this.state.second)
            let indices = _.map(this.state.data, states => {
                let seconds = states.findIndex(
                    state => state.time.getTime() >= (this.state.start.getTime() + this.state.second * 1000)
                )
                return seconds > 0 ? seconds - 1 : 0
            })

            let data = _.zip(this.state.data, indices).map(
                ([states, index]) => states.slice(0, index + 1)
            )
            let navStates = data.map(states => _.last(states))

            this.props.updateData(
                {
                    states: navStates,
                    satellites: [],
                    messages: navStates.map(state => state['messages']).flat()
                },
                this.categorizeStates(data),
                this.state.second,
                this.state.duration,
                this.state.start
            )
        }
    }


    render() {
        return (
            <div style={{
                width: '530px',
                height: '100%',
                // borderWidth: '0px',
                padding: '10px',
                fontSize: '14px',
                // boxShadow: '3px 3px 9px 2px rgba(0,0,0,0.05)',
                display: 'flex',
                // borderRadius: '7px',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                overflow: 'hidden'
            }}>
                <div style={{ width: '320px', marginLeft: '20px', marginRight: '20px', display: 'flex', alignItems: 'center' }}>
                    <Slider
                        min={0}
                        max={this.state.duration}
                        value={this.state.second}
                        color='secondary'
                        onChange={e => {
                            this.handleMoveHandle(parseInt(e.target.value))
                        }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '50px', height: '100%' }}>
                    {
                        this.state.paused ?
                            <BiPlay className="clickable lightenOpacity" size={35} onClick={this.handlePlayPause} /> :
                            <BiPause className="clickable lightenOpacity" size={35} onClick={this.handlePlayPause} />
                    }
                </div>

                <div style={{ width: '160px', display: 'flex', justifyContent: 'center', fontSize: '12px' }}>
                    {new Date(this.state.second * 1000).toISOString().slice(11, 19)} / {new Date(this.state.duration * 1000).toISOString().slice(11, 19)}
                </div>
            </div>
        )
    }
}

export default FileStream;

