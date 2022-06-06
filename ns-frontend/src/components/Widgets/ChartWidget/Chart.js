// import React from 'react';
// import { CanvasJSChart } from 'canvasjs-react-charts';
// import { Form, Card, Button } from 'react-bootstrap';
// import { GNSS_INFO_LIST } from '../../Pages/Dashboard/Dashboard';
// import _ from 'lodash';

// const defaultDataOptions = {
//     showInLegend: true,
//     type: "line",
//     markerSize: 0
// }

// const CHART_COLOR = '#fafafa'

// class Chart extends React.Component {
//     constructor(props) {
//         super(props)

//         this.state = {
//             mode: 'Altitude',
//             gnss: 'GP',
//             dual: false
//         }

//         this.handleModeChange = this.handleModeChange.bind(this)
//         this.contentFormatter = this.contentFormatter.bind(this)
//         this.formatData = this.formatData.bind(this)
//         // this.params = this.params.bind(this)
//     }


//     handleModeChange(selected) {
//         this.setState({
//             mode: selected
//         })
//     }

//     handleGNSSChange(selected) {
//         this.setState({
//             gnss: selected
//         })
//     }

//     formatData() {
//         return GNSS_INFO_LIST.filter(gnss=>gnss.label==='GP').map(({ label, name }) => ({
//             ...defaultDataOptions,
//             name: name,
//             dataPoints: _.map(this.props.data[label], e => ({
//                 time: e.time,
//                 x: new Date(e.time),
//                 y: e[this.props.mode.parameter]
//             }))
//         }))
//     }

//     contentFormatter(e) {
//         var content = " ";
//         content += `time <strong>${new Date(e.entries[0].dataPoint.time).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1")}</strong><br/>`
//         for (var i = 0; i < e.entries.length; i++) {
//             content += `${e.entries[i].dataSeries.name} <strong>${e.entries[i].dataPoint.y} </strong><br/>`
//         }
//         // content += `satsVisible <strong>${e.entries[0].dataPoint.satsVisible.length}</strong><br/>`
//         // content += `satsActive <strong>${e.entries[0].dataPoint.satsActive.length}</strong><br/>`
//         return content;
//     }

//     getBoundaries(values, slack) {
//         if (!this.props.data.length) {
//             return {
//                 minimum: 0,
//                 maximum: 1
//             }
//         }

//         let min_val = Math.min(...values)
//         let max_val = Math.max(...values)

//         if (min_val === max_val) {
//             slack = 1
//         }

//         return {
//             minimum: min_val - slack,
//             maximum: max_val + slack
//         }
//     }

//     render() {
//         const options = {
//             backgroundColor: CHART_COLOR,
//             // height: this.state.dual ? null : 475,
//             // width: 630,
//             animationEnabled: true,
//             zoomEnabled: true,
//             panEnabled: true,
//             toolTip: {
//                 shared: true,
//                 contentFormatter: this.contentFormatter
//             },
//             legend: {
//                 dockInsidePlotArea: true
//             },
//             axisY: {
//                 // ...this.getBoundaries(values, 0),
//                 // interlacedColor: "#f5f5f5",
//                 gridColor: "#f0f0f0",
//                 // stripLines: this.params().length === 1 ? [{
//                 //     showOnTop: false,
//                 //     thickness: 1,
//                 //     value: mean,
//                 //     label: `Mean: ${mean.toFixed(2)}`,
//                 //     labelPlacement: 'inside',
//                 //     labelAlign: 'far',
//                 //     labelFontSize: 10,
//                 //     labelFontFamily: 'Roboto',
//                 //     color: '#7daeff',
//                 //     labelFontColor: '#333333'
//                 // }] : []
//             },
//             axisX: {
//                 tickLength: 20,
//                 tickColor: 'white',
//                 labelFontSize: 0
//             },
//             data: this.formatData()
//         }

//         return (
//             <Card style={{
//                 ...this.props.style,
//                 width: this.props.width,
//                 height: this.props.height,
//                 position: 'relative',
//                 padding: '20px',
//                 overflow: 'hidden',
//                 margin: '1px',
//                 backgroundColor: CHART_COLOR,
//                 // borderColor: CHART_COLOR
//             }}>
//                 {/* {this.cancelButton()} */}
//                 <CanvasJSChart options={options} />
//                 {/* <LineChart
//                     type={'line'} 
//                     data={data} 
//                     // options={options} 
//                 />
//                 {this.modeDropdown()}
//                 {this.gnssDropdown()} */}
//             </Card>
//         )
//     }
// }

// export default Chart