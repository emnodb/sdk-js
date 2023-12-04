import { Collection } from '../models/Collection';
import { Vector } from '../models/Vector';
import { EmnoHttpClient } from './httpClient';
import {
  CollectionType,
  EmnoClientConfig,
  VectorType,
} from '../../types/types';

export function processResponseToCollection(
  responseData: CollectionType,
  client: EmnoHttpClient,
  config: EmnoClientConfig
): Collection {
  return new Collection(responseData, client, config);
}

export function processResponseToCollectionList(
  responseData: CollectionType[],
  client: EmnoHttpClient,
  config: EmnoClientConfig
): Collection[] {
  return responseData.map(
    (data: CollectionType) => new Collection(data, client, config)
  );
}

export function processResponseToVector(
  responseData: any,
  collectionId: string,
  client: EmnoHttpClient
): Vector {
  return new Vector(responseData[0], collectionId, client);
}

export function processResponseToVectorList(
  responseData: VectorType[],
  collectionId: string,
  client: EmnoHttpClient
): Vector[] {
  return responseData.map(
    (data: VectorType) => new Vector(data, collectionId, client)
  );
}

export const sliceIntoChunks = <T>(arr: T[], chunkSize: number) => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, (i + 1) * chunkSize)
  );
};

// export function processResponseToToken(responseData: any, client: EmnoHttpClient): z.infer<typeof CreateTokenResponseSchema> {
//     return new z.infer<typeof CreateTokenResponseSchema>(responseData, client);
// }

// export function processResponseToTokenList(responseData: any, client: EmnoHttpClient): z.infer<typeof CreateTokenResponseSchema>[] {
//     return responseData.map((data: any) => new Token(data, client));
// }
