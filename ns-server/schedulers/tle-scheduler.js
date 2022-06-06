const axios = require('axios')
const fp = require('fastify-plugin');
// const SATELLITES = require('../data/satellites')
const { getLatLngObj, getSatelliteName } = require('tle.js')

// 'https://api.n2yo.com/rest/v1/satellite/positions/25544/41.702/-76.014/0/2/&apiKey=--APIKEY--'
const TLE_DATA_URL = 'https://www.celestrak.com/NORAD/elements/gp.php?GROUP=gnss&FORMAT=tle'
// const defaultPos = [48.160462, 17.130978]
// const defaultAlt = 153
const FRAME_LEN = 43200

const gnssFromName = (name) => ({
    'GSAT': 'GA',
    'GPS ': 'GP',
    'BEID': 'GB',
    'COSM': 'GL'
}[name.slice(0, 4)])

const prnFromName = (name, gnss) => {
    const match = name.match(/([0-9]+)K?\)$/)
    if (!match) {
        return null
    }
    const number = match[match.length - 1]
    return gnss === 'GL' ? parseInt(number.slice(1)) : parseInt(number)
}

module.exports = fp(function (fastify, opts, next) {
    let tleData = []

    const getSatPosData = () => {
        return tleData.map(tle => {
            const { lat, lng } = getLatLngObj(tle, Date.now())
            const name = getSatelliteName(tle)
            const gnss = gnssFromName(name)

            return {
                lat: lat,
                lon: lng,
                position: [lat, lng],
                name: name,
                gnss: gnss,
                prn: prnFromName(name, gnss)
            }
        }).filter(d => d.gnss && d.prn).sort((a, b) => (a.prn > b.prn) ? 1 : -1)
            .reduce((acc, curr, i, arr) => {
                // FIX PRNs OF GLONASS SATELLITES 1-33 (ORIGINALLY 2, 5, 10, ....)

                if (curr.gnss === 'GL') {
                    curr.prn = acc;
                    return i === arr.length - 1 ? arr : acc + 1
                }
                return i === arr.length - 1 ? arr : acc
            }, 1)
    }

    const refreshSatPosData = () => {
        console.log(`[TLE Data] refreshing data...`)

        axios.get(TLE_DATA_URL).then(res => {
            const data = res.data
                .split('\r\n')
                .reduce(
                    (prev, curr, i) => i % 3 === 0 ?
                        [...prev, curr] :
                        [...prev.slice(0, prev.length - 1), prev.slice(-1) + '\r\n' + curr]
                    , [])

            tleData = data.slice(0, data.length - 1)
            console.log(`[TLE Data] data refreshed...`)
        }).catch(err => {
            console.error(err)
        })
    }

    const initialize = async () => {
        fastify.decorate('getSatPosData', getSatPosData);

        refreshSatPosData();
        setInterval(refreshSatPosData, FRAME_LEN * 1000);
    }

    initialize();
    next();
})