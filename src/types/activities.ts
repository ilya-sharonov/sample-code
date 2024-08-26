import { ActivityType } from '../constants/activities';
import { Decision } from '../constants/common';
import { Role } from '../constants/roles';

import { Location, OkResponse } from './commons';
import { Person } from './persons';

export interface Activity {
    id: string;
    name: string;
    type: ActivityType;
    description?: string;
    timestamp?: number;
    timezoneOffset?: string;
    location?: string;
    coordinates?: Location;
}

export interface CreateActivityParams {
    userId: string;
    payload: Activity;
}

export interface CreateActivityResponse extends OkResponse {
    id: string;
}

/**
 * Update Activity
 */

export interface UpdateActivityParams {
    userId: string;
    payload: Activity;
}

export interface UpdateActivitiesParams {
    userId: string;
    payload: Activity[];
}

/**
 * Get Activities
 */

export interface GetActivitiesRequest {
    roles: Role[];
}

export interface GetActivitiesParams {
    userId: string;
    payload: GetActivitiesRequest;
}

export interface GetActivitiesResponse extends OkResponse {
    activities: Activity[];
}

/**
 * Get PersonsForActivities
 */

export interface GetPersonsForActivitiesRequest {
    activityIds: string[];
}

export interface GetPersonsForActivitiesParams {
    userId: string;
    payload: GetPersonsForActivitiesRequest;
}

export type PersonsForActivities = Array<[string, Array<Person & { role: string }>]>;

export interface OkGetPersonsForActivitiesResponse extends OkResponse {
    personsForActivities: PersonsForActivities;
}

export type GetPersonsForActivitiesResponse = OkGetPersonsForActivitiesResponse;

/**
 * Accept invitation
 */

export interface ActivityInvitationRequest {
    decision: Decision;
    id: string;
}

export interface ActivityInvitationParams {
    userId: string;
    payload: ActivityInvitationRequest;
}

/*
 *
 */

export interface ActivityAttendants {
    groupIds?: string[];
    personIds?: string[];
}
