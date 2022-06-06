import GPS from 'gps';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { Modal, Button, Form, ButtonToolbar, ButtonGroup, Alert, Spinner } from 'react-bootstrap';
import { defaultAlt, defaultPos } from './Dashboard';

function Settings(props) {
    const [lon, setLon] = useState(defaultPos[1])
    const [lat, setLat] = useState(defaultPos[0])
    const [alt, setAlt] = useState(defaultAlt)
    const [useDefPos, setUseDefPos] = useState(true)

    const [src, setSrc] = useState(null)

    // const [interval, setInterval] = useState(10)
    const inputFile = useRef(null)
    const [errorMessage, setErrorMessage] = useState('')
    const [loading, setLoading] = useState(false)

    // const intervals = [
    //     { val: 5, label: '5M' },
    //     { val: 10, label: '10M' },
    //     { val: 30, label: '30M' },
    //     { val: 60, label: '1H' },
    //     { val: 180, label: '2H' },
    //     { val: 300, label: '5H' },
    //     // { val: 1440, label: '1D' },
    // ]

    useEffect(() => {
        if (loading) {
            setTimeout(() => {
                // nmeaFromFile(src.content);

                setLoading(false)
                props.apply(true, lon, lat, alt, src);
            }, 100)
        }
    }, [loading])

    const handleUseDefPosCheck = () => {
        if (!useDefPos) {
            setLon(defaultPos[1])
            setLat(defaultPos[0])
            setAlt(defaultAlt)
        }
        setUseDefPos(!useDefPos)
    }

    const handleFileClick = () => {
        inputFile.current.click();
    }

    const onChangeFile = (event) => {
        event.stopPropagation();
        event.preventDefault();

        const reader = new FileReader()
        reader.onload = event => {
            let lines = event.target.result.split('\n')

            let errorIndex = _.chain(lines)
                .map(line => {
                    try {
                        return GPS.Parse(line)
                    } catch (err) {
                        console.error(err);
                        return false
                    }
                }).findIndex(v => !v).value()

            if (errorIndex >= 0) {
                setErrorMessage(`Faulty file: can't parse line ${errorIndex}: "${lines[errorIndex]}"`)
                setSrc(null)
            } else {
                setErrorMessage('')
                setSrc({
                    content: lines,
                    name: file.name
                });
            }
        }
        reader.onerror = error => {
            console.error(error);
            setErrorMessage(`Faulty file: can't read file"`)
            setSrc(null)
        }


        var file = event.target.files[0];
        reader.readAsText(file)
    }

    const handleApplyClick = () => {
        setLoading(true);


        // props.apply(true, lon, lat, alt, interval, src);
    }

    return (
        <Modal
            {...props}
            style={{ zIndex: 3001 }}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            onHide={() => props.apply(false)}
            backdropClassName='modal-backdrop foreground'
        >
            <div style={{ padding: '10px' }}>
                <Modal.Header closeButton style={{ borderWidth: '0px' }}>
                    <h4>Settings</h4>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ width: '100%', minHeight: '50px', position: 'relative' }}>
                        <div style={{ height: '40px', fontSize: '18px' }}>
                            <b>Receiver position</b>
                        </div>
                        <span>
                            The real position of the receiver station. These values are used in computation of positional error.
                            If using a NMEA file recorded by a receiver elsewhere, feel free to change values to fit the position of said receiver.
                        </span>
                        <div style={{ padding: '15px' }}>
                            <Form.Check checked={useDefPos} onChange={handleUseDefPosCheck} type="switch" label="Use default values" style={{ lineHeight: '12px', fontSize: '14px' }} />

                            <div style={{ width: '150px', display: 'inline-block', marginRight: '15px' }}>
                                <Form.Text style={{
                                    letterSpacing: '1px',
                                    color: 'gray',
                                    fontSize: '11px',
                                }}>
                                    Latitude
                                </Form.Text>
                                <Form.Control onChange={e => setLat(e.target.value)} disabled={useDefPos} type="number" value={lat} />
                            </div>
                            <div
                                style={{ width: '150px', display: 'inline-block', marginRight: '15px' }}>
                                <Form.Text style={{
                                    letterSpacing: '1px',
                                    color: 'gray',
                                    fontSize: '11px',
                                }}>
                                    Longitude
                                </Form.Text>
                                <Form.Control
                                    onChange={e => setLon(e.target.value)}
                                    disabled={useDefPos}
                                    type="number"
                                    value={lon}
                                />
                            </div>
                            <div style={{ width: '150px', display: 'inline-block' }}>
                                <Form.Text style={{
                                    letterSpacing: '1px',
                                    color: 'gray',
                                    fontSize: '11px',
                                }}>
                                    Altitude
                                </Form.Text>
                                <Form.Control onChange={e => setAlt(e.target.value)} disabled={useDefPos} type="number" value={alt} />
                            </div>
                        </div>
                    </div>

                    {/* <div style={{ width: '100%', minHeight: '50px', position: 'relative', marginTop: '40px' }}>
                        <div style={{ height: '40px', fontSize: '18px' }}>
                            <b>Timeframe</b>
                        </div>
                        <span>
                            The timeframe in which the application is visualizing data. Data older than given timeframe are not taken into account
                            when visualizing or computing statistics. Default to last 10 minutes.
                            <br/>If you wish to access older data visit the <i>Get Data</i> page.
                        </span>
                        <div style={{
                            padding: '15px',
                            fontSize: '16px',
                            width: '100%',
                        }}>
                            {
                                intervals.map(i =>
                                    <div
                                        onClick={() => setInterval(i.val)}
                                        className='clickable lighten'
                                        style={{
                                            display: 'inline-block',
                                            paddingLeft: '20px',
                                            paddingRight: '20px',
                                            color: interval === i.val ? 'black' : '#c0c0c0',
                                        }}>
                                        {i.label}
                                    </div>
                                )
                            }
                        </div>
                    </div> */}

                    <div style={{ width: '100%', minHeight: '50px', position: 'relative', marginTop: '40px' }}>
                        <div style={{ height: '40px', fontSize: '18px' }}>
                            <b>Data Source</b>
                        </div>
                        <span>
                            Source of data for the dashboard. Preset to LIVE data feed from receiver station at the FIIT rooftop. 
                            Alternatively select a <i>.txt</i> file from your file system containing NMEA messages.
                        </span>
                        <ButtonToolbar style={{ padding: '10px', marginLeft: '20px' }}>
                            <ButtonGroup>
                                <Button variant='outline-primary' active={!src} onClick={() => setSrc(false)}>Live Data</Button>
                                <Button variant='outline-primary' active={src} onClick={handleFileClick}>NMEA File</Button>
                            </ButtonGroup>
                        </ButtonToolbar>
                        <Alert
                            variant={errorMessage ? 'danger' : 'info'}
                            style={{
                                visibility: errorMessage || src ? 'visible' : 'hidden',
                                marginLeft: '30px',
                                width: '500px',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis'
                            }}>
                            {
                                src ? 'From file: ' + src.name : errorMessage ? errorMessage : ''
                            }
                        </Alert>
                        <input accept=".txt" type='file' id='file' ref={inputFile} style={{ display: 'none' }} onChange={onChangeFile} />
                    </div>

                </Modal.Body>
                <Modal.Footer style={{ borderWidth: '0px' }}>
                    <Button onClick={handleApplyClick}>
                        Apply Changes
                        <Spinner style={{
                            marginLeft: '10px',
                            display: loading ? '' : 'none'
                        }} size='sm' animation="border" />
                    </Button>
                </Modal.Footer>
            </div>
        </Modal>
    );
}

export default Settings;