import { Role } from '../constants/roles';
import { OkResponse, ErrorResponse } from './commons';
import { Fellow, Person } from './persons';

export interface GroupMember extends Person {
    added: string;
    lastParticipatedOn: string;
}

export interface Group {
    id: string;
    name: string;
    tags: string[];
    members: {
        [key in Role]: Fellow[]; // key: string = Role
    };
}

export interface GroupsSearchRequest {}

export interface GroupsSearchParams {
    personId: string;
    payload: GroupsSearchRequest;
}

export interface OkGroupsSearchResponse extends OkResponse {
    Groups: Group[];
}

export type GroupsSearchResponse = OkGroupsSearchResponse | ErrorResponse;
