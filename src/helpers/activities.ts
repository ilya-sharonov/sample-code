import { Role } from '../constants/roles';
import { Activity } from '../types';
import { activityKey } from './keys';

export function mapActivitiesToRecords(
    activities: Activity[],
    userId: string,
): {
    activityKeys: string[];
    keys: string[];
    records: Array<[string, Activity]>;
} {
    const activityKeys: string[] = [];
    const keys: string[] = [];
    const records: Array<[string, Activity]> = [];
    for (const activity of activities) {
        const { id } = activity;
        const key = activityKey`${userId}${id}`;
        activityKeys.push(id);
        keys.push(key);
        records.push([key, activity]);
    }
    return {
        activityKeys,
        keys,
        records,
    };
}

export function decodeRoles(roles: number): Role[] {
    const rolesMap = new Map<number, Role>([
        [0b100000, Role.Owner],
        [0b10000, Role.Admin],
        [0b1000, Role.Member],
        [0b100, Role.Candidate],
        [0b10, Role.Viewer],
        [0b1, Role.Ephemeral],
    ]);
    const requestRoles = [...rolesMap.entries()].reduce<Role[]>((acc, [mask, role]) => {
        if (roles & mask) {
            acc.push(role);
        }
        return acc;
    }, []);
    return requestRoles;
}
