import React from 'react';
import '../../../Leaflet.Edgemarker'
import { io } from "socket.io-client";
import axios from 'axios';
import { BrowserRouter as Router, Switch, Route, withRouter } from 'react-router-dom';
import Messages from './Messages';
import SatelliteMap from './SatelliteMap';
import { CircleFlag as Flag } from 'react-circle-flags'
import { NavLink } from 'react-router-dom';
import FileStream from './FileStream';
import { IoSettingsSharp } from "react-icons/io5";
import { BiExport } from "react-icons/bi";
import Analysis from './Analysis';
import Settings from './Settings';
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import _ from 'lodash-joins';
import { BiPause, BiPlay, BiStopwatch } from 'react-icons/bi';
import { SERVER_IP, SERVER_URL } from '../../../App';

var MINUTES = 5

const intervals = [
    { val: 5, label: '5m' },
    { val: 10, label: '10m' },
    { val: 30, label: '30m' },
    { val: 60, label: '1h' },
    { val: 180, label: '2h' },
    { val: 300, label: '5h' },
    // { val: 1440, label: '1D' },
]

export const N2YO_API_URL = 'https://api.n2yo.com/rest/v1/satellite/positions/25544/41.702/-76.014/0/2/&apiKey=WGNX43-R6MGYU-E6QSBP-4UWE'
export const N2YO_APIKEY = 'WGNX43-R6MGYU-E6QSBP-4UWE'
export const defaultPos = [48.153746, 17.071479]
export const defaultAlt = 195

export const GNSS_INFO = {
    'GP': {
        name: 'GPS',
        color: '#ffcd45',
        color_darker: '#e8af13',
        color_lighter: '#f7de99',
        flag: (style) => <Flag style={style} countryCode={'us'} height="14" />
    },
    'GL': {
        name: 'GLONASS',
        color: '#ff6384',
        color_darker: '#c43352',
        color_lighter: '#f59fb1',
        flag: (style) => <Flag style={style} countryCode={'ru'} height="14" />
    },
    'GA': {
        name: 'Galileo',
        color: '#36a2eb',
        color_darker: '#0c5485',
        color_lighter: '#87c4ed',
        flag: (style) => <Flag style={style} countryCode={'european_union'} height="14" />
    },
    'GB': {
        name: 'BeiDou',
        color: '#9966ff',
        color_darker: '#3e2078',
        color_lighter: '#cab0ff',
        flag: (style) => <Flag style={style} countryCode={'cn'} height="14" />
    }
}

export const GNSS_INFO_LIST = Object.entries(GNSS_INFO).map(([k, v]) => ({ label: k, ...v }))

export const PARAMS = {
    'lat': {
        name: 'Latitude',
        label: 'lat',
        display: (v) => (v || v === 0) ? getDMS(v, 'lat') : 'N/A',
        extra: true
    },
    'lon': {
        name: 'Longitude',
        label: 'lon',
        display: (v) => (v || v === 0) ? getDMS(v, 'lon') : 'N/A',
        extra: true
    },
    'alt': {
        name: 'Altitude',
        label: 'alt',
        display: (v) => (v || v === 0) ? `${v.toFixed(2)}m` : 'N/A',
        extra: true
    },
    'speed': {
        name: 'Speed',
        label: 'speed',
        display: (v) => (v || v === 0) ? `${v.toFixed(2)}m/s` : 'N/A',
        extra: true
    },
    'vdop': {
        name: 'Vertical DOP',
        label: 'vdop',
        display: (v) => (v || v === 0) ? `${v}` : 'N/A'
    },
    'hdop': {
        name: 'Horizontal DOP',
        label: 'hdop',
        display: (v) => (v || v === 0) ? `${v}` : 'N/A'
    },
    'pdop': {
        name: 'Positional DOP',
        label: 'pdop',
        display: (v) => (v || v === 0) ? `${v}` : 'N/A'
    }
}

