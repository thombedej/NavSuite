import React, { useRef } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Chart as ChartJS, registerables } from 'chart.js';
// import { Tooltip } from 'chart.js';
import { Chart } from 'react-chartjs-2'
import 'chartjs-adapter-moment';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';
import { GNSS_INFO_LIST, PARAMS, WEATHER_PARAMS, WEATHER_PARAMS_LIST } from '../../Pages/Dashboard/Dashboard';
import { MdRestartAlt } from 'react-icons/md'
import { CUSTOM_PARAMS, CUSTOM_PARAMS_LIST } from './ChartWidget';

ChartJS.register(...registerables);
ChartJS.register(zoomPlugin);
ChartJS.register(annotationPlugin)

var _ = require('lodash');

function Chart2(props) {
    const chartRef = useRef(null);

    let isWeather = _.keys(WEATHER_PARAMS).includes(props.mode.label)
    let isCustom = CUSTOM_PARAMS.includes(props.mode.label)
    let display = props.mode.display

    let wData = isWeather ? props.weatherData.filter(w => w[props.mode.label] !== null && w[props.mode.label] !== undefined) : null

    const data = isWeather ?
        {
            labels: _.map(wData, w => w.time),
            // Number.NaN
            datasets: [{
                label: props.mode.name,
                data: _.map(wData, w => w[props.mode.label]),
                pointRadius: 0,
                lineTension: 0.25,
                fill: true,
                borderColor: '#0e6325',
                backgroundColor: 'rgba(14, 99, 37, 0.15)',
                borderWidth: 2,
            }]
        } :
        isCustom ?
            {
                labels: _.map(props.data['GP'], e => e.time),
                datasets: GNSS_INFO_LIST.filter(({ label }) => props.gnss.includes(label)).map((gnss, i) => ({
                    label: gnss.name,
                    data: _.map(props.data[gnss.label], e => props.mode.value(e, props.exact)),
                    pointRadius: 0,
                    lineTension: 0.25,
                    borderColor: gnss.color,
                    backgroundColor: gnss.color_lighter,
                    borderWidth: 2,
                }))
            } :
            {
                labels: _.map(props.data['GP'], e => e.time),
                datasets: GNSS_INFO_LIST.filter(({ label }) => props.gnss.includes(label)).map((gnss, i) => ({
                    label: gnss.name,
                    data: _.map(props.data[gnss.label], e => e[props.mode.label]),
                    pointRadius: 0,
                    lineTension: 0.25,
                    borderColor: gnss.color,
                    backgroundColor: gnss.color_lighter,
                    borderWidth: 2,
                })),
            }

    return (
        <div style={{ padding: '0px', height: '100%', width: '100%', position: 'relative' }}>
            <OverlayTrigger 
            placement='top'
            overlay={<Tooltip id='tooltip-zoom-reset'>
                Reset zoom.
            </Tooltip>}>
                <Button
                    style={{
                        position: 'absolute',
                        bottom: '0px',
                        right: '0px',
                        lineHeight: '20px',
                        padding: '1px',
                        width: '25px'
                    }}
                    onClick={e => { chartRef.current.resetZoom() }}
                    size='sm'
                    variant='light'>
                    <MdRestartAlt size={18} />
                </Button>
            </OverlayTrigger>

            <Chart
                ref={chartRef}
                type={'line'}
                data={data}
                options={{
                    // parsing: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        zoom: {
                            pan: {
                                enabled: true,
                                modifierKey: 'ctrl',
                            },
                            zoom: {
                                drag: {
                                    enabled: true,
                                },
                                mode: 'xy',
                            },
                        },
                        // decimation: {
                        //     enabled: true,
                        //     algorithm: 'lttb'
                        // },
                        annotation: {
                            annotations: {
                                line: {
                                    display: !isWeather && !isCustom,
                                    type: 'line',
                                    yMin: props.exact[props.mode.label],
                                    yMax: props.exact[props.mode.label],
                                    borderColor: 'rgba(0,0,0,0.8)',
                                    borderWidth: 1,
                                    borderDash: [10, 5],
                                    label: {
                                        content: `Actual value: ${display(props.exact[props.mode.label])}`,
                                        enabled: true,
                                        backgroundColor: 'rgba(0,0,0,0)',
                                        color: 'black',
                                        position: 'end',
                                        yAdjust: 12
                                    }
                                }
                            }
                        },
                        tooltip: {
                            // position: 'customPositioner',
                            callbacks: {
                                label: (context) => {
                                    return context.dataset.label + ': ' + display(context.parsed.y)
                                }
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    scales: {
                        x: {
                            display: false,
                            type: 'time',
                            grid: {
                                offset: false
                            },
                            ticks: {
                                maxTicksLimit: 5,
                                maxRotation: 0,
                            }
                        },
                        y: {
                            ticks: {
                                callback: (value) => display(value),
                                maxTicksLimit: 5
                            }
                        }
                    }
                }}
            />
        </div>
    )
}

export default Chart2