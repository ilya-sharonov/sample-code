import { Label } from '../constants/common';
import { Role } from '../constants/roles';
import { reviveMemberProperties } from '../helpers';
import { Person } from '../types';
import { getActivitiesForPersonPostprocess } from './activities_graphdb_utils';
import { GraphDBThis, executeGraphDBQuery } from './common';

export async function getMembersForGroups(this: GraphDBThis, ownerId: string, groupIds: string[]) {
    const query = `
        UNWIND $groupIds AS groupId
        MATCH(group:${Label.Group} {id: groupId}) <-[:${Role.Owner}]- (owner:${Label.Person} {id: $ownerId})
        WITH REDUCE(output = [], r IN collect([(person:${Label.Person}) -[:${Role.Member}]-> (group) | person.id]) | output + r) AS groupMembers
        UNWIND groupMembers AS member
        WITH DISTINCT member
        RETURN collect(member) AS participants
    `;
    const params = {
        ownerId,
        groupIds,
    };
    const errorMessage = 'activities_graphdb.getMembersForGroups: unable to get members for groups';
    const postprocess = (result: any) => result.records[0].get(0);
    return executeGraphDBQuery.call(this, { query, params, errorMessage, postprocess });
}

export async function filterMembersOfOwnerGroups(this: GraphDBThis, ownerId: string, personIds: string[]) {
    const query = `
        UNWIND $personIds AS personId
        MATCH (owner:${Label.Person} {id: $ownerId}) -[:${Role.Owner}]-> (group:${Label.Group}) <-[:${Role.Member}]- (person:${Label.Person} {id: personId})
        RETURN collect(person.id)
    `;
    const params = {
        ownerId,
        personIds,
    };
    const errorMessage =
        'activities_graphdb.filterMembersOfOwnerGroups: unable to filter members of an owners group';
    const postprocess = (result: any) => result.records[0].get(0);
    return executeGraphDBQuery.call(this, { query, params, errorMessage, postprocess });
}

export async function addCandidatesForActivity(
    this: GraphDBThis,
    ownerId: string,
    activityId: string,
    personIds: string[],
) {
    const query = `
        UNWIND $personIds AS personId
        MATCH (person:${Label.Person} {id: personId})
        WITH person
        MATCH (activity:${Label.Activity} {id: $activityId}) <-[:${Role.Owner}]- (owner:${Label.Person} {id: $ownerId})
        WITH activity, person
        CREATE (person) -[:${Role.Candidate}]-> (activity)
    `;
    const params = {
        ownerId,
        personIds,
        activityId,
    };
    const errorMessage =
        'activities_graphdb.addCandidatesForActivity: unable to add candidates for activity';
    return executeGraphDBQuery.call(this, { query, params, errorMessage, graphMode: 'WRITE' });
}

export async function changeCandidateToMember(this: GraphDBThis, candidateId: string, activityId: string) {
    const query = `
        MATCH(person: ${Label.Person} {id: $candidateId}) -[candidate:${Role.Candidate}]-> (activity:${Label.Activity} {id: $activityId}) <-[:OWNER_OF]- (owner: Person)
        WITH person,candidate,activity,owner
        CREATE (person) -[:${Role.Member}]-> (activity)
        DELETE candidate
        RETURN person,activity,owner
    `;
    const params = {
        candidateId,
        activityId,
    };
    const errorMessage =
        'activities_graphdb.changeCandidateToMember: unable to change candidate to member';
    const postprocess = (result: any) => ({
        person: result.records[0].get(0).properties,
        activity: result.records[0].get(1).properties,
        owner: result.records[0].get(2).properties,
    });
    return executeGraphDBQuery.call(this, { query, params, errorMessage, graphMode: 'WRITE', postprocess });
}

export async function getActivitiesForPerson(this: GraphDBThis, personId: string, roles: Role[] = [Role.Owner]) {
    const personRoles = roles.join('|');
    const query = `
        MATCH(person: ${Label.Person} {id: $personId}) -[roles:${personRoles}]-> (activity: ${Label.Activity})
        RETURN activity
    `;
    const params = {
        personId,
    };
    const errorMessage = `activities_graphdb.getActivitiesForPerson: unable to get activities with roles ${personRoles} for ${personId}`;
    return executeGraphDBQuery.call(this, {
        query,
        params,
        errorMessage,
        postprocess: getActivitiesForPersonPostprocess,
    });
}

export async function getPersonsForActivities(this: GraphDBThis, ownerId: string, activityIds: string[]) {
    const query = `
        UNWIND $activityIds AS activityId
        MATCH(activity:${Label.Activity} {id: activityId}) <-[:${Role.Owner}]- (owner:${Label.Person} {id: $ownerId})
        MATCH(person:${Label.Person}) -[role:${Role.Member}|${Role.Candidate}]-> (activity)
        RETURN person, TYPE(role) as role, activity.id as activityId
    `;
    const params = {
        ownerId,
        activityIds,
    };
    const errorMessage = 'activities_graphdb.getPersonsForActivities: unable to get persons for activities';
    const postprocess = (result: any) => {
        const activityPersons = new Map<string, Array<Person & { role: Role }>>();
        for (const record of result.records) {
            const activityId = record.get('activityId');
            const role = record.get('role');
            const person = record.get('person');
            if (!activityPersons.has(activityId)) {
                activityPersons.set(activityId, []);
            }
            const arr = activityPersons.get(activityId);
            const revivedPerson = reviveMemberProperties(person.properties, new Set(['metadata', 'contacts']));
            arr?.push({ ...revivedPerson, role });
        }
        return [...activityPersons.entries()];
    };
    return executeGraphDBQuery.call(this, { query, params, errorMessage, postprocess });
}
