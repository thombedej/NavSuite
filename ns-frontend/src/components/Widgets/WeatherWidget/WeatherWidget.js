import _ from 'lodash';
import React from 'react';
import { WEATHER_PARAMS, WEATHER_PARAMS_LIST } from '../../Pages/Dashboard/Dashboard';
import Widget from '../Widget';

class WeatherWidget extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }


    getText(weather) {
        let lastData = _.findLast(
            this.props.weatherData,
            w => w[weather.label] !== undefined && w[weather.label] !== null
        )

        if (!lastData) {
            return 'N/A'
        }

        return parseFloat(
            lastData[weather.label]
        ).toFixed(2)
    }

    render() {

        return <Widget
            widgetKey={this.props.widgetKey}
            removeItem={this.props.removeItem}
            style={{
                width: this.props.width ? this.props.width : '100%',
                height: this.props.height ? this.props.height : '100%',
                float: 'left'
            }} title="Weather Conditions">
            {
                WEATHER_PARAMS_LIST.slice(0, 4).map(weather =>
                    <div style={{
                        width: '50%',
                        height: '50%',
                        float: 'left',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <div style={{ height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'start', position:'relative' }}>

                            <span style={{ position: 'absolute', bottom: '-24px', left: '0px', fontSize: '13px' }}>{weather.name}</span>
                            <span style={{ fontSize: '30px', lineHeight: '30px' }}>
                                {
                                    this.getText(weather)
                                }
                            </span>{weather.unit}
                        </div>

                    </div>
                )
            }
        </Widget>
    }
};

export default WeatherWidget;