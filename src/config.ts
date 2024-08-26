import dotenv from 'dotenv';
import joi from 'joi';
import path from 'node:path';

const envConfigPath = path.resolve(path.join(__dirname, '.env'));

dotenv.config({ path: envConfigPath });

const envVarsSchema = joi
    .object()
    .keys({
        JWT_SECRET_KEY: joi.string().required(),
        JWT_SECRET_KEY_ENCODING: joi.string().valid('hex').required(),
        JWT_ALGORITHM: joi.string().valid('HS512').required(),
        JWT_USER_ID: joi.string().required(),
        NODE_ENV: joi.string().valid('production', 'development', 'test').required(),
        SERVER_PORT: joi.number().positive().integer().required(),
        SERVER_HOST: joi
            .string()
            .required(),
        POSTGRES_HOST: joi
            .string()
            /* .ip({
                version: ['ipv4', 'ipv6'],
                cidr: 'forbidden',
            }) */
            .required(),
        SERVER_HOST_REF: joi.string().required(),
        POSTGRES_PORT: joi.number().positive().integer().required(),
        POSTGRES_USER: joi.string().required(),
        POSTGRES_PASSWORD: joi.string().required(),
        POSTGRES_DATABASE: joi.string().required(),
        DATACENTER_ID: joi.number().positive().integer().required(),
        INSTANCE_ID: joi.number().positive().integer().required(),
        // REDIS_URL: joi.string().uri().required(),
        REDIS_URL: joi.string().required(),
        // NEO4J_HOST: joi.string().uri().required(),
        NEO4J_HOST: joi.string().required(),
        NEO4J_USER: joi.string().required(),
        NEO4J_PASSWORD: joi.string().required(),
        KAFKA_CLIENT_ID: joi.string().required(),
        KAFKA_BROKERS: joi.string().required(),
        KAFKA_TEST_GROUP_ID: joi.string().required(),
        KAFKA_TEST_TOPIC: joi.string().required(),
        KAFKA_PROD_GROUP_ID: joi.string().required(),
        KAFKA_PROD_TOPIC: joi.string().required(),
        GOOGLE_AUTH_KEYFILE: joi.string().required(),
        GOOGLE_AUTH_EMAIL: joi.string().email().required(),
        GOOGLE_AUTH_SCOPES: joi.string().required(),
        GOOGLE_AUTH_REFRESH_THRESHOLD: joi.number().positive().integer().required(),
        FIREBASE_MESSAGING_URL: joi.string().uri().required(),
    })
    .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export default {
    jwtSecretKey: envVars.JWT_SECRET_KEY,
    jwtSecretKeyEncoding: envVars.JWT_SECRET_KEY_ENCODING,
    jwtAlgorithm: envVars.JWT_ALGORITHM,
    jwtUserId: envVars.JWT_USER_ID,
    nodeEnv: envVars.NODE_ENV,
    serverPort: envVars.SERVER_PORT,
    serverHost: envVars.SERVER_HOST,
    serverHostRef: envVars.SERVER_HOST_REF,
    postgresHost: envVars.POSTGRES_HOST,
    postgresPort: envVars.POSTGRES_PORT,
    postgresUser: envVars.POSTGRES_USER,
    postgresPassword: envVars.POSTGRES_PASSWORD,
    postgresDatabase: envVars.POSTGRES_DATABASE,
    dataCenterId: envVars.DATACENTER_ID,
    instanceId: envVars.INSTANCE_ID,
    redisUrl: envVars.REDIS_URL,
    neo4jHost: envVars.NEO4J_HOST,
    neo4jUser: envVars.NEO4J_USER,
    neo4jPassword: envVars.NEO4J_PASSWORD,
    kafkaClientId: envVars.KAFKA_CLIENT_ID,
    kafkaBrokers: envVars.KAFKA_BROKERS.split(','),
    kafkaTestGroupId: envVars.KAFKA_TEST_GROUP_ID,
    kafkaTestTopic: envVars.KAFKA_TEST_TOPIC,
    kafkaProdGrouptId: envVars.KAFKA_PROD_GROUP_ID,
    kafkaProdTopic: envVars.KAFKA_PROD_TOPIC,
    googleAuthKeyFile: envVars.GOOGLE_AUTH_KEYFILE,
    googleAuthEmail: envVars.GOOGLE_AUTH_EMAIL,
    googleAuthScopes: envVars.GOOGLE_AUTH_SCOPES.split(','),
    googleAuthRefreshThreshold: envVars.GOOGLE_AUTH_REFRESH_THRESHOLD,
    firebaseMessagingUrl: envVars.FIREBASE_MESSAGING_URL,
};
