import Boom from '@hapi/boom';

export interface GraphDBThis {
    getGraphClient: any;
}

export interface GraphDBQueryParams {
    query: string;
    params: any;
    errorMessage?: string;
    postprocess?: (result: any) => any;
    graphMode?: string;
}

export async function executeGraphDBQuery(this: GraphDBThis, parameters: GraphDBQueryParams) {
    const { getGraphClient } = this;
    const {
        query,
        params,
        errorMessage = 'Error quering GraphDB',
        postprocess = (result) => result,
        graphMode = 'READ',
    } = parameters;
    const session = getGraphClient(graphMode);
    let result;

    try {
        result = await session.run(query, params);
    } catch (e: any) {
        throw Boom.internal(errorMessage);
    } finally {
        await session.close();
    }

    return postprocess(result);
}
