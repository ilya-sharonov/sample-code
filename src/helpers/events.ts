import { commonEventPrefix, groupEventPrefix, instanceEventPrefix, separator } from '../constants/events';

function genericEvent(prefix: string, target: string, type: string) {
    return `${prefix}${separator}${target}${separator}${type}`;
}

export function instanceEvent(_: TemplateStringsArray, instanceId: string, eventType: string): string {
    return genericEvent(instanceEventPrefix, instanceId, eventType);
}

export function groupEvent(_: TemplateStringsArray, groupName: string, eventType: string): string {
    return genericEvent(groupEventPrefix, groupName, eventType);
}

export function commonEvent(_: TemplateStringsArray, commonName: string, eventType: string): string {
    return genericEvent(commonEventPrefix, commonName, eventType);
}
