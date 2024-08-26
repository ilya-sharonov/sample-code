import Joi from 'joi';
import { ActivityType } from '../constants/activities';

const activitySchemaWithEmptyId = {
    id: Joi.string().min(0).max(0).required(),
    name: Joi.string().max(255).required(),
    type: Joi.string().lowercase().valid(ActivityType.Journey).required(),
    description: Joi.string().max(255),
    timestamp: Joi.number().integer().min(1).max(Number.MAX_SAFE_INTEGER),
    timezoneOffset: Joi.number().integer().min(0).max(1000),
    location: Joi.string().max(255),
    coordinates: Joi.object({
        longitude: Joi.number().precision(5).max(180).min(-180),
        latitude: Joi.number().precision(5).max(180).min(-180),
    }),
};

const activitySchema = {
    ...activitySchemaWithEmptyId,
    id: Joi.string().min(32).max(32).hex().required(),
};

export const activitiesGetQueryValidation = Joi.object({
    roles: Joi.number().integer().min(1).max(63).default(32),
});

export const activitiesPostPayloadValidation = Joi.object(activitySchemaWithEmptyId);

export const activitiesPutPayloadValidation = Joi.alternatives().try(
    Joi.object(activitySchema),
    Joi.array().items(activitySchema),
);