export const PARAMS_LIST = Object.entries(PARAMS).map(([k, v]) => ({ ...v }))

export const WEATHER_PARAMS = {
    'humidity': { name: 'Humidity', label: 'humidity', display: (v) => `${parseFloat((v || 0)).toFixed(2)}%`, unit: '%' },
    'temperature': { name: 'Temperature', label: 'temperature', display: (v) => `${parseFloat((v || 0)).toFixed(2)}°C`, unit: '°C' },
    'pressure': { name: 'Pressure', label: 'pressure', display: (v) => `${parseFloat((v || 0)).toFixed(3)} hPa`, unit: ' hPa' },
    'light': { name: 'Light', label: 'light', display: (v) => `${parseFloat((v || 0)).toFixed(2)} Lux`, unit: ' Lux' },
    'precipitation': { name: 'Precipitation', label: 'precipitation', display: (v) => `${parseFloat((v || 0)).toFixed(2)}` },
}

export const WEATHER_PARAMS_LIST = Object.entries(WEATHER_PARAMS).map(([k, v]) => ({ ...v }))

function truncate(n) {
    return n > 0 ? Math.floor(n) : Math.ceil(n);
}

function getDMS(dd, longOrLat) {
    let hemisphere = /^[WE]|(?:lon)/i.test(longOrLat)
        ? dd < 0
            ? "W"
            : "E"
        : dd < 0
            ? "S"
            : "N";

    const absDD = Math.abs(dd);
    const degrees = truncate(absDD);
    const minutes = truncate((absDD - degrees) * 60);
    const seconds = ((absDD - degrees - minutes / 60) * Math.pow(60, 2)).toFixed(2);

    let dmsArray = [degrees, minutes, seconds, hemisphere];
    return `${dmsArray[0]}°${dmsArray[1]}'${dmsArray[2]}" ${dmsArray[3]}`;
}

class Dashboard extends React.Component {
    constructor(props) {
        super(props);

        this.componentCleanup = this.componentCleanup.bind(this);
        this.state = {
            messageBatch: [],
            nmeaFeed: [],
            dataAll: [],
            dataDisplayed: [],
            weatherData: [],

            inputStream: null,
            socket: null,
            loadingTimeseries: false,
            loadingPage: false,
            usedSystems: ['GP'],
            navStates: [],
            satellites: [],
            settingsOpen: false,

            lon: defaultPos[1],
            lat: defaultPos[0],
            alt: defaultAlt,
            intervalMinutes: MINUTES,
            // src: "C:/Users/TomášBedej/Desktop/DP/Kod/ns-frontend/public/data/nmea_2022-04-19T06_00_00.000Z-2022-04-19T06_30_00.000Z.txt",
            src: null,
            second: 0,
            duration: 0,

            paused: false
        };
        this.filterOldStates = this.filterOldStates.bind(this)
        this.handleIntervalChange = this.handleIntervalChange.bind(this)
        this.loadData = this.loadData.bind(this)
        this.reduceDensity = this.reduceDensity.bind(this)
        this.updateData = this.updateData.bind(this)
        this.updateDataFile = this.updateDataFile.bind(this)
        this.handleSettingsChange = this.handleSettingsChange.bind(this)
        // this.fileStream = this.fileStream.bind(this)
        this.resetDashboard = this.resetDashboard.bind(this)
        this.setLoadingTimeseries = this.setLoadingTimeseries.bind(this)
        this.setLoadingPage = this.setLoadingPage.bind(this)
        this.handleExport = this.handleExport.bind(this)
    }

    setLoadingTimeseries = (loading) => {
        this.setState({ loadingTimeseries: loading })
    }

    setLoadingPage = (loading) => {
        this.setState({ loadingPage: loading, loadingTimeseries: loading })
    }

