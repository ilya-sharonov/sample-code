import { separator, activityKeyPrefix, userKeyPrefix, participantsKeyPostfix } from '../constants/events';

export function activityKey(_: TemplateStringsArray, userId: string, activityId: string) {
    return `${userKeyPrefix}${separator}${userId}${separator}${activityKeyPrefix}${separator}${activityId}`;
}

export function participantsKey(_: TemplateStringsArray, userId: string, activityId: string) {
    return `${userKeyPrefix}${separator}${userId}${separator}${activityKeyPrefix}${separator}${activityId}${separator}${participantsKeyPostfix}`;
}
