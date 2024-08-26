/**
 * Update Activity State
 */

export interface UpdateActivityStateRequest {
    id: string;
}

export interface UpdateActivityStateParams {
    userId: string;
    payload: UpdateActivityStateRequest;
}
