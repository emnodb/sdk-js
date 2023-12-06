import { EmnoHttpClient } from '../utils/httpClient';
import { processResponseToVectorList } from '../utils/helpers';
import { Vector } from './Vector';

import {
  CollectionConfigSchema,
  CollectionType,
  CollectionUpdateType,
  VectorUpdateType,
  VectorCreateType,
  CollectionQueryType,
  EmnoClientConfig,
  VectorCreateTextType,
  CollectionTextQueryType,
} from '../../types/types';
import { z } from 'zod';

export class Collection {
  public id?: string;
  public name?: string;
  public description?: string;
  public config?: z.infer<typeof CollectionConfigSchema>;
  private _client: EmnoHttpClient;
  private emnoConfig: EmnoClientConfig;

  private populate(data: CollectionType) {
    const { id, name, description, config } = data;
    this.id = id ? id : undefined;
    this.name = name;
    this.description = description ? description : undefined;
    this.config = config;
  }

  constructor(
    data: CollectionType,
    client: EmnoHttpClient,
    config: EmnoClientConfig
  ) {
    this.emnoConfig = config;
    this.populate(data);
    this._client = client;
  }

  toString(): string {
    const { id, name, description, config } = this;
    return JSON.stringify({ id, name, description, config }, null, 2);
  }

  async update(data: CollectionUpdateType): Promise<this | undefined> {
    const collectionId = this.id;
    if (!collectionId) {
      throw Error('Uninitialized Collection object');
    }
    const httpResponse = await this._client.updateCollection(
      collectionId as string,
      data
    );
    if (!httpResponse || httpResponse?.error || !httpResponse.responseData) {
      if (this.emnoConfig.shouldThrow) {
        throw new Error(
          `${httpResponse.status}: ${httpResponse?.error?.message}`
        );
      } else {
        if (this.emnoConfig.logErrors) console.error(httpResponse.error);
        return;
      }
    }
    this.populate(httpResponse.responseData as CollectionType);
    return this;
  }

  async count(): Promise<number | undefined> {
    const collectionId = this.id;
    if (!collectionId) {
      throw Error('Uninitialized Collection object');
    }

    const httpResponse = await this._client.count(collectionId);
    if (!httpResponse || httpResponse?.error || !httpResponse.responseData) {
      if (this.emnoConfig.shouldThrow) {
        throw new Error(
          `${httpResponse.status}: ${httpResponse?.error?.message}`
        );
      } else {
        if (this.emnoConfig.logErrors) console.error(httpResponse.error);
        return;
      }
    }
    const count = httpResponse.responseData.count;
    return count;
  }

  //get list of vectors
  async getVectors(
    ids: string[],
    getValue: boolean = false
  ): Promise<Vector[] | undefined> {
    const collectionId = this.id;
    if (!collectionId) {
      throw Error('Uninitialized Collection object');
    }
    const httpResponse = await this._client.getVectors(collectionId, {
      ids,
      includeVectorValues: getValue,
    });
    if (!httpResponse || httpResponse?.error || !httpResponse.responseData) {
      if (this.emnoConfig.shouldThrow) {
        throw new Error(
          `${httpResponse.status}: ${httpResponse?.error?.message}`
        );
      } else {
        if (this.emnoConfig.logErrors) console.error(httpResponse.error);
        return;
      }
    }
    const response = processResponseToVectorList(
      httpResponse.responseData,
      collectionId,
      this._client
    );
    return response as Vector[];
  }

  //get list of vectors
  async listVectors(getValue: boolean = false): Promise<Vector[] | undefined> {
    const collectionId = this.id;
    if (!collectionId) {
      throw Error('Uninitialized Collection object');
    }
    const httpResponse = await this._client.listVectors(
      collectionId as string,
      getValue
    );
    if (!httpResponse || httpResponse?.error || !httpResponse.responseData) {
      if (this.emnoConfig.shouldThrow) {
        throw new Error(
          `${httpResponse.status}: ${httpResponse?.error?.message}`
        );
      } else {
        if (this.emnoConfig.logErrors) console.error(httpResponse.error);
        return;
      }
    }
    const response = processResponseToVectorList(
      httpResponse.responseData,
      collectionId as string,
      this._client
    );
    return response as Vector[];
  }

  async addVectors(data: VectorCreateType[]): Promise<Vector[] | undefined> {
    const httpResponse = await this._client.addVectors(this.id as string, data);
    if (!httpResponse || httpResponse?.error || !httpResponse.responseData) {
      if (this.emnoConfig.shouldThrow) {
        throw new Error(
          `${httpResponse.status}: ${httpResponse?.error?.message}`
        );
      } else {
        if (this.emnoConfig.logErrors) console.error(httpResponse.error);
        return;
      }
    }
    const response = processResponseToVectorList(
      httpResponse.responseData,
      this.id as string,
      this._client
    );
    return response;
  }

