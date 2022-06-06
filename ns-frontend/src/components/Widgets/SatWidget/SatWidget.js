import React from 'react';
import Widget from '../Widget';
// import SatelliteBar from './SatelliteBar
// import { Form } from 'react-bootstrap';
// import { CanvasJSChart } from 'canvasjs-react-charts';
// import { Bar } from 'react-chartjs-2';

import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2'
import { GNSS_INFO, GNSS_INFO_LIST } from '../../Pages/Dashboard/Dashboard';
ChartJS.register(...registerables);

class SatWidget extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            showInactive: false
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

    satLabel = (prn, gnss) => {
        // return this.props.satellites.filter(s=>s.prn === prn && s.gnss === gnss)[0].name

        if (gnss === 'GP') {
            return `G${prn}`
        }
        if (gnss === 'GL') {
            return `R${prn}`
            // return `R${prn - 64}`
        }
        if (gnss === 'GA') {
            return `E${prn}`
        }
        if (gnss === 'GB') {
            return `B${prn}`
        }
    }

    satName = (label) => {
        if (!this.props.satellites.length) {
            return label
        }
        let sat = this.props.satellites.filter(s => {
            return s.prn === parseInt(label.slice(1)) && s.gnss === {
                'R': 'GL',
                'E': 'GA',
                'G': 'GP',
                'B': 'GB'
            }[label.slice(0, 1)]
        })[0]

        return sat ? sat.name : label + '(unknown name)'
    }

    satColor = (gnss) => {
        return {
            'GP': 'rgba(255, 205, 69, 0.4)',
            'GL': 'rgba(255, 99, 132, 0.4)',
            'GA': 'rgba(54, 162, 235, 0.4)',
            'GB': 'rgba(153, 102, 255, 0.4)'
        }[gnss]
    }

    satBorder = (gnss, active) => {
        return active ? 'darkblue' : GNSS_INFO[gnss].color
    }



    render() {
        // let displayed = this.props.visible
        // .filter(this.filterInactive)

        let satellites = this.props.states.reduce(
            (prev, curr) => curr.satsVisible ? [
                ...prev,
                ...curr.satsVisible.sort((a, b) => a.prn < b.prn ? -1 : 1)
            ] : prev, []
        )

        let data = {
            labels: satellites.map(sat => this.satLabel(sat.prn, sat.gnss)),
            datasets: [
                // ...GNSS_INFO_LIST.map(gnss => ({
                //     data: [],
                //     backgroundColor: gnss.color_lighter,
                //     borderColor: gnss.color,
                //     label: gnss.name
                // })),
                {
                    data: satellites.map(sat => sat.snr),
                    backgroundColor: satellites.map(sat => GNSS_INFO[sat.gnss].color_lighter),
                    borderColor: satellites.map(sat => this.satBorder(sat.gnss, sat.active)),
                    borderWidth: 2,
                    label: 'SNR'
                }]
        }


        const options = {
            showLegend: false,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 100,
                    ticks: {
                        callback: (value, index, ticks) => index % 2 ? '' : value + 'dB'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: (context) => {
                            return this.satName(context[0].label)
                        },
                        label: (context) => {
                            return context.dataset.label + ': ' + context.parsed.y + 'dB'
                        }
                    }
                },
                legend: {
                    labels: {
                        // boxWidth: 20,
                        // color: 'black',
                        generateLabels: () => [
                            ...GNSS_INFO_LIST.map(
                                gnss => ({
                                    // borderRadius: 2,
                                    text: gnss.name,
                                    fillStyle: gnss.color_lighter,
                                    strokeStyle: gnss.color,
                                    lineWidth: 2
                                })
                            ),
                            {
                                // borderRadius: 2,
                                text: 'Active',
                                fillStyle: 'white',
                                strokeStyle: 'darkblue',
                                lineWidth: 2
                            }
                        ]
                    }
                    // display: false
                }
            }
        }

        return <Widget
            widgetKey={this.props.widgetKey}
            removeItem={this.props.removeItem}
            style={{
                width: this.props.width ? this.props.width : '100%',
                height: this.props.height ? this.props.height : '100%',
                float: 'left'
            }} title={
                <div>
                    Visible Satellites ({satellites.length})
                </div>
            }>
            <div style={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
                {/* <CanvasJSChart options={options} /> */}
                <Chart type={'bar'} data={data} options={options} />
            </div>
        </Widget>
    }
}

export default SatWidget;