import config from './config';
import { Buffer } from 'node:buffer';
import Hapi from '@hapi/hapi';
import Jwt from '@hapi/jwt';
import activityRoute from './routes/activities';
import personsRoute from './routes/persons';
import { appLog } from './logging';

const log = appLog.child({ module: 'index' });

const init = async () => {
    log.info({ port: config.serverPort, host: config.serverHost }, 'Starting backend');
    const server = Hapi.server({
        port: config.serverPort,
        host: config.serverHost,
    });

    server.route(activityRoute);
    server.route(personsRoute);

    await server.register({
        plugin: require('./plugins/id_generator_plugin').default,
        options: {
            dataCenterId: config.dataCenterId,
            instanceId: config.instanceId,
        },
    });

    await server.register({
        plugin: require('./plugins/redis_connection_plugin').default,
        options: { url: config.redisUrl },
    });

    await server.register({
        plugin: require('./plugins/neo4j_connection_plugin').default,
        options: { host: config.neo4jHost, username: config.neo4jUser, password: config.neo4jPassword },
    });

    await server.register({
        plugin: require('./plugins/postgres_connection_plugin').default,
        options: {
            host: config.postgresHost,
            port: config.postgresPort,
            user: config.postgresUser,
            password: config.postgresPassword,
            database: config.postgresDatabase,
        },
    });

    await server.register(Jwt);

    //@ts-ignore
    const keys = Buffer.from(config.jwtSecretKey, config.jwtSecretKeyEncoding);

    /**
     * Simple JWT strategy for testing purposes.
     * Replace with Keycloak.
     */
    server.auth.strategy('SimpleJWTStrategy', 'jwt', {
        keys,
        verify: {
            iss: 'core',
            sub: 'test:user',
            aud: 'core:activity',
        },
        validate: (artifacts, request, h) => {
            return {
                isValid: true,
                credentials: { userId: artifacts.decoded.payload.userId },
            };
        },
    });

    server.auth.default('SimpleJWTStrategy');

    await server.start();
    log.info('Backend started');
};

process.on('unhandledRejection', (err) => {
    log.fatal({ error: err }, 'Fatal error, exiting');
    process.exit(1);
});

init();
