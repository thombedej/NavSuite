var _ = require('lodash');

const toTS = (date) => {
    if (!date) {
        return toTS(new Date().toISOString())
    }
    return date.replace('T', ' ').replace('Z', '')
}

async function routes(fastify) {
    fastify.pg.connect(function (err) {
        if (err) {
            return console.error('could not connect to postgres', err);
        }
        fastify.pg.query('SELECT NOW() AS "theTime"', function (err, result) {
            if (err) {
                return console.error('error running query', err);
            }
            console.log('Connected to database...');
            // >> output: 2018-08-23T14:02:57.117Z
            // client.end();
        });
    });


    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------


    fastify.get('/test', async (req, res) => {
        console.log('test successful')
        res.code(200).send('test successful')
    })


    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------


    fastify.get('/testdb', async (req, res) => {
        fastify.pg.query('SELECT NOW() AS "theTime"', function (err, result) {
            if (err) {
                // res.code(400).send(err)
                return console.error('error running query', err);
            }
            console.log(result.rows[0].theTime);
            res.code(200).send(result.rows[0].theTime)
            // >> output: 2018-08-23T14:02:57.117Z
            // client.end();
        });
    })


    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------


    fastify.get('/live/:minutes', async (req, res) => {
        let minutes = req.params.minutes;
        let query = `
            WITH constants AS (
                SELECT NOW() - INTERVAL '${minutes} minutes' AS cutoff
            )
            SELECT *
            FROM navdata, constants
            WHERE time > cutoff;
        `
        // SELECT id, time + interval '0h' as time, gnss_type, lat, lon, alt, vdop, pdop, hdop, speed 
        // FROM navdata, constants
        // WHERE time > NOW() - INTERVAL '0h ${minutes} minutes' ORDER BY time ASC;

        let queryWeather = `
            WITH constants AS (
                SELECT NOW() - INTERVAL '${minutes} minutes' AS cutoff
            )
            SELECT *
            FROM weather, constants
            WHERE time > cutoff;
        `

        // SELECT humidity, temperature, pressure, precipitation, light, time + interval '0h' as time
        // FROM weather
        // WHERE time > NOW() - INTERVAL '0h ${minutes} minutes' ORDER BY time ASC;

        fastify.pg.query(query, (err, result) => {
            if (err) {
                return console.error('Getting data failed:', err.message)
            }

            let states = result.rows

            fastify.pg.query(queryWeather, (err, wResult) => {
                if (err) {
                    console.error('Getting weather data failed: ', err)

                    res.send({
                        states: states,
                        weather: []
                    })
                }
                else {
                    res.send({
                        states: states,
                        weather: wResult.rows
                    })
                }
            })
        })
    })


    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------


    fastify.get('/data/available/:minutes', async (req, res) => {
        let minutes = req.params.minutes
        console.log(minutes)
        fastify.pg.query(
            `SELECT DISTINCT date_trunc('hour', time) + date_part('minute', time)::int / ${minutes} * interval '${minutes} min' AS time
            FROM navdata ORDER BY time desc`,
            (err, result) => {
                if (err) {
                    return console.error('error querying for min/max date', err)
                }
                res.code(200).send(result.rows)
            })
    })


    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------


    fastify.post('/data/download', schema = {
        body: {
            startDate: {
                type: 'string'
            },
            endDate: {
                type: 'string'
            },
            gnssTypes: {
                type: 'array'
            }
        }
    }, async (req, res) => {
        let startDate = req.body.startDate
        // roundDateDown(req.body.startDate)
        let endDate = req.body.endDate
        // roundDateUp(req.body.endDate)
        let query = `
            SELECT nmea FROM nmea 
            WHERE gnss_type SIMILAR TO '(${req.body.gnssTypes.join('|')})' 
            AND time BETWEEN '${startDate}' AND '${endDate}' ORDER BY id ASC
        `
        fastify.pg.query(query, (err, result) => {
            if (err) {
                return console.error('error querying for data in interval', err)
            }

            res.code(200).send(result.rows.map(r => r.nmea))
        })
    })


    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------


    fastify.post('/data/downloadCSV', schema = {
        body: {
            startDate: {
                type: 'string'
            },
            endDate: {
                type: 'string'
            },
            gnssTypes: {
                type: 'array'
            }
        }
    }, async (req, res) => {
        let startDate = req.body.startDate
        // roundDateDown(req.body.startDate)
        let endDate = req.body.endDate
        // roundDateUp(req.body.endDate)
        let query = `SELECT * FROM navdata WHERE gnss_type SIMILAR TO '(${req.body.gnssTypes.join('|')})' AND time BETWEEN '${startDate}' AND '${endDate}' ORDER BY id ASC`
        fastify.pg.query(query, (err, result) => {
            if (err) {
                return console.error('error querying for data in interval', err)
            }

            res.code(200).send(result.rows)
        })
    })


    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------------------


    fastify.post('/sendGNSS', schema = {
        body: {
            type: 'object'
        }
    }, async (req, res) => {
        const ts = toTS()
        const { states, weather, messages } = req.body

        let query = `
            INSERT INTO navdata (gnss_type, lat, lon, alt, vdop, pdop, hdop, speed, time) 
            VALUES ${states.map(
            state => `(${[
                `'${state.gnss_type}'`,
                state.lat || 'NULL',
                state.lon || 'NULL',
                state.alt || 'NULL',
                state.pdop || 'NULL',
                state.vdop || 'NULL',
                state.hdop || 'NULL',
                state.speed || 'NULL',
                `'${ts}'`
            ].join(", ")})`
        ).join(", ")};

            INSERT INTO nmea (gnss_type, nmea_type, nmea, time)
            VALUES ${messages.map(msg =>
            `('${msg.slice(1, 3)}', '${msg.slice(3, 6)}', '${msg}', '${ts}')`
        ).join(", ")};
            
            INSERT INTO weather (humidity, temperature, pressure, precipitation, light, time)
            VALUES (${['humidity', 'temperature', 'pressure', 'precipitation', 'light', 'time'].map(
            p => weather[p] !== undefined && weather[p] !== null ?
                p === 'time' ? `'${ts}'` : weather[p] : 'NULL'
        ).join(', ')});
        `

        // console.log(query)
        fastify.pg.query(query, function (err, result) {
            if (err) {
                // console.log(query)
                return res.code(503).send('INSERT UNSUCCESSFUL.')
            }

            res.code(200).send('INSERT SUCCESSFUL.')
        });

        fastify.io.send(JSON.stringify(
            {
                states: states,
                messages: messages,
                weather: weather,
                satellites: fastify.getSatPosData(),
            }
        ))

        return res.code(200).send('DONE.')
    })
}

module.exports = routes;