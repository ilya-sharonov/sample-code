import Boom from '@hapi/boom';
import {
    Activity,
    CreateActivityParams,
    CreateActivityResponse,
    GetActivitiesParams,
    GetActivitiesResponse,
    OkResponse,
    UpdateActivitiesParams,
    UpdateActivityParams,
} from '../types';
import { activityKey } from '../helpers/keys';
import { getActivitiesForPerson } from '../graphdb';
import { appLog } from '../logging';
import { ActivityError } from '../constants/errors';
import { okResponse } from '../helpers/responses';
import { mapActivitiesToRecords } from '../helpers/activities';

const moduleLog = appLog.child({ module: 'activities' });

interface ActivitiesThis {
    getId: () => Generator<string, never, unknown>;
    getCacheClient: any;
    getGraphClient: any;
}

export async function createActivity(
    this: ActivitiesThis,
    { payload, userId }: CreateActivityParams,
): Promise<CreateActivityResponse> {
    const log = moduleLog.child({ function: 'createActivity' });
    const { getId, getCacheClient } = this;
    const activityId = getId().next().value;
    const redisActivityKey = activityKey`${userId}${activityId}`;
    const activity: Activity = { ...payload, id: activityId };
    const cache = await getCacheClient();

    try {
        const activityRecord = JSON.stringify(activity);
        await cache.set(redisActivityKey, activityRecord);
        log.debug({ redisActivityKey, activity, userId, activityId }, 'New activity stored in cache');
    } catch (e: any) {
        log.error({ error: e }, 'Error storing activity in cache');
        throw Boom.internal(ActivityError.Create);
    }

    log.info({ userId, activityId }, 'New activity created');
    return {
        ...okResponse,
        id: activityId,
    };
}

export async function updateActivity(
    this: ActivitiesThis,
    { payload, userId }: UpdateActivityParams,
): Promise<OkResponse> {
    const log = moduleLog.child({ function: 'updateActivity' });
    const { getCacheClient } = this;
    const { id } = payload;
    const redisActivityKey = activityKey`${userId}${id}`;
    const cache = await getCacheClient();
    let activityExists = false;

    try {
        activityExists = await cache.exists(redisActivityKey);
    } catch (e: any) {
        log.error({ error: e, userId, activityId: id, redisActivityKey }, 'Can not check activity in cache');
        throw Boom.internal(ActivityError.Update);
    }

    if (!activityExists) {
        log.error({ userId, activityId: id, redisActivityKey }, 'Relevant activity not found in cache');
        throw Boom.badRequest(ActivityError.Update);
    }

    try {
        await cache.set(redisActivityKey, JSON.stringify(payload));
        log.debug({ redisActivityKey, activity: payload, userId, activityId: id }, 'Updated activity saved to cache');
    } catch (e: any) {
        log.error({ error: e, userId, activityId: id, redisActivityKey }, 'Error saving activity to cache');
        throw Boom.internal(ActivityError.Update);
    }

    log.info({ userId, activityId: id }, 'New activity updated');
    return okResponse;
}

export async function updateActivities(
    this: ActivitiesThis,
    { payload, userId }: UpdateActivitiesParams,
): Promise<OkResponse> {
    const log = moduleLog.child({ function: 'updateActivities' });
    const { getCacheClient } = this;
    const cache = await getCacheClient();
    const { activityKeys, keys, records } = mapActivitiesToRecords(payload, userId);
    let activitiesExist = false;

    try {
        const existingKeysNumber = await cache.exists(...keys);
        activitiesExist = existingKeysNumber === keys.length;
    } catch (e: any) {
        log.error({ error: e, userId, activityKeys, redisKeys: keys }, 'Can not check activities in cache');
        throw Boom.internal(ActivityError.Update);
    }

    if (!activitiesExist) {
        log.error({ userId, activityKeys, redisKeys: keys }, 'Relevant activity not found in cache');
        throw Boom.badRequest(ActivityError.Update);
    }

    try {
        await cache.mSet(records);
        log.debug(
            { records, activities: payload, userId, redisKeys: keys, activityKeys },
            'Updated activities saved to cache',
        );
    } catch (e: any) {
        log.error(
            { error: e, records, activity: payload, userId, redisKeys: keys, activityKeys },
            'Error updating activities in cache',
        );
        throw Boom.internal(ActivityError.Update);
    }

    log.info({ userId, activityKeys }, 'Activities updated');
    return okResponse;
}

export async function getActivities(
    this: ActivitiesThis,
    { payload, userId }: GetActivitiesParams,
): Promise<GetActivitiesResponse> {
    const log = moduleLog.child({ function: 'getActivities' });
    const { roles } = payload;
    let activities: Activity[] = [];

    try {
        activities = await getActivitiesForPerson.call(this, userId, roles);
        log.debug({ activities, roles, userId }, 'Fetched activities');
    } catch (e: any) {
        log.error({ error: e, userId, roles }, 'Failed to fetch activities');
        throw Boom.internal(ActivityError.Get);
    }

    log.info({ userId, roles }, 'Activities fetched');
    return {
        ...okResponse,
        activities,
    };
}