    reduceDensity(index, c) {
        // var diffMs = (new Date() - new Date(array[0].time)); 
        // var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);

        // let c = Math.round(array.length / 500)
        // let c = Math.round(this.state.intervalMinutes * 3)
        if (!c) return true
        if (index % c === 0)
            return true
        return false
    }

    resetDashboard() {
        this.setState({
            messageBatch: [],
            dataDisplayed: [],
            navStates: []
        })
    }

    componentDidMount() {
        window.addEventListener('beforeunload', this.componentCleanup);

        this.loadData(MINUTES, () => {
            this.streamFromServer()
        })
        // this.streamFromServer()
    }

    componentWillUnmount() {
        this.componentCleanup();
        window.removeEventListener('beforeunload', this.componentCleanup);
    }

    componentCleanup() {
        this.state.socket && this.state.socket.close()
        clearInterval(this.state.inputStream)
    }

    filterMessages(nmea) {
        if (nmea.slice(3, 4) === 'G')
            return true
        return false
    }

    filterOldStates(e, curr) {
        curr = curr || new Date()

        if ((curr) - new Date(e.time) < 1000 * 60 * this.state.intervalMinutes)
            return true
        return false
    }

    streamFromServer() {
        this.setState({
            socket: io(`${SERVER_IP}`, {
                reconnectionDelayMax: 10000
            })
        }, () => {
            this.state.socket.on("message", data => {
                this.updateData(data)
            })
        })
    }

    gnssIsUsed = (gnss) => this.state.usedSystems.includes(gnss)

    getStandardDeviation = (mean, values) => Math.sqrt(
        values
            .map(x => Math.pow(x - mean, 2))
            .reduce((a, b) => a + b, 0) / values.length
    )

    processStates(states, data) {
        return states.map((state) => {
            _.forEach(['lat', 'lon', 'alt', 'speed'], (attribute) => {
                let values = data[state.gnss_type].map(e => e[attribute]).filter(v => v !== null && v !== undefined)
                let sum = _.sum(values)
                let mean = sum / values.length

                state[attribute + '_mean'] = values.length ? mean : undefined
                state[attribute + '_std'] = values.length ? this.getStandardDeviation(mean, values) : undefined
            })

            return state
        })
    }

    updateData(data) {
        if (this.state.src || this.state.paused) {
            return
        }

        const { states, weather, messages, satellites } = JSON.parse(data)

        this.setState(prevState => {
            let indices = _.map(prevState.dataDisplayed,
                (states) => states.findIndex(this.filterOldStates)
            )
            let updatedData = prevState.dataDisplayed

            console.log(states)
            _.zip(states, indices).forEach(([state, index]) => {
                updatedData[state.gnss_type] = [...updatedData[state.gnss_type], state].slice(index);
            })

            let weatherData = [...prevState.weatherData, weather]
            let oldWC = weatherData.findIndex(this.filterOldStates)

            return {
                messageBatch: messages,
                nmeaFeed: prevState.nmeaFeed.concat(messages).slice(-500),
                navStates: this.processStates(states, updatedData),
                dataDisplayed: updatedData,
                satellites: satellites,
                weatherData: weatherData.slice(oldWC)
            }
        })
    }

    refreshData() {
        this.setState({
            navStates: this.state.navStates,
            dataDisplayed: this.state.dataDisplayed
        })
    }

    clearData() {
        this.setState(prevState => {
            let indices = _.map(prevState.dataDisplayed,
                (states) => states.findIndex(this.filterOldStates)
            )

            let updatedData = prevState.dataDisplayed
            _.zip(prevState.navStates, indices).forEach(([state, index]) => {
                updatedData[state.gnss_type] = updatedData[state.gnss_type].slice(index);
            })

            return {
                dataDisplayed: { 'GP': [], 'GA': [], 'GB': [], 'GL': [] },
                navStates: []
            }
        })
    }

