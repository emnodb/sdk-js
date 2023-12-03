/* eslint-disable no-console -- needed*/
import type { z } from 'zod';
import type {
  CountVectorsResponseSchema,
  CreateCollectionRequestSchema,
  CreateCollectionResponseSchema,
  DeleteVectorListRequestSchema,
  DeleteVectorListResponseSchema,
  DeletedCollectionResponseSchema,
  EmnoConfig,
  ErrorBody,
  ErrorBodyExt,
  GetAllCollectionResponseSchema,
  GetVectorListRequestSchema,
  QueryVectorByTextListSchema,
  QueryVectorListResponseSchema,
  QueryVectorListSchema,
  UpdateCollectionRequestSchema,
  VectorCreateListRequestSchema,
  VectorCreateTextListRequestSchema,
  VectorListResponseSchema,
  VectorListUpsertResponseSchema,
  VectorUpdateListRequestSchema,
} from '../../types/types';

const BASE_URL = 'https://apis.emno.io';

export class EmnoHttpClient {
  private baseUrl: string;

  constructor(config: EmnoConfig) {
    this.baseUrl = config.baseUrl || BASE_URL;
    // this.client = axios.create({ baseURL: baseUrl });
    if (config.token) {
      this.defaultFetchConfig = {
        headers: {
          'Content-Type': 'application/json',
          Token: `${config.token}`,
        },
      };
    }
  }

  private defaultFetchConfig: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  async makeAPICall<T>(
    urlPath: string,
    options: RequestInit
  ): Promise<{ responseData?: T; status: number; error?: ErrorBodyExt }> {
    const URL = `${this.baseUrl}${urlPath}`;
    const response = await fetch(URL, {
      ...this.defaultFetchConfig,
      ...options,
    });
    if (!response.ok) {
      let errBody: ErrorBody;
      let errText = 'Unknown Error';
      try {
        errBody = (await response.json()) as ErrorBody;
      } catch (e) {
        try {
          errText = await response.text();
        } catch (e2) {
          console.log('Unable to parse error text');
        }
        if (response.status === 401) {
          errText = 'Invalid user or token';
        }
        errBody = { message: `${response.status}: ${errText}` };
      }
      return {
        status: response.status,
        error: { ...errBody, error: true },
      };
    }

    return {
      status: response.status,
      responseData: (await response.json()) as T,
    };
  }

  async createCollection(
    collectionInfo: z.infer<typeof CreateCollectionRequestSchema>
  ) {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(collectionInfo),
    };
    return await this.makeAPICall<
      z.infer<typeof CreateCollectionResponseSchema>
    >('/collections', requestOptions);
  }

  async getCollection(collectionIdentifier: string) {
    const requestOptions: RequestInit = {
      method: 'GET',
    };
    return await this.makeAPICall<
      z.infer<typeof CreateCollectionResponseSchema>
    >(`/collections/${collectionIdentifier}`, requestOptions);
  }

  async updateCollection(
    collectionId: string,
    data: z.infer<typeof UpdateCollectionRequestSchema>
  ) {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(data),
    };
    return await this.makeAPICall<
      z.infer<typeof CreateCollectionResponseSchema>
    >(`/collections/${collectionId}`, requestOptions);
  }

  async deleteCollection(collectionIdentifier: string) {
    const requestOptions: RequestInit = {
      method: 'DELETE',
    };
    return await this.makeAPICall<
      z.infer<typeof DeletedCollectionResponseSchema>
    >(`/collections/${collectionIdentifier}`, requestOptions);
  }

  async listCollections() {
    const requestOptions: RequestInit = {
      method: 'GET',
    };
    return await this.makeAPICall<
      z.infer<typeof GetAllCollectionResponseSchema>
    >(`/collections`, requestOptions);
  }

  /// ---- Vector Operations ----

  async count(collectionId: string) {
    const requestOptions: RequestInit = {
      method: 'GET',
    };
    return await this.makeAPICall<z.infer<typeof CountVectorsResponseSchema>>(
      `/collections/${collectionId}/vectors/count`,
      requestOptions
    );
  }

  async getVectors(
    collectionId: string,
    data: z.infer<typeof GetVectorListRequestSchema>
  ) {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(data),
    };
    return await this.makeAPICall<z.infer<typeof VectorListResponseSchema>>(
      `/collections/${collectionId}/vectors/get`,
      requestOptions
    );
  }

  async listVectors(collectionId: string, includeVectorValues = false) {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify({ includeVectorValues }),
    };
    return await this.makeAPICall<z.infer<typeof VectorListResponseSchema>>(
      `/collections/${collectionId}/vectors/getAll`,
      requestOptions
    );
  }

  async addText(
    collectionId: string,
    data: z.infer<typeof VectorCreateTextListRequestSchema>
  ) {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(data),
    };
    return await this.makeAPICall<z.infer<typeof VectorListResponseSchema>>(
      `/collections/${collectionId}/vectors/create/text`,
      requestOptions
    );
  }

  async addVectors(
    collectionId: string,
    data: z.infer<typeof VectorCreateListRequestSchema>
  ) {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(data),
    };
    return await this.makeAPICall<z.infer<typeof VectorListResponseSchema>>(
      `/collections/${collectionId}/vectors/create`,
      requestOptions
    );
  }

  async updateVectors(
    collectionId: string,
    data: z.infer<typeof VectorUpdateListRequestSchema>
  ) {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(data),
    };
    return await this.makeAPICall<
      z.infer<typeof VectorListUpsertResponseSchema>
    >(`/collections/${collectionId}/vectors/update`, requestOptions);
  }

  async deleteVectors(
    collectionId: string,
    data: z.infer<typeof DeleteVectorListRequestSchema>
  ) {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(data),
    };
    return await this.makeAPICall<
      z.infer<typeof DeleteVectorListResponseSchema>
    >(`/collections/${collectionId}/vectors/delete`, requestOptions);
  }

  async queryByVector(
    collectionId: string,
    query: z.infer<typeof QueryVectorListSchema>
  ) {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(query),
    };
    return await this.makeAPICall<
      z.infer<typeof QueryVectorListResponseSchema>
    >(`/collections/${collectionId}/query`, requestOptions);
  }

  async queryByText(
    collectionId: string,
    query: z.infer<typeof QueryVectorByTextListSchema>
  ) {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(query),
    };
    return await this.makeAPICall<
      z.infer<typeof QueryVectorListResponseSchema>
    >(`/collections/${collectionId}/query/text`, requestOptions);
  }
}