  async addText(data: VectorCreateTextType[]): Promise<Vector[] | undefined> {
    const httpResponse = await this._client.addText(this.id as string, data);
    if (!httpResponse || httpResponse?.error || !httpResponse.responseData) {
      if (this.emnoConfig.shouldThrow) {
        throw new Error(
          `${httpResponse.status}: ${httpResponse?.error?.message}`
        );
      } else {
        if (this.emnoConfig.logErrors) console.error(httpResponse.error);
        return;
      }
    }
    const response = processResponseToVectorList(
      httpResponse.responseData,
      this.id as string,
      this._client
    );
    return response;
  }

  //update vectors
  async updateVectors(data: VectorUpdateType[]): Promise<Vector[] | undefined> {
    const httpResponse = await this._client.updateVectors(
      this.id as string,
      data
    );
    if (!httpResponse || httpResponse?.error || !httpResponse.responseData) {
      if (this.emnoConfig.shouldThrow) {
        throw new Error(
          `${httpResponse.status}: ${httpResponse?.error?.message}`
        );
      } else {
        if (this.emnoConfig.logErrors) console.error(httpResponse.error);
        return;
      }
    }
    const { updated = [], created = [], errored } = httpResponse.responseData;

    if (errored && errored.length > 0) {
      console.log('Some vectors could not be updated');
    }

    const listToReturn = [...updated, ...created];

    const response = processResponseToVectorList(
      listToReturn,
      this.id as string,
      this._client
    );
    return response;
  }

  //delete vectors by id
  async deleteVectors(ids: string[]): Promise<Vector[] | undefined> {
    const httpResponse = await this._client.deleteVectors(this.id as string, {
      ids,
    });
    if (!httpResponse || httpResponse?.error || !httpResponse.responseData) {
      if (this.emnoConfig.shouldThrow) {
        throw new Error(
          `${httpResponse.status}: ${httpResponse?.error?.message}`
        );
      } else {
        if (this.emnoConfig.logErrors) console.error(httpResponse.error);
        return;
      }
    }
    const response = processResponseToVectorList(
      httpResponse.responseData?.deleted,
      this.id as string,
      this._client
    );
    return response;
  }

  async deleteAllVectors(): Promise<Vector[] | undefined> {
    const httpResponse = await this._client.deleteVectors(this.id as string, {
      ids: [],
      deleteAll: true,
    });
    if (!httpResponse || httpResponse?.error || !httpResponse.responseData) {
      if (this.emnoConfig.shouldThrow) {
        throw new Error(
          `${httpResponse.status}: ${httpResponse?.error?.message}`
        );
      } else {
        if (this.emnoConfig.logErrors) console.error(httpResponse.error);
        return;
      }
    }
    const response = processResponseToVectorList(
      httpResponse.responseData?.deleted,
      this.id as string,
      this._client
    );
    return response;
  }

  //query collection
  async queryByVector(
    data: CollectionQueryType
  ): Promise<Vector[][] | undefined> {
    const collectionId = this.id;
    if (!collectionId) {
      throw Error('Uninitialized Collection object');
    }
    const httpResponse = await this._client.queryByVector(
      this.id as string,
      data
    );
    if (!httpResponse || httpResponse?.error || !httpResponse.responseData) {
      if (this.emnoConfig.shouldThrow) {
        throw new Error(
          `${httpResponse.status}: ${httpResponse?.error?.message}`
        );
      } else {
        if (this.emnoConfig.logErrors) console.error(httpResponse.error);
        return;
      }
    }
    const listOfVectorList = httpResponse.responseData || [];
    const response = [];
    for (let i = 0; i < listOfVectorList.length; i++) {
      const list = listOfVectorList[i];
      response.push(
        processResponseToVectorList(list, this.id as string, this._client)
      );
    }
    return response;
  }

  async queryByText(
    data: CollectionTextQueryType
  ): Promise<Vector[][] | undefined> {
    const collectionId = this.id;
    if (!collectionId) {
      throw Error('Uninitialized Collection object');
    }
    const httpResponse = await this._client.queryByText(
      this.id as string,
      data
    );
    if (!httpResponse || httpResponse?.error || !httpResponse.responseData) {
      if (this.emnoConfig.shouldThrow) {
        throw new Error(
          `${httpResponse.status}: ${httpResponse?.error?.message}`
        );
      } else {
        if (this.emnoConfig.logErrors) console.error(httpResponse.error);
        return;
      }
    }
    const listOfVectorList = httpResponse.responseData || [];
    const response = [];
    for (let i = 0; i < listOfVectorList.length; i++) {
      const list = listOfVectorList[i];
      response.push(
        processResponseToVectorList(list, this.id as string, this._client)
      );
    }
    return response;
  }
}