    categorizedStates = (states) => states ? states.reduce((prev, state) => {
        return {
            ...prev,
            [state.gnss_type]: prev[state.gnss_type] ? [...prev[state.gnss_type], state] : [state]
        }
    }, {}) : {
        'GP': [],
        'GL': [],
        'GA': [],
        'GB': []
    }

    decimateArray(arr, points = 300) {
        let length = arr.length
        let chunkSize = Math.ceil(length / points)

        return _.chunk(arr, chunkSize).map(
            chunk => {
                let combined = {};

                _.keys(chunk[0]).forEach(key => {
                    combined[key] = key === 'time' ?
                        new Date(_.meanBy(chunk, (o) => new Date(o[key]).getTime())) :
                        key === 'gnss_type' ? chunk[0][key] :
                            _.chain(chunk)
                                .filter(o => o[key] !== null)
                                .meanBy(o => o[key])
                                .value() || null
                });

                return combined;
            }
        )
    }

    loadData(minutes, cb) {
        this.setState({
            loadingTimeseries: true
        }, () => {
            axios.get(`${SERVER_URL}/live/${minutes}`).then(res => {

                let categorizedStates = _.groupBy(res.data.states, state => state.gnss_type)

                _.keys(categorizedStates).forEach(
                    gnss => categorizedStates[gnss] = this.decimateArray(categorizedStates[gnss])
                )

                this.setState({
                    dataDisplayed: categorizedStates,
                    weatherData: this.decimateArray(
                        res.data.weather
                    ),
                    // dataDisplayed: res.data.filter((_, i) => this.reduceDensity(i, every_xth)),
                    // navStates: [{}, {}, {}, {}],
                    loadingTimeseries: false
                }, cb)
            }).catch(err => {
                console.error('Error getting history data:', err)
            })
        })
    }

    updateDataFile(data, dataDisplayed, second, duration, start) {
        this.setState(prevState => {
            let deleted = dataDisplayed['GP'].findIndex(e => this.filterOldStates(e, new Date(start.getTime() + second * 1000)))

            let updatedData = dataDisplayed
            _.forEach(data.states, (state) => {
                updatedData[state.gnss_type] = [...updatedData[state.gnss_type], state].slice(deleted)
            })

            return {
                messageBatch: data.messages,
                nmeaFeed: prevState.nmeaFeed.concat(data.messages).slice(-500),
                navStates: data.states,
                dataDisplayed: updatedData,
                satellites: [],
                weatherData: []
                // loadingTimeseries: false
            }
        })
    }

    formatDataStream(data) {
        return data.reduce((p, c) => {
            return {
                ...p,
                [c.gnss_type]: p[c.gnss_type] ? [...p[c.gnss_type], c] : [c]
            }
        }, {})
    }

    handleIntervalChange(val) {
        this.setState({
            intervalMinutes: val
        }, () => {
            if (!this.state.src)
                this.loadData(val)
            else {
                this.refreshData(val)
            }
            // this.clearData()
        })
    }

    handleSettingsChange(changes, lon, lat, alt, src) {
        if (!changes) {
            this.setState({
                settingsOpen: false
            })
            return
        }
        this.setState(() => ({ loadingSettings: true }),
            () => {
                if (src !== this.state.src) {
                    !src && this.clearData();
                }
                
                this.setState({
                    settingsOpen: false,
                    lon: lon,
                    lat: lat,
                    alt: alt,
                    src: src,
                    loadingSettings: false
                })
            }
        )
    }

