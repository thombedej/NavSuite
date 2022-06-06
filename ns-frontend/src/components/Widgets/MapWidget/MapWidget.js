import React from 'react';
import { MapContainer, useMapEvents } from 'react-leaflet';
import Map from './Map';
import Widget from '../Widget';
import { defaultPos } from '../../Pages/Dashboard/Dashboard';

class MapWidget extends React.Component {
    render() {
        let receivers = this.props.navStates.map(
            state => ({
                gnss: state.gnss_type,
                position: [state.lat, state.lon]
            })
        )

        return <Widget widgetKey={this.props.widgetKey} removeItem={this.props.removeItem} style={{
            width: this.props.width ? this.props.width : '100%',
            height: this.props.height ? this.props.height : '100%',
            float: 'left'
        }}
            title="Location Estimates">
            <MapContainer style={{ height: '100%', width: '100%' }} center={this.props.position} zoom={18} scrollWheelZoom={false}>
                <Map center={this.props.position} receivers={receivers} />
            </MapContainer>
        </Widget>
    }
}

export default MapWidget;