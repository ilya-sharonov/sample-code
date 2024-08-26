import { Role } from '../constants/roles';
import { ContactType, Gender } from '../constants/users';
import { ErrorResponse, OkResponse } from './commons';

export interface RawContact {
    reference: string;
    type: ContactType;
}

export interface Contact extends RawContact {
    id: string;
    verified: boolean;
}

export enum Platform {
    Android = 'android',
    iOS = 'ios',
    Web = 'web',
}

export interface Device {
    platform: Platform;
    token: string;
}

export interface Metadata {
    devices: Device[];
}

export interface Person {
    id: string;
    name: string;
    secondName?: string;
    surname: string;
    gender: Gender;
    birthDate: string;
    alias?: string;
    contacts: Contact[];
    avatar: string;
    metadata: Metadata;
}

export interface Fellow extends Person {
    role: Role;
}

export type UpdatePersonRequest = Partial<Omit<Person, 'id'>>;

export interface UpdatePersonParams {
    userId: string;
    payload: UpdatePersonRequest;
}

export type UpdatePersonResponse = OkResponse | ErrorResponse;

export interface UpdateDeviceTokenRequest {
    deviceId: string;
    deviceType: string;
    deviceToken: string;
}

export interface UpdateDeviceTokenParams {
    userId: string;
    payload: UpdateDeviceTokenRequest;
}

export type UpdateDeviceTokenResponse = OkResponse | ErrorResponse;

export interface RegisterDeviceRequest {
    deviceType: string;
    deviceToken: string;
}

export interface RegisterDeviceParams {
    userId: string;
    payload: RegisterDeviceRequest;
}

export type OkRegisterDeviceResponse = OkResponse & { deviceId: string };

export type RegisterDeviceResponse = OkRegisterDeviceResponse | ErrorResponse;
