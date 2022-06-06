const fastify = require('fastify')();

const path = require('path');
var pg = require('pg');

const PORT = 3001

const schema = {
    type: 'object',
    required: ['DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'],
    properties: {
        DB_PASSWORD: { type: 'string' },
        DB_USERNAME: { type: 'string', default: 'postgres' },
        DB_PORT: { type: 'number', default: 5432 },
        DB_NAME: { type: 'string' }
    }
}

const options = {
    confKey: 'config',
    dotenv: true,
    schema: schema
}

const initialize = async () => {
    fastify.register(require('fastify-env'), options)
    await fastify.after()

    const username = encodeURIComponent(fastify.config.DB_USERNAME)
    const password = encodeURIComponent(fastify.config.DB_PASSWORD)
    const port = encodeURIComponent(fastify.config.DB_PORT)
    const dbName = encodeURIComponent(fastify.config.DB_NAME)
    // const dbUrl = `postgres://${username}:${password}@postgres-service:${port}/${dbName}`
    const dbUrl = `postgres://${username}:${password}@ns-postgres.postgres.database.azure.com/postgres?sslmode=require`

    fastify.register(require('fastify-postgres'), {
        connectionString: dbUrl
    })

    fastify.register(require('fastify-cors'), {
        origin: "*",
        allowedHeaders: ['Origin', 'X-Requested-With', 'Accept', 'Content-Type', 'Authorization', 'Content-Disposition'],
        methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE']
    })

    fastify.register(require('fastify-socket.io'), {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
        },
        // prefix: '/server'
    })

    fastify.register(require('fastify-cron'), {
        jobs: [{
            cronTime: '0 0 * * *',
            onTick: async fastify => {
                console.log('[cron] REMOVING OLD DATA...')
                let query = `
                DELETE FROM navdata 
                    WHERE time < NOW() - INTERVAL '30d'; 
                DELETE FROM nmea 
                    WHERE time < NOW() - INTERVAL '30d';
                DELETE FROM weather 
                    WHERE time < NOW() - INTERVAL '30d';
                `
                fastify.pg.query(query, (err) => {
                    if (err) {
                        return console.error('Deleting data failed:', err.message)
                    }
                    console.log('[cron] OLD DATA REMOVED.')
                })
            }
        }]
    })
    fastify.register(require('./routes'), { prefix: '/server' })
    fastify.register(require('./schedulers/tle-scheduler'), { prefix: '/server' })
    // fastify.register(require('./schedulers/n2yo-scheduler'), { prefix: '' })
}

initialize();

(async () => {
    try {
        await fastify.ready(() => {
            fastify.io.on('connect', socket => {
                console.info('Socket connected', socket.id)
            })
        })
        await fastify.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is up on port ${PORT}...`) ;
            fastify.cron.startAllJobs()
        })
    } catch (error) {
        fastify.log.error(error)
        process.exit(1)
    }
})();