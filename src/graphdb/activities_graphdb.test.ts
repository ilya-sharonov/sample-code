import neo4j from 'neo4j-driver';
import { testDBData } from '../test_data/test_db_setup';
import {
    addCandidatesForActivity,
    changeCandidateToMember,
    filterMembersOfOwnerGroups,
    getMembersForGroups,
    getPersonsForActivities,
} from './activities_graphdb';

const host = 'neo4j://localhost:7687';
const username = 'neo4j';
const password = 'd2kx37s4p21';

let driver: any;
let session: any;

function getGraphClient() {
    return driver.session({ defaultAccessMode: 'WRITE' });
}

async function clearDB() {
    const clearDBQuery = `
        MATCH (n)
        DETACH DELETE n
    `;
    await session.run(clearDBQuery);
}

async function setupTestDB() {
    await session.run(testDBData);
}

beforeAll(async () => {
    driver = neo4j.driver(host, neo4j.auth.basic(username, password));
    session = driver.session({ defaultAccessMode: 'WRITE' });
    await clearDB();
    await setupTestDB();
});

afterAll(async () => {
    // await clearDB();
    await session.close();
    await driver.close();
});

test('that DB is set up correctly', async () => {
    const query = `
        MATCH(person:Person {id: '8062ef7910e38000a800000002a00000'})
        return person
    `;
    const result = await session.run(query);
    expect(result.records[0].get(0).properties.id).toBe('8062ef7910e38000a800000002a00000');
});

test('getting members for groups for an owner', async () => {
    const result = await getMembersForGroups.call({ getGraphClient }, '8062ef7910e38000a800000002a00000', [
        '8062ef7dc348c000a800000002a00000',
        '8062ef7f70fc8000a800000002a00000',
    ]);
    const expectedResults = [
        '8062ef79155b8000a800000002a00000',
        '8062ef791c9dc000a800000002a00000',
        '8062ef7922b88000a800000002a00000',
        '8062ef7bc2ce4000a800000002a00000',
        '8062ef7f9fba0000a800000002a00000',
        '8062ef7fc2b98000a800000002a00000',
    ];
    expect(result.sort()).toEqual(expectedResults.sort());
});

test("check that only user's groups members are added", async () => {
    const result = await filterMembersOfOwnerGroups.call({ getGraphClient }, '8062ef7910e38000a800000002a00000', [
        '8062f2467fc2c000a800000002a00000',
        '8062ef7bc2ce4000a800000002a00000',
        '8062ef7922b88000a800000002a00000',
    ]);
    const expectedResults = ['8062ef7bc2ce4000a800000002a00000', '8062ef7922b88000a800000002a00000'];
    expect(result.sort()).toEqual(expectedResults.sort());
});

test('add candidates for activity', async () => {
    await addCandidatesForActivity.call(
        { getGraphClient },
        '8062ef7910e38000a800000002a00000',
        '8062f24a43388000a800000002a00000',
        ['8062ef7bc2ce4000a800000002a00000', '8062ef7922b88000a800000002a00000'],
    );
    const checkRequest = `
        MATCH(person1:Person {id: '8062ef7bc2ce4000a800000002a00000'}) -[:CANDIDATE_OF]-> (:Activity {id: '8062f24a43388000a800000002a00000'})
        MATCH(person2:Person {id: '8062ef7922b88000a800000002a00000'}) -[:CANDIDATE_OF]-> (:Activity {id: '8062f24a43388000a800000002a00000'})
        RETURN person1, person2
    `;
    const referenceIds = ['8062ef7bc2ce4000a800000002a00000', '8062ef7922b88000a800000002a00000'].sort();
    const result = await session.run(checkRequest);
    const obtainedIds = [result.records[0].get(0).properties.id, result.records[0].get(1).properties.id].sort();
    expect(referenceIds).toEqual(obtainedIds);
});

test('change candidate into member for activity', async () => {
    await changeCandidateToMember.call(
        { getGraphClient },
        '8062ef7bc2ce4000a800000002a00000',
        '8062f24a43388000a800000002a00000',
    );
    const checkRequest = `
        MATCH(person1:Person {id: '8062ef7bc2ce4000a800000002a00000'}) -[:MEMBER_OF]-> (:Activity {id: '8062f24a43388000a800000002a00000'})
        RETURN person1
    `;
    const referenceId = '8062ef7bc2ce4000a800000002a00000';
    const result = await session.run(checkRequest);
    const obtainedId = result.records[0].get(0).properties.id;
    expect(referenceId).toBe(obtainedId);
});

test('getting members and candidates for activities for an owner', async () => {
    const museumJourneyId = '8062f24a43388000a800000002a00000';
    const parkJourneyId = '80630b053c6c8000a800000002a00000';
    const result = await getPersonsForActivities.call({ getGraphClient }, '8062ef7910e38000a800000002a00000', [
        museumJourneyId,
        parkJourneyId,
    ]);
    const museumJourneyPersons = new Set(['8062ef7922b88000a800000002a00000', '8062ef7bc2ce4000a800000002a00000']);
    const parkJourneyPersons = new Set([
        '8062ef7922b88000a800000002a00000',
        '8062ef7fc2b98000a800000002a00000',
        '8062ef7f9fba0000a800000002a00000',
    ]);
    [...result].forEach(([activityId, persons]: any) => {
        switch (activityId) {
            case museumJourneyId: {
                const expectedPersons = persons.every((person: any) => museumJourneyPersons.has(person.id));
                expect(expectedPersons).toBe(true);
                break;
            }
            case parkJourneyId: {
                const expectedPersons = persons.every((person: any) => parkJourneyPersons.has(person.id));
                expect(expectedPersons).toBe(true);
                break;
            }
            default: {
                throw `Unexpected activity id: ${activityId}`;
            }
        }
    });
});