    handleExport() {
        let columns = [
            { name: 'time', value: (v) => new Date(v.time).getTime() },
            'gnss_type',
            'lat', 'lat_mean', 'lat_std',
            'lon', 'lon_mean', 'lon_std',
            'alt', 'alt_mean', 'alt_std',
            'speed', 'speed_mean', 'speed_std',
            'fix',
            'hdop', 'pdop', 'vdop',
            { name: 'satsActive', value: (s) => (s.satsActive && s.satsActive.length) || 0 },
            { name: 'satsVisible', value: (s) => (s.satsVisible && s.satsVisible.length) || 0 }
        ].map(column => typeof (column) === 'string' ? ({ name: column, value: (v) => v[column] }) : column)

        let csv = columns.map(col => col.name).join(',') + '\n' +
            _.chain(
                _.values(this.state.dataDisplayed))
                .flatten()
                .sortBy(['time', 'gnss_type'])
                .map(state =>
                    columns.map(
                        column => column.value(state)
                    ).join(',')
                )
                .value().join('\n')


        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
        element.setAttribute('download', 'values.csv');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    handlePlayPause = () => {
        this.setState({
            paused: !this.state.paused
        })
    }

    render() {
        const activeNavStyle = { color: '#3f81eb' }
        const defaultNavStyle = {
            fontSize: '12px',
            lineHeight: '20px',
            display: 'inline-flex',
            height: '100%',
            width: '120px',
            justifyContent: 'center',
            alignItems: 'center'
        }

        return <div className="page" style={{ position: 'relative' }}>

            <div style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
                animation: this.state.loadingPage ? '' : 'fadeOut ease 0.4s forwards',
                zIndex: 2000
            }}>
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f5f5fc',
                        opacity: 1,
                        borderRadius: '7px'
                    }}
                />
                <Spinner
                    style={{ marginRight: '310px' }}
                    size='lg'
                    as="span"
                    animation="border"
                    role="status"
                    aria-hidden="true"
                />
            </div>

            <div id='dashboard-header' style={{ zIndex: 2001, width: '100%', minWidth: '710px', position: 'relative', minHeight: '40px' }}>
                <div className='main-content'
                    style={{
                        gap: '10px',
                        paddingLeft: '30px',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        position: 'relative'
                    }}
                >
                    <h2 style={{
                        // width: '200px',
                        marginBottom: '0px'
                    }}>
                        Dashboard
                    </h2>
                    <NavLink exact to="/dashboard" onClick={() => { this.refreshData() }} className="btn" style={
                        isActive => isActive ? { ...defaultNavStyle, ...activeNavStyle } : defaultNavStyle
                    }>
                        Analysis
                    </NavLink>
                    <NavLink to="/dashboard/messages" className="btn" style={
                        isActive => isActive ? { ...defaultNavStyle, ...activeNavStyle } : defaultNavStyle
                    }>
                        NMEA Messages
                    </NavLink>
                    <NavLink to="/dashboard/map" className="btn" style={
                        isActive => isActive ? { ...defaultNavStyle, ...activeNavStyle } : defaultNavStyle
                    }>
                        Satellite Map
                    </NavLink>

                    <div style={{
                        height: '40px',
                        width: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: 'auto',
                        justifyContent: 'space-between',
                        marginRight: '5px'
                    }}>
                        <OverlayTrigger
                            key='settings_tooltip'
                            placement='bottom'
                            overlay={
                                <Tooltip id='tooltip-settings'>
                                    Export all data in timeframe to a .csv file
                                </Tooltip>
                            }>
                            <div style={{ width: '23px', height: '23px' }}>
                                <BiExport
                                    className="clickable lightenOpacity"
                                    size={23}
                                    style={{ marginBottom: '2px', color: '#363642' }}
                                    onClick={this.handleExport}
                                />
                            </div>
                        </OverlayTrigger>
                        <OverlayTrigger
                            key='settings_tooltip'
                            placement='bottom'
                            overlay={
                                <Tooltip id='tooltip-settings'>
                                    Settings
                                </Tooltip>
                            }>
                            <div style={{ width: '23px', height: '23px' }}>
                                <IoSettingsSharp
                                    id='settings-cog'
                                    onClick={() => this.setState({ settingsOpen: true })}
                                    className="clickable lightenOpacity"
                                    size={20}
                                    color='#363642'
                                // style={{ marginRight: '30px' }}
                                />
                            </div>
                        </OverlayTrigger>
                    </div>
                </div>

                <Settings loadingSettings={this.state.loadingSettings} resetDashboard={this.resetDashboard} apply={this.handleSettingsChange} show={this.state.settingsOpen} />
            </div>

            <div id='configuration-bar' className='main-content' style={{
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                padding: '5px'
            }}>
                <div className='_card'
                    style={{
                        width: '100%',
                        height: '50px',
                        backgroundColor: '#363642',
                        color: 'white',
                    }}>
                    <div id='timeframe-select'
                        style={{
                            float: 'left',
                            height: '100%',
                            width: '300px',
                            padding:'8px 20px 9px 20px'
                        }}>
                        <div style={{ color: '#909090', height: '10px', width: '100%', lineHeight: '9px', fontSize: '9px' }}>
                            TIMEFRAME
                        </div>
                        <div style={{
                            height: 'calc(100% - 10px)',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <BiStopwatch color='#3f81eb' size={20} style={{ width: '30px' }} />
                            {
                                intervals.map(i =>
                                    <div
                                        onClick={() => this.handleIntervalChange(i.val)}
                                        className='clickable lightenOpacity'
                                        style={{
                                            display: 'inline-block',
                                            fontSize: '13px',
                                            paddingLeft: '10px',
                                            paddingRight: '10px',
                                            color: this.state.intervalMinutes === i.val ? 'white' : '#909090',
                                        }}>
                                        {i.label}
                                    </div>
                                )
                            }
                        </div>
                    </div>
                    <div id='source-status'
                        style={{
                            marginLeft: 'auto',
                            float: 'left',
                            height: '100%',
                            width: '140px',
                            padding: '8px 20px 9px 20px',
                            borderLeftStyle: 'solid',
                            borderRightStyle: 'solid',
                            borderWidth: '2px',
                            borderColor: '#21212b'
                            // backgroundColor: '#424252'
                        }}>
                        <div style={{ color: '#909090', height: '10px', width: '100%', lineHeight: '9px', fontSize: '9px' }}>
                            SOURCE
                        </div>
                        <div style={{ height: 'calc(100% - 10px)', display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                            {
                                this.state.src ?
                                    'FILE READ' :
                                    <div>
                                        LIVE DATA

                                        <Spinner animation='grow' variant='danger' style={{
                                            visibility: this.state.paused ? 'hidden' : 'visible',
                                            marginLeft: '5px',
                                            height: '14px',
                                            width: '14px',
                                            backgroundColor: '#3f81eb'
                                        }} />
                                    </div>
                            }
                        </div>
                    </div>
                    <div id='controls' style={{
                        height: '100%',
                        float: 'left',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minWidth: '50px'
                    }}
                    >
                        {
                            this.state.src ?
                                <FileStream
                                    setLoadingPage={this.setLoadingPage}
                                    updateData={this.updateDataFile}
                                    src={this.state.src}
                                />
                                :
                                this.state.paused ?
                                    <BiPlay className="clickable lightenOpacity" size={35} onClick={this.handlePlayPause} /> :
                                    <BiPause className="clickable lightenOpacity" size={35} onClick={this.handlePlayPause} />

                        }
                    </div>
                </div>
            </div>

            <div className='main-content'>
                <Switch>
                    <Route path="/dashboard/messages">
                        <Messages loadingPage={this.state.loadingPage} messages={this.state.messageBatch} />
                    </Route>
                    <Route path="/dashboard/map">
                        <SatelliteMap src={this.state.src} loadingPage={this.state.loadingPage} satellites={this.state.satellites} navStates={this.state.navStates} />
                    </Route>
                    <Route path="/dashboard">
                        <Analysis {...this.state} />
                    </Route>
                </Switch>
            </div>
        </div>
    }
}

export default withRouter(Dashboard);

{/* <Loadable color={'#f5f5fc'} opacity={1} loading={this.state.loadingPage}></Loadable> */ }