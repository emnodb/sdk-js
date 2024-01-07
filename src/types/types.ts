import { z } from 'zod';

export type EmnoConfig = {
  baseUrl?: string;
  token: string;
  concurrency?: number;
};

export type ModelConfig = {
  shouldThrow?: boolean;
  logErrors?: boolean;
};

export type EmnoClientConfig = EmnoConfig & ModelConfig;

export type ErrorBody = {
  message: string;
  detail?: string;
};

export type ErrorBodyExt = ErrorBody & {
  error: true;
  canRetry?: boolean;
  extra?: string[];
};

export const AlgoEnum = z.enum(['l2', 'ip', 'cosine']);

export const ErrorResponseSchema = z.object({
  message: z.string(),
  detail: z.any().optional(),
});

export const CollectionConfigSchema = z.object({
  dim: z.number(),
  m: z.number().optional(),
  efConstruction: z.number().optional(),
  ef: z.number().optional(),
  model: z.string().optional().nullable(),
  algo: z.string().optional().nullable(),
  allowReplace: z.boolean().optional().nullable(),
});
export type CollectionConfigSchemaType = z.infer<typeof CollectionConfigSchema>;

export const CreateCollectionRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional().nullable(),
  config: CollectionConfigSchema,
});

export const CreateCollectionResponseSchema = z.object({
  name: z.string(),
  description: z.string().optional().nullable(),
  config: CollectionConfigSchema,
  id: z.string().optional().nullable(),
});

export const DeletedCollectionResponseSchema = z.object({
  deleted: CreateCollectionResponseSchema,
});

export const GetAllCollectionResponseSchema = z.array(
  CreateCollectionResponseSchema
);

export const UpdateCollectionRequestSchema = z.object({
  name: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  description: z.string().optional(),
});

export const VectorSchema = z.array(z.number());

export const VectorObjectSchema = z.object({
  values: VectorSchema,
  metadata: z.any().optional(),
  content: z.string().nonempty(),
});

export const VectorObjectWithIdSchema = z.object({
  values: VectorSchema,
  metadata: z.any().optional(),
  content: z.string().nonempty(),
  id: z.string().nullable(),
});

export const VectorObjectForUpsertSchema = z.object({
  values: VectorSchema.optional(),
  metadata: z.any().optional(),
  content: z.string().optional(),
  id: z.string().nullable().optional(),
});

export const VectorCreateListRequestSchema = z.array(
  z.object({
    values: VectorSchema,
    metadata: z.any().optional(),
    content: z.string().nonempty(),
  })
);

export const VectorTypeSchema = z.object({
  values: z.array(z.number()).optional().nullable(),
  metadata: z.any().optional(),
  content: z.string().nonempty(),
  id: z.string().nullable(),
  distance: z.number().optional(),
  score: z.number().optional(),
});

export const VectorListResponseSchema = z.array(VectorTypeSchema);

export const VectorListUpsertResponseSchema = z.object({
  created: z.array(VectorTypeSchema),
  updated: z.array(VectorTypeSchema),
  errored: z.array(z.any()),
});

export const DeleteVectorListRequestSchema = z.object({
  ids: z.array(z.string()).optional(),
  deleteAll: z.boolean().optional(),
});

export const DeleteVectorListResponseSchema = z.object({
  deleted: VectorListResponseSchema,
});

export const GetVectorListRequestSchema = z.object({
  ids: z.array(z.string()).min(1),
  includeVectorValues: z.boolean().optional(),
});

export const VectorUpdateListRequestSchema = z.array(
  VectorObjectForUpsertSchema
);

export const AddVectorSchema = z.object({
  values: VectorSchema,
  metadata: z.any().optional(),
  content: z.string().nonempty(),
});

export const CreateVectorListSchema = z.object({
  vectors: z.array(VectorSchema),
  metadata: z.array(z.any().optional()),
  content: z.array(z.string()),
});

export const UpdateVectorListSchema = z.object({
  ids: z.array(z.string()),
  vectors: z.array(VectorSchema),
  metadata: z.array(z.any().optional()),
  content: z.array(z.string()),
});

export const QueryVectorListSchema = z.object({
  vectors: z.array(VectorSchema),
  limit: z.number().optional(),
});

export const QueryVectorByTextListSchema = z.object({
  content: z.array(z.string().nonempty()),
  topK: z.number().optional(),
});

export const QueryVectorListResponseSchema = z.array(
  z.array(
    z.object({
      id: z.string().nullable(),
      content: z.string(),
      metadata: z.any(),
      distance: z.number(),
    })
  )
);

export const SearchIndexListResponseSchema = z.array(
  z.array(
    z.object({
      id: z.number(),
      distance: z.number(),
    })
  )
);

export const DeleteVectorListSchema = z.object({
  ids: z.array(z.string()).optional(),
  deleteAll: z.boolean().optional(),
});

export const GetVectorListSchema = z.object({
  ids: z.array(z.string()).min(1),
  includeVectorValues: z.boolean().optional(),
});

export const GetAllVectorsSchema = z.object({
  ids: z.array(z.string()).optional(),
  includeVectorValues: z.boolean().optional(),
});

export const VectorTextOnlySchema = z.object({
  metadata: z.any().optional(),
  content: z.string().nonempty(),
});

export const VectorCreateTextListRequestSchema = z.array(VectorTextOnlySchema);

export const CountVectorsResponseSchema = z.object({ count: z.number() });

export type CollectionConfigType = z.infer<typeof CollectionConfigSchema>;

export interface CollectionUpdateType {
  name?: string;
  description?: string;
}

export type CollectionType = z.infer<typeof CreateCollectionResponseSchema>;
export type VectorType = z.infer<typeof VectorTypeSchema>;

// export interface VectorType {
//   id?: string; // nullable
//   metadata?: unknown; // nullable
//   content: string;
//   values: number[];
// }

export interface VectorCreateType {
  content: string;
  metadata?: unknown;
  values: number[];
}

export interface VectorCreateTextType {
  content: string;
  metadata?: unknown;
}

export interface VectorUpdateType {
  id: string;
  content?: string;
  metadata?: unknown;
  values?: number[];
}

export interface VectorDeleteType {
  ids: string[];
}

export interface VectorDeleteResponseType {
  deletedIds: string[];
}

export interface CollectionQueryType {
  vectors: number[][];
  limit?: number;
}

export interface CollectionTextQueryType {
  content: string[];
  topK?: number;
}

export const CreateTokenRequestSchema = z.object({
  //name: z.string(),
  token: z.string().optional(),
  tokenType: z.string(),
});

export const TokenResponseSchema = z.object({
  //name: z.string(),
  token: z.string(),
  tokenType: z.string(),
  tokenId: z.number(),
  lastUsedAt: z.date(),
});

export const BasicTokenResponseSchema = z.object({
  //name: z.string(),
  token: z.string(),
  tokenType: z.string(),
  tokenId: z.number(),
});

export const DeletedTokenRequestSchema = z.object({
  //name: z.string(),
  token: z.string().optional(),
  tokenType: z.string(),
  tokenId: z.number().optional(),
});

export const DeletedTokenResponseSchema = z.array(BasicTokenResponseSchema);

export const GetAllTokenResponseSchema = z.array(TokenResponseSchema);
