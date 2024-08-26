import { Payload } from '@hapi/boom';
import { ReasonPhrase, StatusCode } from '../constants/common';

export interface Location {
    longitude: number;
    latitude: number;
}

export interface OkResponse {
    statusCode: StatusCode.Ok;
    reasonPhrase: ReasonPhrase.Ok;
}

export type ErrorResponse = Payload;
