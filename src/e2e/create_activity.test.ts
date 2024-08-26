import neo4j from 'neo4j-driver';
import { testDBData } from '../test_data/test_db_setup';
import { Label, Status } from '../constants/common';
import { ActivityType } from '../constants/activities';
import { Role } from '../constants/roles';

const testUrlPrefix = 'http://0.0.0.0:3000';
const neo4jHost = 'neo4j://localhost:7687';
const neo4jUsername = 'neo4j';
const neo4jPassword = 'neo4j';

let driver: any;
let session: any;

let testActivityId: string = '';

declare global {
    var fetch: any;
}

const headers = {
    Authorization:
        'Bearer some_jwt_token',
};

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
    driver = neo4j.driver(neo4jHost, neo4j.auth.basic(neo4jUsername, neo4jPassword));
    session = driver.session({ defaultAccessMode: 'WRITE' });
    await clearDB();
    await setupTestDB();
});

afterAll(async () => {
    await session.close();
    await driver.close();
});

describe('e2e_create_activity: Test activity creation', () => {
    test('Obtain groups for person', async () => {
        const response = await fetch(`${testUrlPrefix}/groups/search`, {
            headers,
        });
        const { status, groups } = await response.json();
        const group = groups.find((group: any) => group.id === '8062ef7dc348c000a800000002a00000');
        const friends = group.members['MEMBER_OF'];
        const twoFriends = friends.filter((friend: any) =>
            ['8062ef7bc2ce4000a800000002a00000', '8062ef7922b88000a800000002a00000'].includes(friend.id),
        );
        expect(status).toBe(Status.Ok);
        expect(groups.length).toBe(2);
        expect(twoFriends.length).toBe(2);
    });
    test('Create activity', async () => {
        const testActivity = {
            name: 'Test activity',
            type: ActivityType.Journey,
        };
        const response = await fetch(`${testUrlPrefix}/activities/create`, {
            headers: { ...headers, 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify(testActivity),
        });
        const result = await response.json();
        testActivityId = result.activityId;
        expect(result.activityId).toBeDefined();
        expect(result.status).toBe(Status.Ok);
    });
    test('Enrich activity with data and candidates', async () => {
        const enrichedTestActivity = {
            id: testActivityId,
            name: 'Enriched test activity',
            type: ActivityType.Journey,
            description: 'Journey-journey',
            personIds: ['8062ef7bc2ce4000a800000002a00000', '8062ef7922b88000a800000002a00000'],
        };
        const response = await fetch(`${testUrlPrefix}/activities/enrich`, {
            headers: { ...headers, 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify(enrichedTestActivity),
        });
        const result = await response.json();
        expect(result.activity).toEqual(enrichedTestActivity);
    });
    test('Can not enrich activity with incorrect id', async () => {
        const enrichedTestActivity = {
            id: '123456',
            name: 'Enriched test activity',
            type: ActivityType.Journey,
            description: 'Journey-journey',
        };
        const response = await fetch(`${testUrlPrefix}/activities/enrich`, {
            headers: { ...headers, 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify(enrichedTestActivity),
        });
        const result = await response.json();
        expect(result.status).toEqual(Status.Error);
    });
    test('Start activity', async () => {
        const startActivity = {
            id: testActivityId,
        };
        const response = await fetch(`${testUrlPrefix}/activities/start`, {
            headers: { ...headers, 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify(startActivity),
        });
        const result = await response.json();
        expect(result.status).toEqual(Status.Ok);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const query = `
            MATCH(person:${Label.Person}) -[:${Role.Member}]-> (:${Label.Activity} {id: '${testActivityId}'})
            RETURN collect(person.id) AS persons
        `;
        const expectedMembers = ['8062ef7bc2ce4000a800000002a00000', '8062ef7922b88000a800000002a00000'].sort();
        const res = await session.run(query);
        expect(expectedMembers).toEqual(res.records[0].get(0).sort());
    });
});
