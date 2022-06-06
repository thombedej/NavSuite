import React from 'react';
import Widget from '../Widget';
import { Accordion } from 'react-bootstrap';
import { CircleFlag as Flag } from 'react-circle-flags'
import { PARAMS_LIST } from '../../Pages/Dashboard/Dashboard';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';


const GNSS_LABEL = {
    'GP': <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}><Flag style={{ marginRight: '5px' }} countryCode={'us'} height="14" />GPS</span>,
    'GA': <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}><Flag style={{ marginRight: '5px' }} countryCode={'european_union'} height="14" />Galileo</span>,
    'GL': <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}><Flag style={{ marginRight: '5px' }} countryCode={'ru'} height="14" />GLONASS</span>,
    'GB': <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}><Flag style={{ marginRight: '5px' }} countryCode={'cn'} height="14" />BeiDou</span>,
}

const tdStyle = {
    display: 'flex',
    fontSize: '14px',
    // minHeight: '30px',
    // height:'37px',
    alignItems: 'center'
}
// const MAIN_GNSS = ['GPS 🇺🇸']

class StatusWidget extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            showInactive: false,
            expanded: true,
            inTransition: false,
            selected: ''
        }

        this.filterInactive = this.filterInactive.bind(this)
    }

    filterInactive(s) {
        if (this.state.showInactive)
            return true
        if (this.props.active.includes(s.prn))
            return true
        return false
    }

    getInactive() {
        return this.props.visible.filter(s => !this.props.active.includes(s.prn))
    }

    tdStyle = (state, value) => ({
        display: 'flex',
        fontSize: '14px',
        minHeight: '30px',
        alignItems: 'center',
        color: state.satsActive && state.satsActive.length && value !== 'N/A' ? '' : '#afafaf'
    })

    table = (states) => {
        return <Accordion flush style={{ width: '100%' }}>
            {
                PARAMS_LIST.filter(p => !p.chartOnly).map(({ name, label, display }, i) =>
                    label in this.props.exactValues ? <Accordion.Item key={`row_${i}`} eventKey={`row_${i}`}>
                        <Accordion.Header className="clickable" style={{
                            display: 'flex',
                            height: '37px'
                        }}>
                            <div style={{ width: 'calc((100% - 20px)*0.2)' }}>
                                <b style={tdStyle}>{name}</b>
                            </div>
                            {
                                states.map((state, j) =>
                                    <div style={{ flex: 1 }} key={`table_cell_${i}_${j}`}>
                                        <span style={this.tdStyle(state, display(state[label]))}>
                                            {display(state[label])}
                                        </span>
                                    </div>
                                )
                            }
                        </Accordion.Header>
                        <Accordion.Body style={{ padding: '5px 40px 5px 20px', backgroundColor: '#f7f7f7' }}>
                            <div style={tdStyle} key={`extra_row_${i}`}>
                                <div style={{ width: '20%' }}>
                                    <b style={tdStyle}>Expected</b>
                                </div>
                                {
                                    states.map((state, j) => {
                                        return <div style={{ flex: 1 }} key={`table_cell_${i}_${j}`}>
                                            <span style={this.tdStyle(state)}>
                                                {display(this.props.exactValues[label])}
                                            </span>
                                        </div>
                                    })
                                }
                                <div style={{ margin: 'auto' }}></div>
                            </div>
                            {
                                [
                                    { name: 'Sigma', key: 'std' },
                                    { name: 'Mean', key: 'mean' }
                                ].map((row, i) => <div style={tdStyle} key={`extra_row_${i}`}>
                                    <div style={{ width: '20%' }}>
                                        <b style={tdStyle}>{row.name}</b>
                                    </div>
                                    {
                                        states.map((state, j) => {
                                            return <div style={{ flex: 1 }} key={`table_cell_${i}_${j}`}>
                                                <span style={this.tdStyle(state)}>
                                                    {display(state[`${label}_${row.key}`])}
                                                </span>
                                            </div>
                                        })
                                    }
                                    <div style={{ margin: 'auto' }}></div>
                                </div>)
                            }
                        </Accordion.Body>
                    </Accordion.Item> : <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        height: '37px',
                        padding: '16px 20px 16px 20px',
                        position: 'relative',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.125)'
                    }}>
                        <div style={{ width: '20%' }}>
                            <b style={tdStyle}>{name}</b>
                        </div>
                        {
                            states.map((state, j) =>
                                <div style={{ flex: 1 }} key={`table_cell_${i}_${j}`}>
                                    <span style={this.tdStyle(state)}>{
                                        display(state[label])
                                    }</span>
                                </div>
                            )
                        }
                        <div style={{ marginLeft: 'auto', width: '20px', height: '20px' }} />
                    </div>
                )
            }
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                height: '37px',
                padding: '16px 20px 16px 20px',
                position: 'relative',
                alignItems: 'center',
                borderBottom: '1px solid rgba(0, 0, 0, 0.125)'
            }}>
                <div style={{ width: '20%' }}>
                    <b style={tdStyle}>Active Satellites</b>
                </div>
                {
                    states.map((state, j) =>
                        <div style={{ flex: 1 }} key={`table_cell_sats_${j}`}>
                            <span style={this.tdStyle(state)}>
                                {state.satsActive.length} / {state.satsVisible.length}
                            </span>
                        </div>
                    )
                }
                <div style={{ marginLeft: 'auto', width: '20px', height: '20px' }} />
            </div>
        </Accordion>
    }

    getValues(data, key) {
        return data.map(item => item[key])
    }

    getStandardDeviation = (mean, values) => Math.sqrt(
        values
            .map(x => Math.pow(x - mean, 2))
            .reduce((a, b) => a + b, 0) / values.length
    )

    getMean = (values) => values.reduce((a, b) => a + b, 0) / values.length

    calculateExtra = (states) => {
        ['lat', 'lon', 'alt', 'speed', 'vdop'].forEach(key => {
            states = states.map(state => {
                if (this.props.data && this.props.data[state.label]) {
                    let values = this.getValues(this.props.data[state.label], key).filter(v => v)
                    let mean = this.getMean(values)
                    let std = this.getStandardDeviation(mean, values)

                    return {
                        ...state,
                        [`${key}_expected`]: 0,
                        [`${key}_mean`]: mean ? Math.round(mean) : 'N/A',
                        [`${key}_std`]: std ? Math.round(std) : 'N/A'
                    }
                }

                return state

            });
        });

        return states
    }

    render() {
        return <Widget
            widgetKey={this.props.widgetKey}
            removeItem={this.props.removeItem}
            title="Current Status"
            style={{
                width: this.props.width ? this.props.width : '100%',
                height: this.props.height ? this.props.height : '100%',
                float: 'left'
            }}>
            <div style={{
                position: 'relative',
                height: '100%',
                overflowY: 'hidden',
                fontSize: '14px'
            }}>

                <SimpleBar style={{ marginTop: '37px', height: 'calc(100% - 30px)' }}>
                    {
                        this.table(this.props.status)
                    }
                </SimpleBar>


                <div style={{
                    width: '100%',
                    // borderBottomStyle: 'solid',
                    borderBottomWidth: '1px',
                    boxShadow: '0px 7px 10px -8px rgba(0,0,0,0.5)',
                    padding: '0px 40px 0px 20px',
                    // marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    // zIndex: 999,
                    position: 'absolute',
                    top: '0px'
                }}>
                    <div id="gnss_flags" style={{ width: '20%', display: 'inline-block' }}></div>
                    {
                        this.props.status.length ? this.props.status.map(
                            (state, i) => <div style={{
                                flex: 1,
                                display: 'inline-block',
                                paddingBottom: '10px'
                            }} key={`tab_header_${i}`}>
                                {GNSS_LABEL[state.gnss_type]}
                            </div>
                        ) : <div style={{ width: '100%', color: 'gray', textAlign: 'start', paddingBottom: '10px' }}><i>No active receivers.</i></div>
                    }
                    <div style={{ marginLeft: 'auto' }}></div>
                </div>
            </div>
        </Widget>
    }
}

export default StatusWidget;