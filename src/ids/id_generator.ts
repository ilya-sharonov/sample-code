const LEFTMOST_BIT = 1;

const LEFTMOST_SHIFT = 127n;
const MILLIS_SHIFT = 78n;
const DATACENTER_SHIFT = 58n;
const INSTANCE_SHIFT = 20n;
export interface IdGeneratorParams {
    dataCenterId: number;
    instanceId: number;
}

export function initIdGenerator({ dataCenterId, instanceId }: IdGeneratorParams) {
    return function* getNextId() {
        let sequenceNumber = 0n;
        let previousMillis = 0;
        while (true) {
            const millisFromEpoch = Date.now();
            if (millisFromEpoch !== previousMillis) {
                sequenceNumber = 0n;
            }
            previousMillis = millisFromEpoch;
            const nextId =
                (BigInt(LEFTMOST_BIT) << LEFTMOST_SHIFT) +
                (BigInt(millisFromEpoch) << MILLIS_SHIFT) +
                (BigInt(dataCenterId) << DATACENTER_SHIFT) +
                (BigInt(instanceId) << INSTANCE_SHIFT) +
                sequenceNumber;
            yield nextId.toString(16);
            sequenceNumber++;
        }
    };
}
