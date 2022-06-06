import React from 'react';
import { defaultPos, GNSS_INFO, GNSS_INFO_LIST } from './Dashboard';

import ReactDOMServer from 'react-dom/server';
import { MapContainer } from 'react-leaflet';
import Widget from '../../Widgets/Widget';
import { TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Alert } from 'react-bootstrap';
// import { NightRegion } from 'react-leaflet-night-region'

class SatelliteMap extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            hovered: '',
            selected: ''
        }
    }

    isDehighlighted(gnss) {
        return (this.state.hovered || this.state.selected) && (!this.isHovered(gnss) && !this.isSelected(gnss))
    }

    isSelected = (gnss) => this.state.selected === gnss && this.state.selected
    isHovered = (gnss) => this.state.hovered === gnss && this.state.hovered

    icon(sat) {
        return <div
            key={`icon_${sat.norad}`}
            style={{
                transition: 'ease 0.15s',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                textAlign: 'center',
                backgroundColor: GNSS_INFO[sat.gnss].color,
                padding: '0px',
                // border: `2px solid ${GNSS_INFO[sat.gnss].color_lighter}`,
                outline: `${sat.active ? '3' : '2'}px solid ${sat.active ? 'darkblue' : GNSS_INFO[sat.gnss].color_darker}`,
                color: 'black',
                fontSize: '14px',
                boxShadow: '3px 3px 8px 1px rgba(0,0,0,0.65)',
                display: this.isDehighlighted(sat.gnss) ? 'none' : 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: sat.visible ? '1' : '0.3',

                // this.state.highlighted && !this.isHl(sat.gnss) ? '0.1' : '1',
                zIndex: sat.active ? 5 : 4
            }}>
            <span style={{ position: 'absolute' }}>{sat.prn}</span>
        </div>
    }

    legendEntry = (color, borderColor, label, value) => <span
        key={`legend_${label}`}
        onClick={e => { this.setState({ selected: this.state.selected === value ? '' : value }) }}
        onMouseEnter={e => { this.setState({ hovered: value }) }}
        onMouseLeave={e => { this.setState({ hovered: '' }) }}
        className={`noselect ${value ? "clickable" : ''}`}
        style={{
            transition: 'ease 0.15s',
            display: 'flex',
            alignItems: 'center',
            marginLeft: '16px',
            marginRight: '16px',
            fontSize: '15px',
            opacity: this.isDehighlighted(value) && value ? '0.4' : '',
            textDecoration: this.isSelected(value) ? 'underline' : ''
        }}>
        <div style={{
            width: '14px',
            height: '14px',
            backgroundColor: color,
            borderColor: borderColor,
            borderStyle: 'solid',
            borderWidth: '2px',
            marginRight: '7px',
            borderRadius: '50%',
            display: 'inline-block',
        }} />
        {label}
    </span>


    render() {
        let gnssStates = {}
        for (const state of this.props.navStates) {
            gnssStates[state.gnss_type] = {
                satsActive: [],
                satsVisible: [],
                ...state
            }
        }

        let satellites = this.props.satellites.map(
            sat => ({
                ...sat,
                visible: gnssStates[sat.gnss] ? gnssStates[sat.gnss].satsVisible.map(s => s.prn).includes(sat.prn) : false,
                active: gnssStates[sat.gnss] ? gnssStates[sat.gnss].satsActive.includes(sat.prn) : false,
                // position: (sat.position && sat.position.satlatitude) ?
                //     [sat.position.satlatitude, sat.position.satlongitude] : null
            })
        ).filter(sat => sat.position)
        // .sort((y, x) => { return (x === y) ? 0 : x ? -1 : 1; })

        let mapCenter = defaultPos

        return (
            <div>
                <div style={{ padding: '5px', width: '100%', display: this.props.src ? '' : 'none' }}>
                    <Alert variant='warning'>
                        Satellite position data is not available when reading past data from a file.
                    </Alert>
                </div>
                <Widget
                    style={{ width: '100%', height: '800px', float: 'left' }}
                    title={
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            {/* Satellite Map */}

                            {
                                GNSS_INFO_LIST.map(gnss =>
                                    this.legendEntry(gnss.color, gnss.color, gnss.name, gnss.label)
                                )
                            }
                            <div style={{ height: '40px', width: '1px', backgroundColor: '#d0d0d0', marginLeft: '10px', marginRight: '10px' }}></div>
                            {this.legendEntry('', 'darkblue', 'Active', '')}
                            {this.legendEntry('lightgray', 'lightgray', 'Not Visible', '')}
                        </div>
                    }>


                    <MapContainer style={{ height: '100%', width: '100%' }} center={[0, 0]} zoom={2} scrollWheelZoom={true}>
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {/* 
                        <NightRegion
                            fillColor='black'
                            color='rgba(1,1,1,0)'
                            refreshInterval={1000} // custom refresh rate in milliseconds, default set to 5000ms
                        /> */}

                        <Marker position={mapCenter}>
                            <Popup>
                                Location of the receiver station. <br /> FIIT rooftop.
                            </Popup>
                        </Marker>

                        {satellites.map(sat =>
                            <Marker
                                key={`marker_${sat.name}`}
                                icon={L.divIcon({
                                    className: "custom icon",
                                    html: ReactDOMServer.renderToString(this.icon(sat))
                                })}
                                position={sat.position}>
                                <Popup>
                                    {sat.name}.<br />
                                    {
                                        sat.active ? <b>Active</b> : 'Inactive'
                                    }
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </Widget>
            </div>
        )
    }
}


export default SatelliteMap;