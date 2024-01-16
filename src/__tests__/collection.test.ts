import { Collection } from '../emno/models/Collection';
import { Vector } from '../emno/models/Vector';
import { Emno } from '../emno';
import {
  EmnoConfig,
  VectorCreateTextType,
  CollectionTextQueryType,
} from '../types/types';

const TOKEN = process.env.DEV_TOKEN || '';
const config: EmnoConfig = {
  token: TOKEN,
};

const textContent = [
  `Instead of engineering vector embeddings, we often train models to translate objects to vectors. A deep neural network is a common tool for training such models. The resulting embeddings are usually high dimensional (up to two thousand dimensions) and dense (all values are non-zero).`,
  `Such embeddings are great at maintaining the semantic information of a pixel’s neighborhood in an image. However, they are very sensitive to transformations like shifts, scaling, cropping and other image manipulation operations. Therefore they are often used as raw inputs to learn more robust embeddings.`,
  `Similarity search is one of the most popular uses of vector embeddings. Search algorithms like KNN and ANN require us to calculate distance between vectors to determine similarity. Vector embeddings can be used to calculate these distances. Nearest neighbor search in turn can be used for tasks like de-duplication, recommendations, anomaly detection, reverse image search, etc.`,
];

describe('emno SDK - Collection/Vector Tests', () => {
  const collectionMap = new Map<string, Collection>();
  const vectorsMap = new Map<string, Vector>();
  const createCollection = async (collectionName: string) => {
    const emno = new Emno(config);
    const createdCollection = await emno.createCollection({
      name: collectionName,
      config: {
        dim: 384,
        model: 'HUGGINGFACE-MINI-LM-L6',
      },
    });
    return createdCollection;
  };
  beforeAll(async () => {
    // create collections
    const collectionName = `unit-test-${Date.now()}`;
    const c1 = await createCollection(collectionName);
    expect(c1).toBeTruthy();
    expect(c1!.name).toEqual(collectionName);
    collectionMap.set(collectionName, c1!);

    const collectionName2 = `unit-test-${Date.now()}`;
    const c2 = await createCollection(collectionName2);
    expect(c2).toBeTruthy();
    expect(c2!.name).toEqual(collectionName2);
    collectionMap.set(collectionName2, c2!);
  });
  afterAll(async () => {
    // delete collection
    const emno = new Emno(config);
    const collList = Array.from(collectionMap.values());
    const list = collList.map((c) => c.id);

    // delete collection
    const deletedCollection1 = await emno.deleteCollection(list[0]!);
    expect(deletedCollection1).toBeTruthy();
    // console.log(deletedCollection1!);
    expect(deletedCollection1!.id).toEqual(list[0]);

    // delete collection
    const deletedCollection2 = await emno.deleteCollection(list[1]!);
    expect(deletedCollection2).toBeTruthy();
    // console.log(deletedCollection2!);
    expect(deletedCollection2!.id).toEqual(list[1]);
  });
  it('add vectors to a collection successfully', async () => {
    // 1: Add vectors to Collection 1
    const collection = Array.from(collectionMap.values())[0];
    if (!collection) {
      throw Error('Unable to get Collection');
    }
    const text1: VectorCreateTextType = {
      metadata: { sampleValue1: 'newSampleKey1' },
      content: textContent[0],
    };
    const text2: VectorCreateTextType = {
      metadata: { sampleValue2: 'newSampleKey2' },
      content: textContent[1],
    };
    const text3: VectorCreateTextType = {
      metadata: { sampleValue2: 'newSampleKey2' },
      content: textContent[2],
    };
    var textToAdd = [text1, text2, text3];
    const addedVectors = await collection.addText(textToAdd);
    expect(addedVectors).toBeDefined();
    //expect(createdVectors).toBe(Array);
    expect(addedVectors!.length).toBe(textToAdd.length);
    addedVectors!.forEach((vec: Vector, index: number) => {
      // console.log(vec);
      // console.log(vec.id);
      expect(vec.metadata).toMatchObject(textToAdd[index].metadata as Object);
      expect(vec.collectionId).toEqual(collection.id);
      vectorsMap.set(vec.id!, vec);
    });
  }, 60_000);

  it('should get vectors by id successfully', async () => {
    const collection = Array.from(collectionMap.values())[0];
    if (!collection) {
      throw Error('Unable to get Collection');
    }
    const vectorArray = Array.from(vectorsMap.keys());
    const fetchedVectors = await collection.getVectors(vectorArray);
    expect(fetchedVectors).toBeDefined();
    expect(fetchedVectors!.length).toBe(vectorArray.length);
    fetchedVectors!.forEach((vec: Vector, index: number) => {
      // console.log(vec);
      expect(vec.id).toEqual(vectorArray[index]);
    });
  }, 30_000);

  it('should list all vectors successfully', async () => {
    const collection = Array.from(collectionMap.values())[0];
    if (!collection) {
      throw Error('Unable to get Collection');
    }

    const vectors = await collection.listVectors();
    expect(vectors).toBeDefined();
    expect(vectors!.length).toBe(vectorsMap.size);
  }, 30_000);

  it('should paginate vectors successfully', async () => {
    const collection = Array.from(collectionMap.values())[0];
    if (!collection) {
      throw Error('Unable to get Collection');
    }
    const vectorIdArray = Array.from(vectorsMap.keys());
    const vectors = await collection.listVectors(false, 1, 1);
    expect(vectors).toBeDefined();
    expect(vectors!.length).toBe(1);
    expect(vectors![0].id).toBe(vectorIdArray[1]);
  }, 30_000);

  it('should search using metadata vectors successfully', async () => {
    const collection = Array.from(collectionMap.values())[0];
    if (!collection) {
      throw Error('Unable to get Collection');
    }
    const vectorIdArray = Array.from(vectorsMap.keys());
    const queryVectorArray: CollectionTextQueryType = {
      content: ['Search algorithms like KNN'],
      topK: 2,
      metadata: { sampleValue2: 'newSampleKey2' },
    };
    const vectors = await collection.queryByText(queryVectorArray);
    expect(vectors).toBeDefined();
    expect(vectors!.length).toBe(1);
    expect(vectors![0][0].id).toBe(vectorIdArray[2]);
  }, 30_000);

  it('should query a collection successfully', async () => {
    const collection = Array.from(collectionMap.values())[0];
    if (!collection) {
      throw Error('Unable to get Collection');
    }

    const queryVectorArray: CollectionTextQueryType = {
      content: [
        'calculate distance to determine similarity.',
        'tool for training such models',
      ],
      topK: 2,
    };
    const queryResultsVectors = await collection.queryByText(queryVectorArray);
    expect(queryResultsVectors).toHaveLength(2);

    queryResultsVectors!.forEach((vecList) => {
      expect(vecList).toHaveLength(queryVectorArray.topK!);
      vecList.forEach((vec) => {
        expect(vec.content).toBeTruthy();
        expect(vec.distance).toBeTruthy();
        expect(vec.id).toBeTruthy();
        expect(vec.score).toBeTruthy();
      });
    });
  }, 60_000);

  it('should get vector count for a collection successfully', async () => {
    const collection = Array.from(collectionMap.values())[0];
    if (!collection) {
      throw Error('Unable to get Collection');
    }
    // get vector count collection
    const count = await collection.count();
    expect(count!).toEqual(vectorsMap.size);
    expect(count).toBeDefined();
  }, 30_000);

  it('should update a collection  successfully', async () => {
    const collection = Array.from(collectionMap.values())[0];
    if (!collection) {
      throw Error('Unable to get Collection');
    }
    const updateData = {
      description: 'updated description2',
    };
    //update
    const updatedCollection = await collection.update(updateData);
    expect(updatedCollection).toBeDefined();
    expect(updatedCollection!.id).toEqual(collection.id);
    expect(updatedCollection!.name).toEqual(collection.name);
    expect(updatedCollection!.description).toEqual(updateData.description);
  }, 60_000);

  it('should update multiple vectors successfully', async () => {
    const collection = Array.from(collectionMap.values())[0];
    if (!collection) {
      throw Error('Unable to get Collection');
    }
    const allVectorsWithUpdatedMeta = Array.from(vectorsMap.values()).map(
      (v) => {
        return {
          id: v.id!,
          metadata: { idValue: v.id, text: 'updated metadata' },
        };
      }
    );

    const updatedVectors = await collection.updateVectors(
      allVectorsWithUpdatedMeta
    );
    expect(updatedVectors!.length).toBe(allVectorsWithUpdatedMeta.length);
    (updatedVectors as Vector[]).forEach((vec: Vector, index: number) => {
      // console.log(vec);
      //expect(vec.values).toEqual(vectorArray[index].values);
      expect(vec.metadata).toMatchObject(
        allVectorsWithUpdatedMeta[index].metadata
      );
    });
  }, 60_000);

  it('delete vectors by id successfully', async () => {
    const collection = Array.from(collectionMap.values())[0];
    if (!collection) {
      throw Error('Unable to get Collection');
    }
    //create a vector
    const allIds = Array.from(vectorsMap.keys());
    const vectorArray = [allIds[0], allIds[1]];
    const deletedVectors = await collection.deleteVectors(vectorArray);
    expect(deletedVectors).toBeDefined();
    expect(deletedVectors!.length).toBe(vectorArray.length);
    deletedVectors!.forEach((vec: Vector, index: number) => {
      // console.log(vec);
      expect(vec.id).toEqual(vectorArray[index]);
    });
  }, 60_000);

  it('deleteAll vectors successfully', async () => {
    const collection = Array.from(collectionMap.values())[0];
    if (!collection) {
      throw Error('Unable to get Collection');
    }
    //delete all vectors
    const deletedVectors = await collection.deleteAllVectors();
    expect(deletedVectors!).toBeDefined();
    const finalVectorsArray = await collection.listVectors();
    expect(finalVectorsArray).toBeDefined();
    expect(finalVectorsArray?.length).toEqual(0);
  }, 60_000);
});
