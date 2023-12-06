import { VectorType } from '../../types/types';
import { EmnoHttpClient } from '../utils/httpClient';

export class Vector {
  id?: string;
  metadata?: any; // Since it's nullable and not strictly defined in the spec
  content?: string;
  values?: number[];
  collectionId?: string;
  distance?: number;
  score?: number;

  private populate(data: VectorType) {
    const { id, metadata, content, values, distance, score } = data;
    this.id = id ? id : undefined;
    this.metadata = metadata;
    this.content = content;
    this.values = values ? values : [];
    this.distance = distance;
    this.score = score;
  }

  constructor(data: VectorType, collectionId: string, client: EmnoHttpClient) {
    this.populate(data);
    this.collectionId = collectionId;
  }

  toString(): string {
    const { id, metadata, content, values, score, distance } = this;
    return JSON.stringify(
      {
        id,
        metadata,
        content,
        values,
        score,
        distance,
      },
      null,
      2
    );
  }
}
