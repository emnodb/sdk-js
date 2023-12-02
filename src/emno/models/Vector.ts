import { VectorType } from '../../types/types';
import { EmnoHttpClient } from '../utils/httpClient';

export class Vector {
  id?: string;
  metadata?: any; // Since it's nullable and not strictly defined in the spec
  content?: string;
  values?: number[];
  collectionId?: string;
  distance?: number;
  private _client: EmnoHttpClient;

  private populate(data: VectorType) {
    const { id, metadata, content, values, distance } = data;
    this.id = id ? id : undefined;
    this.metadata = metadata;
    this.content = content;
    this.values = values ? values : [];
    this.distance = distance;
  }

  constructor(data: VectorType, collectionId: string, client: EmnoHttpClient) {
    this.populate(data);
    this._client = client;
    this.collectionId = collectionId;
  }

  toString() {
    // Exclude the _client property from the string representation
    const { _client, collectionId, ...rest } = this;
    return JSON.stringify(rest, null, 2);
  }
}
