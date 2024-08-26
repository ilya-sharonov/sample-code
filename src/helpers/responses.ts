import { ReasonPhrase, StatusCode } from '../constants/common';
import { OkResponse } from '../types';

export const okResponse: OkResponse = {
    statusCode: StatusCode.Ok,
    reasonPhrase: ReasonPhrase.Ok,
};
