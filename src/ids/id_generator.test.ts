import { initIdGenerator } from './id_generator';

describe('ID generator, default epoch setup', () => {
    const idGeneratorFn = initIdGenerator({ dataCenterId: 1, instanceId: 1 });
    let idGenerator: Generator;
    beforeEach(() => {
        idGenerator = idGeneratorFn();
    });
    test('returns 32 byte long ids', () => {
        const nextId = idGenerator.next().value;
        expect(nextId).toHaveLength(32);
    });
    test('creates sequential ids', () => {
        const ids: string[] = [];
        for (let i = 0; i < 10; i++) {
            ids.push(idGenerator.next().value);
        }
        const lastNumbers = ids.reduce((acc, next) => {
            acc += next.at(-1);
            return acc;
        }, '');
        expect(lastNumbers).toEqual('0123456789');
    });
    test('non-sequential part of the id remains the same', () => {
        const ids: string[] = [];
        for (let i = 0; i < 10; i++) {
            ids.push(idGenerator.next().value);
        }
        const truncatedIds = ids.map((id) => id.substring(0, id.length - 1));
        const areAllEqual = truncatedIds.every((id) => id === truncatedIds[0]);
        expect(areAllEqual).toBeTruthy();
    });
    test('ids are generated in k-sortable manner, i.e. sort naturally', () => {
        const ids: string[] = [];
        for (let i = 0; i < 1_000_000; i++) {
            ids[i] = idGenerator.next().value;
        }
        const cloneIds = [...ids];
        ids.sort();
        const sameOrder = cloneIds.every((id, index) => id === ids[index]);
        expect(sameOrder).toBeTruthy();
    });
});
