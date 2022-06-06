import React, { useEffect } from 'react';
import Page from '../Page';
import { Button, Card, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { Slider } from '@mui/material';
import { GNSS_INFO_LIST } from '../Dashboard/Dashboard';
import Loadable from '../../Loadable';
import _ from 'lodash';
import { PRIMARY_COLOR, SERVER_URL } from '../../../App';

function GetData() {
    const [hourRange, setHourRange] = React.useState([1, 48]);

    const [dates, setDates] = React.useState([]);
    const [selected, setSelected] = React.useState(null);
    const [selectedGNSS, setSelectedGNSS] = React.useState(['GPS']);
    const [loadingPage, setLoadingPage] = React.useState(true);
    const [downloading, setDownloading] = React.useState(false);
    const [selectedFormat, setSelectedFormat] = React.useState('NMEA');

    const warningMessage = () => {
        return selectedGNSS.length ? null : <span className="mt-1" style={{ color: 'darkred' }}>* select some GNSS systems.</span>
    }

    const isSameDay = (date1, date2) => (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    )

    const getAvailableRange = () => {
        axios.get(
            `${SERVER_URL}/data/available/30`
        ).then(res => {
            console.log(res.data);
            const today = new Date()
            const availableDates = res.data.map(d => new Date(d.time))
            const lastMonthDates = Array.from(Array(30).keys()).map(i =>
                new Date(new Date().setDate(today.getDate() - i))
            )

            console.log(availableDates)

            const dates = lastMonthDates.map(date => {
                let chunks = availableDates.filter(d => isSameDay(d, date))
                // console.log(chunks)
                let available = chunks.map(d => ({
                    value: d.getHours() * 2 + (d.getMinutes() >= 30 ? 1 : 0),
                    ts: d.toISOString()
                }))

                available = available || []

                let extra = available.map(mark => mark.value + 1).filter(v => !_.find(marks, ['value', v]))
                let marks = [...available, ...extra.map(e => ({ value: e }))]

                return {
                    t: date,
                    isAvailable: chunks.length ? true : false,
                    chunks: chunks,
                    available: available,
                    marks: marks,
                }
            })

            setDates(dates)

            let i = dates.findIndex(d => d.isAvailable)
            setSelected(i)
            if (i >= 0) {
                setHourRange([
                    Math.min(...dates[i].marks.map(c => c.value)),
                    Math.max(...dates[i].marks.map(c => c.value))
                ])
            }
            // handleDateSelect(0)

            setLoadingPage(false)
        }).catch(err => {
            console.error('Getting available dates failed.', err)
        })

        // setMinDate(new Date(2021, 9, 20))
        // setMaxDate(new Date(2021, 9, 24))
    }

    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    function downloadCSV(filename, content) {
        let cols = _.keys(content[0])

        let text = cols.join(',') + '\n' + content.map(
            row => cols.map(col => col === 'time' ? new Date(row[col]).getTime() : row[col]).join(',')
        ).join('\n')

        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    const handleDownload = () => {
        setDownloading(true)
        // let [max, min] = selectedDate().marks.filter(e => hourRange.includes(e.value)) 
        let min = new Date(
            selectedDate().t.getFullYear(),
            selectedDate().t.getMonth(),
            selectedDate().t.getDate(),
            ~~(hourRange[0] / 2),
            (hourRange[0] % 2 ? 30 : 0)
        ).toISOString()
        let max = new Date(
            selectedDate().t.getFullYear(),
            selectedDate().t.getMonth(),
            selectedDate().t.getDate(),
            ~~(hourRange[1] / 2),
            (hourRange[1] % 2 ? 30 : 0)
        ).toISOString()

        let isCSV = selectedFormat === '.CSV Data'
        console.log(selectedFormat)

        axios.post(
            `${SERVER_URL}/data/download${isCSV ? 'CSV' : ''}`, {
            startDate: min,
            endDate: max,
            gnssTypes: GNSS_INFO_LIST.filter(gnss => selectedGNSS.includes(gnss.name)).map(gnss => gnss.label)
        }
        ).then(res => {
            setDownloading(false)
            isCSV ?
                downloadCSV(`data_${`${min}`.slice(0, -8)}-${`${max}`.slice(0, -8)}.csv`, res.data) :
                download(`nmea_${`${min}`.slice(0, -8)}-${`${max}`.slice(0, -8)}.txt`, res.data.join('\n'))
        }).catch(err => {
            setDownloading(false)
            console.error('Download failed.', err)
        })
    }

    useEffect(() => {
        getAvailableRange()
    }, [])

    const displayTime = (n) => {
        let hour = ~~(n / 2)
        let minutes = n % 2

        return `${hour === 24 ? '0' : hour}:${minutes ? '30' : '00'}:00`
    }

    const selectedDate = () => {
        return dates[selected]
    }

    const handleDateSelect = (i) => {
        setHourRange([
            Math.min(...dates[i].marks.map(c => c.value)),
            Math.max(...dates[i].marks.map(c => c.value))
        ])
        setSelected(i)
    }

    const handleGNSSClick = (gnss) => {
        setSelectedGNSS(
            selectedGNSS.includes(gnss) ?
                selectedGNSS.filter(i => i !== gnss) :
                [...selectedGNSS, gnss]
        )
    }

    const handleFormatClick = (format) => {
        setSelectedFormat(format)
    }

    const circle = (segment) => {
        return <div style={{
            position: 'absolute',
            left: `calc(${(100 / 48) * (segment) + 100 / 96}% - 2px )`,
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: 'green'
        }} />
    }

    const getMarks = () => selected !== null && dates[selected] ? dates[selected].marks : []
    const getAvailable = () => selected !== null && dates[selected] ? _.map(
        dates[selected].available,
        mark => circle(mark.value)
    ) : null

    return (
        <Page title="Get Data">
            <span style={{ fontSize: '16px', width: '800px', paddingLeft: '4%', paddingTop: '30px' }}>Download GNSS navigation data from our server.
                Data is gathered by a receiver station installed on the FIIT building rooftop and stored inside a database. Stored datapoints include
                positional fixes for each of the 4 main GNSS - GPS, Galileo, GLONASS and BeiDou. All the source messages of this data are also
                stored in <b>NMEA</b> format.
                <br />
                Data will be downloaded in the form of a <i>.txt</i> file (NMEA) or <i>.csv</i> file.
            </span><br />
            <div>
                {/* <div style={{ width: '250px', float: 'left' }}>
                    <DatePicker
                        placeholderText="Click to select an interval"
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => {
                            setDateRange(update);
                        }}
                        withPortal
                        fixedHeight
                        className="datepicker"
                        isClearable
                        minDate={minDate}
                        maxDate={maxDate}
                    />
                </div> */}

                <Loadable opacity={0.9} loading={loadingPage}>
                    <Form style={{ width: '90%', margin: 'auto' }}>
                        <Form.Group className='mb-5'>
                            <Form.Label style={{ color: 'gray', fontSize: '14px', marginBottom: '5px' }}>Select Date</Form.Label>
                            <Form.Select onChange={e => { handleDateSelect(e.target.value) }} style={{ width: '200px' }}>
                                {
                                    dates.map((date, i) =>
                                        <option key={date.t} value={i} disabled={!date.isAvailable} style={{ color: date.isAvailable ? '' : '#c6c6c6' }}>
                                            {
                                                date.isAvailable ?
                                                    date.t.toLocaleDateString() :
                                                    `${date.t.toLocaleDateString()}`
                                            }
                                        </option>
                                    )
                                }
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className='mb-5'>
                            <Form.Label style={{ color: 'gray', fontSize: '14px', marginBottom: '5px' }}>Select Hour Interval</Form.Label>
                            <Card style={{ padding: '30px' }}>
                                <div style={{ width: '90%', margin: 'auto', position: 'relative' }}>
                                    {getAvailable()}
                                    <Slider
                                        onChange={e => { setHourRange(e.target.value) }}
                                        style={{ width: '100%', display: 'block' }}
                                        min={0}
                                        max={48}
                                        step={null}
                                        color='primary'
                                        marks={getMarks()}
                                        value={hourRange}
                                        // size='small'
                                        valueLabelFormat={v => displayTime(v)}
                                        valueLabelDisplay="auto"></Slider>
                                    <div style={{
                                        marginTop: '24px', fontSize: '19px', width: '100%', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center'
                                    }}>
                                        <span>
                                            {displayTime(hourRange[0])}
                                        </span>
                                        <div style={{ width: '50px', textAlign: 'center', fontSize: '19px' }}>-</div>
                                        <span>{displayTime(hourRange[1])}</span>
                                    </div>
                                </div>
                            </Card>
                        </Form.Group>
                        <Form.Group className='mb-5'>
                            <Form.Label style={{ color: 'gray', fontSize: '14px', marginBottom: '5px' }}>Selected GNSS</Form.Label>
                            <div style={{ margin: '20px', height: '35px' }}>
                                {
                                    GNSS_INFO_LIST.map(({ name }) => {
                                        let isSelected = selectedGNSS.includes(name)

                                        return <span style={{
                                            marginRight: '40px',
                                            padding: '5px',
                                            color: isSelected ? PRIMARY_COLOR : '',
                                            borderColor: isSelected ? PRIMARY_COLOR : '',
                                            borderBottomStyle: isSelected ? 'solid' : ''
                                        }} className="gnss-select clickable noselect" onClick={_ => handleGNSSClick(name)}>
                                            {name}
                                        </span>
                                    })
                                }
                            </div>
                        </Form.Group>
                        <Form.Group className='mb-5'>
                            <Form.Label style={{ color: 'gray', fontSize: '14px', marginBottom: '5px' }}>Selected GNSS</Form.Label>
                            <div style={{ margin: '20px', height: '35px' }}>
                                {
                                    ['NMEA', '.CSV Data'].map(format => {
                                        let isSelected = selectedFormat === format

                                        return <span style={{
                                            marginRight: '40px',
                                            padding: '5px',
                                            color: isSelected ? PRIMARY_COLOR : '',
                                            borderColor: isSelected ? PRIMARY_COLOR : '',
                                            borderBottomStyle: isSelected ? 'solid' : ''
                                        }} className="gnss-select clickable noselect"
                                            onClick={() => handleFormatClick(format)}>
                                            {format}
                                        </span>
                                    })
                                }
                            </div>
                        </Form.Group>

                        <Button
                            onClick={handleDownload}
                            disabled={!selectedGNSS.length || loadingPage || downloading}
                            style={{ display: 'block' }}
                            variant="dark" >
                            Download data

                            <Spinner style={{ marginLeft: '10px', display: downloading ? '' : 'none' }} size='sm' animation="border" />
                        </Button>
                        {warningMessage()}
                    </Form>
                </Loadable>
            </div>
        </Page >
    )
}

export default GetData;