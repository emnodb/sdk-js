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
  OpenAIChatRequestSchema,
  OpenAIChatResponseSchema,
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
      Client: 'sdk-js',
    },
  };

  async makeAPICall<T>(
    urlPath: string,
    options: RequestInit,
    retries = 3, // Maximum number of retries
    delayFactor = 1000 // Initial delay factor in milliseconds
  ): Promise<{ responseData?: T; status: number; error?: ErrorBodyExt }> {
    const URL = `${this.baseUrl}${urlPath}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(URL, {
          ...this.defaultFetchConfig,
          ...options,
        });

        if (!response.ok) {
          const errItem = await this.parseErrorResponse(response);
          //   console.log(`Err`, errItem);
          throw {
            ...errItem,
            extra: errItem.extra?.push(`attempt:${attempt}`),
          };
        }

        return {
          status: response.status,
          responseData: (await response.json()) as T,
        };
      } catch (error: unknown) {
        if (error && (error as ErrorBodyExt).canRetry) {
          if (attempt < retries) {
            // console.log(`retrying, this is attempt#${attempt + 1} `);
            // Exponential backoff: delayFactor * 2^attempt
            await this.delay(delayFactor * Math.pow(2, attempt));
            continue;
          }
        }
        return { status: 500, error: error as ErrorBodyExt }; // Return the last error after all retries
      }
    }

    // Fallback return in case of unexpected behavior
    return { status: 500, error: { message: 'Unexpected error', error: true } };
  }

  private async parseErrorResponse(response: Response): Promise<ErrorBodyExt> {
    let errBody: ErrorBody;

    const status = response.status;
    const errorsToRetry: Record<
      number,
      { meaning: string; shouldRetry: boolean }
    > = {
      408: {
        meaning: 'Request Timeout',
        shouldRetry: true,
      },
      429: {
        meaning: 'Too Many Requests',
        shouldRetry: true,
      },
      500: {
        meaning: 'Internal Server Error',
        shouldRetry: true,
      },
      502: {
        meaning: 'Bad Gateway',
        shouldRetry: true,
      },
      503: {
        meaning: 'Service Unavailable',
        shouldRetry: true,
      },
      504: {
        meaning: 'Gateway Timeout',
        shouldRetry: true,
      },
    };
    let errText = errorsToRetry[status]?.meaning || 'Unknown Error';
    const canRetry = errorsToRetry[status]?.shouldRetry || false;
    try {
      errBody = (await response.json()) as ErrorBody;
    } catch (e) {
      try {
        errText = await response.text();
      } catch (e2) {
        console.log('\nUnable to parse error text');
      }
      if (status === 401) {
        errText = 'Invalid user or token';
      }
      errBody = { message: `${status}: ${errText}` };
    }
    return { ...errBody, error: true, canRetry, extra: [] };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

  async listVectors(
    collectionId: string,
    includeVectorValues = false,
    page = 0,
    limit = 10
  ) {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify({ includeVectorValues, page, limit }),
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

  async openAIChatCompletions(data: z.infer<typeof OpenAIChatRequestSchema>) {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(data),
    };
    return await this.makeAPICall<z.infer<typeof OpenAIChatResponseSchema>>(
      `/openai/completions`,
      requestOptions
    );
  }
}
