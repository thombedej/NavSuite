import React from 'react';
import { Responsive, WidthProvider } from "react-grid-layout";
import RadarWidget from '../../Widgets/RadarWidget/RadarWidget';
import StatusWidget from '../../Widgets/StatusWidget/StatusWidget';
import MapWidget from '../../Widgets/MapWidget/MapWidget';
import SatWidget from '../../Widgets/SatWidget/SatWidget';
// import FeedWidget from '../../Widgets/FeedWidget/FeedWidget';
import ChartWidget from '../../Widgets/ChartWidget/ChartWidget';

import { BiLineChart, BiBarChart, BiTable, BiMap, BiRadar, BiCloud } from 'react-icons/bi';
import _ from 'lodash';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import WeatherWidget from '../../Widgets/WeatherWidget/WeatherWidget';
// import {MdRadar} from 'react-icons/md';

const GridLayout = WidthProvider(Responsive);

class Analysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            cols: 24,
            widgetCounter: 0
        }

        this.removeItem = this.removeItem.bind(this)
    }

    getLayouts = () => ({
        'lg': [
            {
                ...this.getWidget('Chart'), x: 0, y: 0, key: 'widget_0', component: (key) => <ChartWidget
                    widgetKey={key}
                    removeItem={this.removeItem}
                    handleIntervalChange={this.handleIntervalChange}
                    intervalMinutes={this.props.intervalMinutes}
                    loading={this.props.loadingTimeseries}
                    data={this.props.dataDisplayed}
                    weatherData={this.props.weatherData}
                    exactValues={this.exactValues()}
                    mode={0}
                />
            },
            { ...this.getWidget('Status'), x: 12, y: 0, key: 'widget_1' },
            {
                ...this.getWidget('Chart'), x: 0, y: 5, key: 'widget_2', component: (key) => <ChartWidget
                    widgetKey={key}
                    removeItem={this.removeItem}
                    handleIntervalChange={this.handleIntervalChange}
                    intervalMinutes={this.props.intervalMinutes}
                    loading={this.props.loadingTimeseries}
                    data={this.props.dataDisplayed}
                    weatherData={this.props.weatherData}
                    exactValues={this.exactValues()}
                    mode={1}
                />
            },
            { ...this.getWidget('Map'), x: 0, y: 6, key: 'widget_3' },
            { ...this.getWidget('Radar'), x: 6, y: 6, key: 'widget_4' },
            { ...this.getWidget('Signal'), x: 12, y: 12, key: 'widget_5' }
        ]
    })

    componentDidMount() {
        this.setState({
            items: this.getLayouts()['lg'],
            widgetCounter: 6
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.items.length < this.state.items.length) {
            setTimeout(() => { window.scrollTo(0, document.body.scrollHeight); }, 250)
        }
    }

    handleIntervalChange(val) {
        this.setState({
            intervalMinutes: val
        }, () => {
            this.props.loadData(val)
        })
    }

    exactValues = () => ({
        alt: this.props.alt,
        lat: this.props.lat,
        lon: this.props.lon,
        speed: 0
    })

    getWidgetAt = (x, y, w, h) => {
        return _.filter(
            this.state.items,
            item =>
                x + w > item.x &&
                x < item.x + item.w &&
                y + h >= item.y &&
                y < item.y + item.h
        ).sort(
            (a, b) => (a.y < b.y && -1) || (a.y === b.y && a.x < b.x && -1) || 1
        )[0]
    }

    placeItem = (x, y, w, h) => {
        if (x + w > this.state.cols) {
            return this.placeItem(0, y + 1, w, h)
        }
        else {
            let widgetAtPos = this.getWidgetAt(x, y, w, h);
            if (widgetAtPos)
                return this.placeItem(widgetAtPos.x + widgetAtPos.w, y, w, h)
            else
                return { x: x, y: y }
        }
    }

    mapWidget = (key) => <MapWidget widgetKey={key} removeItem={this.removeItem} position={[this.props.lat, this.props.lon]} navStates={this.props.navStates} />
    statusWidget = (key) => <StatusWidget widgetKey={key} removeItem={this.removeItem} exactValues={this.exactValues()} status={this.props.navStates} data={this.props.dataSeparated} />
    radarWidget = (key) => <RadarWidget widgetKey={key} removeItem={this.removeItem} navStates={this.props.navStates} />
    satWidget = (key) => <SatWidget widgetKey={key} removeItem={this.removeItem} states={this.props.navStates} satellites={this.props.satellites} />
    chartWidget = (key) => {
        return <ChartWidget
            widgetKey={key}
            removeItem={this.removeItem}
            handleIntervalChange={this.handleIntervalChange}
            intervalMinutes={this.props.intervalMinutes}
            loading={this.props.loadingTimeseries}
            data={this.props.dataDisplayed}
            weatherData={this.props.weatherData}
            exactValues={this.exactValues()}
            mode={this.widgetCount('Chart') - 1}
        />
    }
    weatherWidget = (key) => <WeatherWidget widgetKey={key} removeItem={this.removeItem} weatherData={this.props.weatherData} />

    getWidget = (widgetName) => ({
        ...{
            'Map': {
                name: 'Map',
                component: this.mapWidget,
                w: 6,
                h: 6,
                minW: 4,
                minH: 5
            },
            'Status': {
                name: 'Status',
                component: this.statusWidget,
                w: 12,
                h: 9,
                minW: 10,
                minH: 5
            },
            'Radar': {
                name: 'Radar',
                component: this.radarWidget,
                w: 6,
                h: 6,
                minH: 5,
                minW: 4
            },
            'Signal': {
                name: 'Signal',
                component: this.satWidget,
                w: 12,
                h: 7,
                minH: 4,
                minW: 6
            },
            'Chart': {
                name: 'Chart',
                component: this.chartWidget,
                w: 12,
                h: 5,
                minW: 7,
                minH: 4
            },
            'Weather': {
                name: 'Weather',
                component: this.weatherWidget,
                w: 6,
                h: 6,
                minW: 6,
                minH: 6
            }
        }[widgetName], resizeHandles: ['se', 'sw']
    })

    addItem = (widgetName) => {
        let widget = this.getWidget(widgetName)

        this.setState(p => ({
            items: [
                ...p.items,
                {
                    ...widget,
                    key: `widget_${p.widgetCounter}`,
                    ...this.placeItem(0, 0, widget.w, widget.h)
                }
            ],
            widgetCounter: p.widgetCounter + 1
        }))
    }

    removeItem = (key) => {
        this.setState({
            items: this.state.items.filter(item => item.key !== key)
        })
    }

    createElement = (item) => {
        return <div
            key={item.key}
            data-grid={{ ...item }}
        >
            {item.component(item.key)}
        </div>
    }

    handleToolbarClick = (name) => {
        this.addItem(name, this.state.items)

        // this.setState({
        //     items: this.addItem(name, this.state.items)
        // })
    }

    widgetCount = (widgetName) => this.state.items.filter(item => item.name === widgetName).length

    render() {
        return <div style={{ position: 'relative', width: '100%', height: '100%', minWidth: '600px' }}>
            <div style={{ width: 'calc(100% - 80px)', float: 'left' }}>
                <GridLayout
                    style={{ zIndex: 10 }}
                    draggableHandle='.grabbable'
                    margin={[0, 0]}

                    className="layout"
                    layouts={this.getLayouts()}
                    cols={{ lg: 24, md: 24, sm: 12 }}
                    breakpoints={{ lg: 1200, md: 996, sm: 768 }}

                    rowHeight={50}
                    // width={1550}
                >
                    {
                        this.state.items.map(
                            item => this.createElement(item)
                        )
                    }
                </GridLayout>
            </div>
            <div style={{
                width: '80px',
                right: '30px',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                // position: 'fixed',
                float: 'left'
            }}>
                <Card style={{
                    marginTop: '6px',
                    width: '60px',
                    height: '400px',
                    borderWidth: '0px',
                    padding: '10px',
                    fontSize: '14px',
                    boxShadow: '3px 3px 9px 2px rgba(0,0,0,0.05)',
                    padding: '0px',
                    display: 'flex',
                    borderRadius: '7px',
                    // justifyContent: 'space-evenly',
                    overflow: 'hidden',
                    zIndex: 11
                }}>
                    <div style={{ fontSize: '10px', height: '14px', backgroundColor: '#dde5ed', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    </div>
                    {
                        [
                            { icon: <BiLineChart size={25} />, name: 'Chart' },
                            { icon: <BiTable size={25} />, name: 'Status' },
                            { icon: <BiMap size={25} />, name: 'Map' },
                            { icon: <BiRadar size={25} />, name: 'Radar' },
                            { icon: <BiBarChart size={25} />, name: 'Signal' },
                            { icon: <BiCloud size={25} />, name: 'Weather' }
                        ].map((widget, i) =>
                            <OverlayTrigger
                                key='settings_tooltip'
                                placement='left'
                                overlay={
                                    <Tooltip id='tooltip-settings'>
                                        Add a {widget.name} widget.
                                    </Tooltip>
                                }>
                                <div
                                    onClick={e => this.handleToolbarClick(widget.name)}
                                    className='clickable darken'
                                    style={{
                                        position: 'relative',
                                        height: 'calc((100% - 14px)*0.2)',
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        zIndex: 10 - i,
                                    }}>
                                    <div style={{ display: 'block' }}>
                                        {
                                            widget.icon
                                        }
                                    </div>
                                    <div style={{ display: 'block', fontSize: '10px' }}>
                                        {widget.name.toUpperCase()}
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        fontSize: '10px',
                                        borderRadius: '50%',
                                        backgroundColor: this.widgetCount(widget.name) > 0 ? '#3f81eb' : '#e0e0e0',
                                        color:'white',
                                        width: '14px',
                                        height: '14px'
                                    }}>
                                        {this.widgetCount(widget.name)}
                                    </div>
                                </div>
                            </OverlayTrigger>

                        )
                    }
                </Card>
            </div>
        </div>
    }
}

export default Analysis;