import { useEffect, useState } from 'react';
import { TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import * as L from "leaflet";
import MinimapControl from './MinimapControl';
import { GNSS_INFO } from '../../Pages/Dashboard/Dashboard';

const gnssColors = {
    'GL': '#ff6384',
    'GP': '#ffcd45',
    'GA': '#36a2eb',
    'GB': '#9966ff'
}

function Map({ center, receivers }) {
    const map = useMap();

    const LeafIcon = L.Icon.extend({
        options: {}
    });

    const icons = {
        'GL': icon(gnssColors['GL']),
        'GP': icon(gnssColors['GP']),
        'GA': icon(gnssColors['GA']),
        'GB': icon(gnssColors['GB'])
    }

    function icon(color) {
        return new LeafIcon({
            iconUrl: `https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|${color.slice(1)}&chf=a,s,ee00FFFF`,
            iconAnchor: [10, 34]
        })
    }

    useEffect(() => {
        map.panTo(center)
    }, [center, map])

    return (
        <div>
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* <MinimapControl position="topright" /> */}
            {/* <MapConsumer>
            {(map) => {
                map.setView(this.state.position, 10)
            }}
        </MapConsumer> */}

            <Marker position={center}>
                <Popup>
                    Location of the NL-8004U receiver. <br /> FIIT rooftop.
                </Popup>
            </Marker>
            {receivers.filter(r => r.position[0]) ? receivers.filter(r => r.position[0]).map(r =>
                <Marker key={`marker_${r.gnss}`} icon={icons[r.gnss]} position={r.position}>
                    <Popup>
                        Location of receiver station as given <br/> by <b>{GNSS_INFO[r.gnss].name}</b> system.
                    </Popup>
                </Marker>
            ) : null}
        </div>
    )
}

export default Map;