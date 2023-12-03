import { EmnoHttpClient } from './utils/httpClient';
import {
  processResponseToCollection,
  processResponseToCollectionList,
} from './utils/helpers';
import type {
  CreateCollectionRequestSchema,
  EmnoClientConfig,
} from '../types/types';
import { z } from 'zod';
import { Collection } from './models/Collection';

export class Emno {
  private _client: EmnoHttpClient;
  private config: EmnoClientConfig;

  shouldThrow = false;
  logErrors = true;

  constructor(config: EmnoClientConfig) {
    if (!config.shouldThrow) {
      this.shouldThrow = false;
    } else {
      this.shouldThrow = true;
    }
    this._client = new EmnoHttpClient({
      baseUrl: config.baseUrl,
      token: config.token,
    });
    this.config = config;
  }

  //get list of collections
  async listCollections(): Promise<Collection[] | undefined> {
    const httpResponse = await this._client.listCollections();

    if (!httpResponse || httpResponse?.error || !httpResponse.responseData) {
      if (this.shouldThrow) {
        throw new Error(
          `${httpResponse.status}: ${httpResponse?.error?.message}`
        );
      } else {
        if (this.logErrors) console.error(httpResponse.error);
        return;
      }
    }

    const response = processResponseToCollectionList(
      httpResponse.responseData,
      this._client,
      this.config
    );
    return response;
  }

  // create a new collection
  async createCollection(
    data: z.infer<typeof CreateCollectionRequestSchema>
  ): Promise<Collection | undefined> {
    const httpResponse = await this._client.createCollection(data);

    if (!httpResponse || httpResponse?.error || !httpResponse.responseData) {
      if (this.shouldThrow) {
        throw new Error(
          `${httpResponse.status}: ${httpResponse?.error?.message}`
        );
      } else {
        if (this.logErrors) console.error(httpResponse.error);
        return;
      }
    }

    const response = processResponseToCollection(
      httpResponse.responseData,
      this._client,
      this.config
    );
    return response;
  }

  // get a collection by id
  async getCollection(
    collectionIdentifier: string
  ): Promise<Collection | undefined> {
    const httpResponse = await this._client.getCollection(collectionIdentifier);

    if (!httpResponse || httpResponse?.error || !httpResponse.responseData) {
      if (this.shouldThrow) {
        throw new Error(
          `${httpResponse.status}: ${httpResponse?.error?.message}`
        );
      } else {
        if (this.logErrors) console.error(httpResponse.error);
        return;
      }
    }

    const response = processResponseToCollection(
      httpResponse.responseData,
      this._client,
      this.config
    );
    return response;
  }

  async deleteCollection(
    collectionIdentifier: string
  ): Promise<Collection | undefined> {
    const collection = await this.getCollection(collectionIdentifier);
    if (!collection) {
      throw Error('Uninitialized Collection object');
    }
    const httpResponse = await this._client.deleteCollection(
      collectionIdentifier as string
    );

    if (!httpResponse || httpResponse?.error || !httpResponse.responseData) {
      if (this.shouldThrow) {
        throw new Error(
          `${httpResponse.status}: ${httpResponse?.error?.message}`
        );
      } else {
        if (this.logErrors) console.error(httpResponse.error);
        return;
      }
    }

    const response = processResponseToCollection(
      httpResponse.responseData.deleted,
      this._client,
      this.config
    );
    return response;
  }
}
