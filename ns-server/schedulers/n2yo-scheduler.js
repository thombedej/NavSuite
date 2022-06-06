const axios = require('axios')
const { default: fastify } = require('fastify');
const fp = require('fastify-plugin');
const SATELLITES = require('../data/satellites')

// 'https://api.n2yo.com/rest/v1/satellite/positions/25544/41.702/-76.014/0/2/&apiKey=--APIKEY--'
const N2YO_API_URL = 'https://api.n2yo.com/rest/v1'
const defaultPos = [48.160462, 17.130978]
const defaultAlt = 153
const FRAME_LEN = 300



let satData = [...SATELLITES]

module.exports = fp(function (fastify, opts, next) {
    const getSatPosData = () => {
        let posIndex = satData[0].positions && satData[0].positions.findIndex(pos => parseInt(pos.timestamp) === ~~(Date.now() / 1000))
        posIndex = posIndex > 0 ? posIndex : satData[0].length - 1


        return satData.map(({ positions, ...sat }) => ({
            ...sat,
            position: posIndex ? positions[posIndex] : {}
        }))
    }

    const refreshSatPosData = () => {
        console.log(`[N2YO API] requesting data...`)
        axios.all(
            SATELLITES.map(
                sat => axios.get(`${N2YO_API_URL}/satellite/positions/${sat.norad}/${defaultPos[0]}/${defaultPos[1]}/${defaultAlt}/${FRAME_LEN}/&apiKey=${fastify.config.N2YO_APIKEY}`)
            )
        ).then(responses => {
            let response_data = responses.map(res => res.data)
            console.log(`[N2YO API] data obtained. (transactions: ${response_data[response_data.length - 1].info.transactionscount} / 1000)`)

            satData = SATELLITES.map((sat, i) => ({
                ...sat,
                name: response_data[i].info.satname,
                positions: response_data[i].positions
            }))
        })
    }

    const initialize = async () => {
        fastify.decorate('getSatPosData', getSatPosData)

        refreshSatPosData()
        setInterval(refreshSatPosData, FRAME_LEN * 1000)
    }

    initialize();
    next();
})