import { Activity } from '../types';

export function getActivitiesForPersonPostprocess(result: any): Activity[] {
    return result.records.map((record: any) => {
        const {
            activity: { properties: data },
        } = record.toObject();
        return data;
    });
}
