# `@emno/sdk`

## Overview

`@emno/sdk` is a TypeScript/Javascript SDK designed for managing collections and vectors in a highly efficient and scalable manner. This documentation provides a guide to using the SDK, including setup, collection management, vector operations, and querying.

---

## Getting Started

### Installation

To use `@emno/sdk`, first install the package via npm:

```bash
npm install @emno/sdk
```

## Configuration

Import and configure the Emno class with your token:

```typescript
import { Emno } from '@emno/sdk';
import { EmnoConfig } from '@emno/sdk/types';

const config: EmnoConfig = {
  token: 'your_token_here',
};

const emno = new Emno(config);
```

| Get your token by logging into the [emno dashboard](https://emno.io) and navigating to the **API** tab.

## Collections

### Creating a Collection

Create a new collection by specifying its name and configuration:

```typescript
const createdCollection = await emno.createCollection({
  name: 'your_collection_name',
  config: {
    dim: 384,
    model: 'HUGGINGFACE-MINI-LM-L6',
    // additional configuration parameters
  },
});
```

### Listing Collections

Retrieve a list of all collections:

```typescript
const collections = await emno.listCollections();
```

### Retrieving a Collection

Get a specific collection by name or ID:

```typescript
const collection = await emno.getCollection('collection_name_or_id');
```

### Deleting a Collection

Delete a collection by name or ID:

```typescript
await emno.deleteCollection('collection_name_or_id');
```

### Updating a Collection

Update collection details:

```typescript
const collection = await emno.getCollection('collection_name_or_id');
const updateData = { description: 'new_description' };
const updatedCollection = await collection.update(updateData);
```

## Vectors

### Adding Vectors to a Collection

Add vectors to a collection:

```typescript
const collection = await emno.getCollection('collection_name_or_id');
const textToAdd = [{ metadata: {}, content: 'your_text_content' }];
const addedVectors = await collection.addText(textToAdd);
```

### Retrieving Vectors

Get vectors by their IDs:

```typescript
const collection = await emno.getCollection('collection_name_or_id');
const fetchedVectors = await collection.getVectors([
  'vector_id1',
  'vector_id2',
]);
```

### Listing All Vectors

List all vectors in a collection:

```typescript
const collection = await emno.getCollection('collection_name_or_id');
const vectors = await collection.listVectors();
```

### Querying a Collection

Perform a text query in a collection:

```typescript
const collection = await emno.getCollection('collection_name_or_id');
const queryVectorArray = {
  content: ['your_query_text'],
  topK: 2,
};
const queryResultsVectors = await collection.queryByText(queryVectorArray);
```

### Getting Vector Count

Get the count of vectors in a collection:

```typescript
const collection = await emno.getCollection('collection_name_or_id');
const count = await collection.count();
```

### Updating Multiple Vectors

Update metadata for multiple vectors:

```typescript
const collection = await emno.getCollection('collection_name_or_id');
const updatedVectors = await collection.updateVectors(updatedVectorDataList);
```

### Deleting Vectors

Delete vectors by their IDs:

```typescript
const collection = await emno.getCollection('collection_name_or_id');
await collection.deleteVectors(['vector_id1', 'vector_id2']);
```

### Deleting All Vectors

Remove all vectors from a collection:

```typescript
const collection = await emno.getCollection('collection_name_or_id');
await collection.deleteAllVectors();
```
