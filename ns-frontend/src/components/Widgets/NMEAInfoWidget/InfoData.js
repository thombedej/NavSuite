import GPS from "gps"
import { io } from "socket.io-client"

export function getStructure(message) {
    const fields = {
        'UTC': {
            label: 'UTC',
            format: (v) => v ? `${v.slice(0, 2)}:${v.slice(2, 4)}:${v.slice(4, 6)}` : null,
        },
        'Lat': {
            label: 'Latitude', unit: '°', format: (v) => {
                let parsed = GPS.Parse(message)
                return parsed.lat ? +(parsed.lat).toFixed(6) : null
            }
        },
        'Lat Dir': { label: 'Lat Direction', },
        'Lon': {
            label: 'Longitude', unit: '°', format: (v) => {
                let parsed = GPS.Parse(message)
                return parsed.lon ? +(parsed.lon).toFixed(6) : null
            }
        },
        'Data Status': {
            label: 'Data Status', notes: [
                'A = Data Valid',
                'V = Data Invalid'
            ]
        },
        'Lon Dir': { label: 'Lon Direction', },
        'Alt': { label: 'Altitude', unit: ' m' },
        'HDOP': { label: 'Horizontal DOP' },
        'VDOP': { label: 'Vertical DOP' },
        'PDOP': { label: 'Position DOP' },
        'Checksum': { label: 'Checksum', prefix: '*' },
        'Satellite Info': [
            { label: 'SV PRN number', skippable: true },
            { label: 'Elevation (90 max)', unit: '°', skippable: true },
            { label: 'Azimuth', unit: '°', skippable: true },
            {
                label: 'SNR', format: (v) => {
                    if (!v) {
                        return '0 dB (in view)'
                    } else {
                        return `${v} dB (tracking)`
                    }
                }
            }
        ],
        'Empty': { label: '(Not Used)' },
        'Mode Indicator': { label: 'Mode indicator', notes: ['A = Autonomous', 'D = Differential', 'E = Estimated', 'M = Manual input', 'N = Data not valid'] }
    }

    let multiple = (n, content, label) => {
        let result = [{ label: label, fields: 0 }]
        result = []

        for (var i = 1; i <= n; i++) {
            result = [...result, ...content]
        }

        return result
    }

    const structure = {
        'GLL': [
            { label: 'Latitude', unit: '°', },
            { label: 'Lat Direction', },
            { label: 'Longitude', unit: '°', },
            { label: 'Lon Direction', },
            { label: 'UTC', format: (v) => new Date(parseFloat(v)).toLocaleTimeString(), },
            'Data Status',
            { label: 'Mode Indicator' },
            { label: 'Checksum Data', prefix: '*' }
        ],
        'GGA': [
            'UTC',
            'Lat',
            'Lat Dir',
            'Lon',
            'Lon Dir',
            {
                label: 'Fix Quality', notes: [
                    '0 = Invalid',
                    '1 = GNSS fix (SPS)',
                    '2 = DGPS fix',
                    '3 = PPS fix',
                    '4 = Real Time Kinematic',
                    '6 = Estimated (dead reckoning) (2.3 feature)',
                    '7 = Manual input mode',
                    '8 = Simulation mode'
                ]
            },
            { label: '# of tracked satellites' },
            'HDOP',
            'Alt',
            { label: 'Altitude Units', notes: ['M = metres'] },
            { label: 'Undulation', notes: ['Height of geoid above WGS84 ellipsoid'] },
            { label: 'Undulation Units', notes: ['M = metres'] },
            // { label: 'Time since last DGPS update', format: (v) => new Date(parseFloat(v)).toLocaleTimeString(), },
            { label: 'Age of correction data', skippable: true, unit: 's' },
            { label: 'DGPS reference station ID' },
            'Checksum'
        ],
        'GSA': [
            { label: 'Mode', notes: ['M = Manual, forced to operate in 2D or 3D', 'A = Automatic, 3D/2D'] },
            {
                label: 'Mode', notes: [
                    '1 = Fix not available',
                    '2 = 2D',
                    '3 = 3D'
                ]
            },
            ...multiple(12, [{ label: 'SV ID', skippable: true }], 'SVs used in position fix'),
            'PDOP',
            'HDOP',
            'VDOP',
            { label: 'System ID' },
            'Checksum'
        ],
        'GSV': [
            { label: '# of messages' },
            { label: 'Message number' },
            { label: '# of SVs in view' },
            {
                multiple: 4,
                info: 'Satellite Info',
                content: fields['Satellite Info']
            },
            // ...multiple(4, fields['Satellite Info'], 'Satellite Info'),
            { label: 'System ID' },
            'Checksum'
        ],
        'RMA': [
            'Data Status',
            'Lat',
            'Lat Dir',
            'Lon',
            'Lon Dir',
            'Empty',
            'Empty',
            { label: 'Speed', unit: ' knots' },
            { label: 'Course' },
            { label: 'Variation' },
            { label: 'Direction of Variation' },
            'Checksum'
        ],
        'GNS': [
            'UTC',
            'Lat',
            'Lat Dir',
            'Lon',
            'Lon Dir',
            {
                label: 'Mode Indicator',
                notes: [
                    'Order: GPS, GLONASS, Galileo, BeiDou',
                    'N = No fix.',
                    'A = Autonomous.',
                    'D = Differential.',
                    'P = Precise.',
                    'R = Real Time Kinematic.',
                    'F = Float RTK.',
                    'E = Estimated (dead reckoning) mode.',
                    'M = Manual input mode.',
                    'S = Simulator mode.'
                ]
            },
            { label: '# of satellites in fix' },
            'HDOP',
            'Alt',
            { label: 'Undulation', notes: ['Height of geoid above WGS84 ellipsoid'], unit: ' m' },
            { label: 'Age of correction data', unit: 's', skippable: true },
            { label: 'Differential reference station ID', skippable: true },
            { label: 'Navigational Status', notes: ['S = Safe', 'C = Caution', 'U = Unsafe', 'V = Not valid for navigation'] },
            'Checksum'
        ],
        'VTG': [
            { label: 'Track True', unit: '°', notes: ['Track made good, degrees True'] },
            { label: 'True track indicator', notes: ['T = True'] },
            { label: 'Track Mag', unit: '°', notes: ['Track made good, degrees Magnetic'] },
            { label: 'Magnetic track indicator', notes: ['M = Magnetic'] },
            { label: 'Speed over ground', unit: ' knots' },
            { label: 'Speed unit', notes: ['N = knots'] },
            { label: 'Speed over ground', unit: ' km/h' },
            { label: 'Speed unit', notes: ['K = km/h'] },
            { label: 'Mode indicator', notes: ['A = Autonomous', 'D = Differential', 'E = Estimated', 'M = Manual input', 'N = Data not valid'] },
            'Checksum'
        ],
        'RMC': [
            'UTC',
            { label: 'Position status', notes: ['A = Data valid', 'V = Data invalid'] },
            'Lat',
            'Lat Dir',
            'Lon',
            'Lon Dir',
            { label: 'Speed over ground', unit: ' knots' },
            { label: 'Track True', unit: '°', notes: ['Track made good, degrees True'] },
            { label: 'Date', format: (v) => v ? `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4, 6)}` : null },
            { label: 'Magnetic variation', unit: '°' },
            { label: 'Direction', notes: ['Direction of magnetic variation', 'E = East', 'W = West'] },
            'Mode Indicator',
            'Empty',
            'Checksum'
        ],
        'GST': [
            'UTC',
            { label: 'RMS', notes: ['RMS value of the standard deviation of range inputs'] },
            { label: 'Semi-major STD', notes: ['Standard deviation of semi-major axis of error ellipse'], unit: ' m' },
            { label: 'Semi-minor STD', notes: ['Standard deviation of semi-minor axis of error ellipse'], unit: ' m' },
            { label: 'Orientation', notes: ['Orientation of semi-major axis of error ellipse'], unit: '° (from true north)' },
            { label: 'Lat STD', notes: ['Standard deviation of latitude error'], unit: ' m' },
            { label: 'Lon STD', notes: ['Standard deviation of longitude error'], unit: ' m' },
            { label: 'Alt STD', notes: ['Standard deviation of altitude error'], unit: ' m' },
            'Checksum'
        ],
        'ZDA': [
            'UTC',
            { label: 'Day' },
            { label: 'Month' },
            { label: 'Year' },
            { label: 'Local zone' },
            { label: 'Local zone minutes' },
            'Checksum'
        ]
    }

    if (!structure[message.slice(3, 6)])
        return []

    let messageFields = message.split(/[\*,]/)
    let messageFieldsLen = messageFields.length - 1
    let maxFields = structure[message.slice(3, 6)].reduce((prev, curr) => curr.multiple ? prev + curr.multiple * curr.content.length : prev + 1, 0)

    let arr = structure[message.slice(3, 6)].reduce((prev, curr) => {
        if (typeof curr === 'string' || curr instanceof String) {
            return [...prev, fields[curr]]
        }
        if (curr.multiple) {
            return [
                ...prev,
                // { label: curr.info, info: true },
                ...multiple(curr.multiple - (maxFields - messageFieldsLen) / curr.multiple, curr.content)
            ]
        } else {
            return [...prev, curr]
        }
    }, []).map((e, i) => ({
        unit: '',
        prefix: '',
        notes: [],
        fields: 1,
        format: (a) => {
            return a ? a : null
        },
        ...e
    }))

    let index = -1

    return arr.map(e => {
        if (e.info === true) {
            return e
        } else {
            index++
            return {
                ...e,
                index: index
            }
        }
    })



    // return structure[message.slice(3, 6)] ? structure[message.slice(3, 6)].map(
    //     e => (typeof e === 'string' || e instanceof String) ? (fields[e]) : e
    // ).map(e => ({
    //     unit: '',
    //     prefix: '',
    //     notes: [],
    //     fields: 1,
    //     format: (a) => a,
    //     ...e
    // })) : []
}