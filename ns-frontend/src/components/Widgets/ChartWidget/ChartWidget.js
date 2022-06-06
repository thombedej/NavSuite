import './ChartWidget.scss';
import React from 'react';
import Widget from '../Widget';
import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Chart2 from './Chart2';
import {
    GNSS_INFO_LIST,
    PARAMS_LIST,
    WEATHER_PARAMS,
    WEATHER_PARAMS_LIST
} from '../../Pages/Dashboard/Dashboard';
import _ from 'lodash';

const intervals = [
    { val: 5, label: '5M' },
    { val: 30, label: '30M' },
    { val: 60, label: '1H' },
    { val: 300, label: '5H' },
    { val: 1440, label: '1D' },
]

const widths = {
    1: [100],
    2: [100, 100],
    3: [100, 50, 50],
    4: [50, 50, 50, 50]
}

export const CUSTOM_PARAMS_LIST = [
    {
        label: 'lat_diff',
        name: 'Latitude error',
        value: (s, a) => distance(s.lat, a.lon, a.lat, a.lon, 'M'),
        display: (v) => `${parseFloat(v).toFixed(3)}m`
    },
    {
        label: 'lon_diff',
        name: 'Longitude error',
        value: (s, a) => distance(a.lat, s.lon, a.lat, a.lon, 'M'),
        display: (v) => `${parseFloat(v).toFixed(3)}m`
    },
    {
        label: 'alt_diff',
        name: 'Altitude error',
        value: (s, a) => s.alt !== null && s.alt !== undefined ? Math.abs(s.alt - a.alt) : null,
        display: (v) => `${parseFloat(v).toFixed(3)}m`
    },
    {
        label: 'pos_diff',
        name: '2D Position error',
        value: (s, a) => distance(s.lat, s.lon, a.lat, a.lon, 'M'),
        display: (v) => `${parseFloat(v).toFixed(3)}m`
    },
    {
        label: 'total_diff',
        name: '3D Position error',
        value: (s, a) => {
            if (
                s.alt === undefined || s.alt === null
            ) return distance(s.lat, s.lon, a.lat, a.lon, 'M');
            return Math.sqrt(
                Math.pow(distance(s.lat, s.lon, a.lat, a.lon, 'M'), 2) + Math.pow(Math.abs(s.alt - a.alt), 2)
            )
        },
        display: (v) => `${parseFloat(v).toFixed(3)}m`
    }
]

export const CUSTOM_PARAMS = ['lat_diff', 'lon_diff', 'alt_diff', 'pos_diff', 'total_diff']

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    if ([lat1, lon1, lat2, lon2].some(p => p === undefined || p === null)) {
        return null;
    }
    else {
        console.log(lat1, lon1, lat2, lon2)
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") { dist = dist * 1.609344 }
        if (unit == "M") { dist = dist * 1609.344 }
        if (unit == "N") { dist = dist * 0.8684 }
        return dist;
    }
}


class ChartWidget extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            charts: 1,
            modeIndex: props.mode,
            gnss: ['GP', 'GL', 'GA', 'GB'],
            modes: [
                ...PARAMS_LIST.filter(p => p.extra),
                ...CUSTOM_PARAMS_LIST,
                ...WEATHER_PARAMS_LIST
            ]
        }
    }

    toggleDual = () => {
        this.setState({
            dual: !this.state.dual
        })
    }

    charts(q) {
        return (
            [1, 2, 3, 4].map(e =>
                <Chart2
                    key={`chart_${e}`}
                    height={q > 1 ? '50%' : '100%'}
                    width={`calc(${widths[q][e - 1]}% - 2px)`}
                    style={{ float: 'left', display: e > this.state.charts ? 'none' : '' }}
                    handleIntervalChange={this.handleIntervalChange}
                    data={this.props.data}
                />
            )
        )
    }

    mode() {
        return this.state.modes[this.state.modeIndex]
    }

    exactValue = () => this.props.exactValues

    handleCheckboxClick = (label) => {
        this.setState(prev => ({
            gnss: prev.gnss.includes(label) ?
                prev.gnss.filter(l => l !== label) :
                [...prev.gnss, label]
        }))
    }

    render() {
        return <Widget
            widgetKey={this.props.widgetKey}
            removeItem={this.props.removeItem}
            // loaing={false}
            loading={this.props.loading}
            title={
                <div className="ChartWidget" style={{
                    // height: '31px',
                    display: 'flex',
                    alignItems: 'center',
                    // boxShadow: '0px 7px 10px -8px rgba(0,0,0,0.5)',
                    // paddingBottom:'5px'
                }}>
                    <div style={{ marginRight: '10px' }}>
                        Chart
                    </div>

                    <Form.Select
                        size='sm'
                        className='clickable'
                        onChange={e => { this.setState({ modeIndex: e.target.value }); this.forceUpdate(); }}
                        style={{
                            fontSize: '14px',
                            width: '150px',
                            zIndex: 3,
                            // backgroundColor: '#f9f9f9',
                            // lineHeight:'14px',
                            // borderStyle: 'none',
                            borderColor: '#f4f4f4',
                            // borderBottomStyle: 'solid',
                            // borderRadius: '0',
                            // borderBottomWidth:'2px'
                        }}
                        value={this.state.modeIndex}
                    >
                        {
                            this.state.modes.map((m, i) =>
                                <option
                                    disabled={
                                        m.label in WEATHER_PARAMS && !this.props.weatherData
                                    }
                                    key={`select_charts_${m.label}`}
                                    value={i}
                                >{m.name}</option>
                            )
                        }
                    </Form.Select>

                    <div style={{
                        margin: 'auto',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        width: '250px',
                        height: '24px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        visibility: this.mode().label in WEATHER_PARAMS ? 'hidden' : 'visible'
                    }}>
                        {
                            GNSS_INFO_LIST.map(gnss =>
                                <OverlayTrigger
                                    placement='bottom'
                                    overlay={<Tooltip id='tooltip-chart-gnss-filter'>
                                        Filter <b>{gnss.name}</b> data.
                                    </Tooltip>}>
                                    <div
                                        onClick={e => this.handleCheckboxClick(gnss.label)}
                                        className="noselect clickable lightenOpacity"
                                        key={`chart_checkbox_${gnss.label}`}
                                        style={{
                                            width: '25%',
                                            height: '100%',
                                            lineHeight: '100%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            padding: '4px',
                                            fontSize: '14px',
                                            backgroundColor: this.state.gnss.includes(gnss.label) ? gnss.color_lighter : '',
                                            borderBottomStyle: this.state.gnss.includes(gnss.label) ? 'solid' : '',
                                            borderColor: gnss.color
                                        }}>
                                        {
                                            this.state.gnss.includes(gnss.label) ?
                                                <b>{gnss.label}{gnss.flag({ marginLeft: '5px' })}</b> :
                                                <span style={{ opacity: '50%' }}>{gnss.label}{gnss.flag({ marginLeft: '5px' })}</span>
                                        }
                                    </div>
                                </OverlayTrigger>
                            )
                        }
                    </div>
                </div>
            } style={{
                width: this.props.width ? this.props.width : '100%',
                height: this.props.height ? this.props.height : '100%',
                float: 'left'
            }}>

            <Chart2
                height={'100%'}
                width={`calc(100% - 2px)`}
                style={{ float: 'left' }}
                handleIntervalChange={this.handleIntervalChange}
                data={this.props.data}
                weatherData={this.props.weatherData}
                mode={this.mode()}
                exact={this.exactValue()}
                gnss={this.state.gnss}
            />
        </Widget>
    }
}

export default ChartWidget;