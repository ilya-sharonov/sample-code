import Hapi from '@hapi/hapi';

import { createActivity, getActivities, updateActivities, updateActivity } from '../handlers';
import {
    CreateActivityParams,
    UpdateActivityParams,
    GetActivitiesParams,
    UpdateActivitiesParams,
    Activity,
} from '../types';
import {
    activitiesGetQueryValidation,
    activitiesPostPayloadValidation,
    activitiesPutPayloadValidation,
} from '../validation';
import { decodeRoles } from '../helpers';

export default [
    {
        method: 'POST',
        path: '/activities',
        handler: (
            request: Hapi.Request<Hapi.ReqRefDefaults> & { payload: Activity },
            h: Hapi.ResponseToolkit<Hapi.ReqRefDefaults> & {
                getId: () => Generator<string, never, unknown>;
                getCacheClient: any;
                getGraphClient: any;
            },
        ) => {
            const {
                payload,
                auth: {
                    credentials: { userId },
                },
            } = request;
            return createActivity.call(h, { payload, userId } as CreateActivityParams);
        },
        options: {
            validate: {
                payload: activitiesPostPayloadValidation,
            },
        },
    },
    {
        method: 'PUT',
        path: '/activities',
        handler: (
            request: Hapi.Request<Hapi.ReqRefDefaults> & { payload: Activity | Activity[] },
            h: Hapi.ResponseToolkit<Hapi.ReqRefDefaults> & {
                getId: () => Generator<string, never, unknown>;
                getCacheClient: any;
                getGraphClient: any;
            },
        ) => {
            const {
                payload,
                auth: {
                    credentials: { userId },
                },
            } = request;
            if (Array.isArray(payload)) {
                return updateActivities.call(h, { payload, userId } as UpdateActivitiesParams);
            }
            return updateActivity.call(h, { payload, userId } as UpdateActivityParams);
        },
        options: {
            validate: {
                payload: activitiesPutPayloadValidation,
            },
        },
    },
    {
        method: 'GET',
        path: '/activities',
        handler: (
            request: Hapi.Request<Hapi.ReqRefDefaults>,
            h: Hapi.ResponseToolkit<Hapi.ReqRefDefaults> & {
                getId: () => Generator<string, never, unknown>;
                getCacheClient: any;
                getGraphClient: any;
            },
        ) => {
            const { roles = 32 } = request.query;
            const requestRoles = decodeRoles(roles);
            const payload = { roles: requestRoles.length === 0 ? undefined : requestRoles };
            const {
                auth: {
                    credentials: { userId },
                },
            } = request;
            return getActivities.call(h, { payload, userId } as GetActivitiesParams);
        },
        options: {
            validate: {
                params: activitiesGetQueryValidation,
            },
        },
    },
];
