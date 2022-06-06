import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { GNSS_INFO } from '../../Pages/Dashboard/Dashboard';
import Widget from '../Widget';

class RadarWidget extends React.Component {

    elevationToRadius = (e) => (90 - e) / 90
    computeX = (e, a) => this.elevationToRadius(e) * Math.sin((180 - a) * (Math.PI / 180))
    computeY = (e, a) => this.elevationToRadius(e) * Math.cos((180 - a) * (Math.PI / 180))

    ref = React.createRef()

    getDiameter() {
        return this.ref.current ? (Math.min(this.ref.current.offsetHeight, this.ref.current.offsetWidth) * 0.8) / 2 : 0
    }

    icon(sat) {
        return <OverlayTrigger
            key={`${sat.gnss}_${sat.prn}`}
            placement='top'
            overlay={
                <Tooltip id={`tooltip-radar-sat-${sat.gnss}-${sat.prn}`}>
                    {`${GNSS_INFO[sat.gnss].name} #${sat.prn}`}
                </Tooltip>
            }
        >
            <div
                className='clickable'
                style={{
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    textAlign: 'center',
                    backgroundColor: GNSS_INFO[sat.gnss].color,
                    padding: '0px',
                    borderStyle: 'solid',
                    borderWidth: '2px',
                    borderColor: sat.active ? 'darkblue' : GNSS_INFO[sat.gnss].color,
                    boxShadow: '1px 1px 4px 2px rgba(0,0,0,0.1)',
                    color: 'black',
                    fontSize: '12px',
                    position: 'absolute',
                    left: `calc(50% - 11px + ${this.computeX(sat.elevation, sat.azimuth) * this.getDiameter()}px)`,
                    top: `calc(50% - 11px + ${this.computeY(sat.elevation, sat.azimuth) * this.getDiameter()}px)`,
                    transition: 'cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.3s',
                    zIndex: 100
                }}>
                <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '0px', right: '0px' }}>
                        {sat.prn}
                    </span>
                </div>
            </div>
        </OverlayTrigger>
    }

    render() {
        return <Widget
            widgetKey={this.props.widgetKey}
            removeItem={this.props.removeItem}
            style={{
                width: this.props.width ? this.props.width : '100%',
                height: this.props.height ? this.props.height : '100%',
                float: 'left'
            }} title="Satellite Radar">
            <div
                ref={this.ref}
                // className='square'
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                }}>

                <img src='protractor_3.svg' width='100%' height='100%' style={{ position: 'absolute' }} />
                {
                    this.props.navStates.reduce(
                        (prev, curr) => [...prev, ...curr.satsVisible], []
                    ).filter(s => s.azimuth).map(sat => this.icon(sat))
                }

            </div>
        </Widget>
    }
}

export default RadarWidget;