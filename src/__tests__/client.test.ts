import { Collection } from '../emno/models/Collection';
import { Emno } from '../emno';
import { EmnoConfig } from '../types/types';

const TOKEN = process.env.DEV_TOKEN || '';
const config: EmnoConfig = {
  token: TOKEN,
};

describe('emno SDK - Client Test', () => {
  const collectionMap = new Map<string, Collection>();
  it('should create a new collection successfully', async () => {
    const emno = new Emno(config);
    const collectionName = `unit-test-${Date.now()}`;
    const createdCollection = await emno.createCollection({
      name: collectionName,
      config: {
        dim: 5,
        m: 10,
        efConstruction: 100,
        ef: 100,
        model: 'CUSTOM',
        algo: 'cosine',
      },
    });
    expect(createdCollection).toBeTruthy();
    expect(createdCollection!.name).toEqual(collectionName);
    collectionMap.set(collectionName, createdCollection!);
  }, 30_000);

  it('should create a new collection with min params successfully', async () => {
    const emno = new Emno(config);
    const collectionName = `unit-test-${Date.now()}`;
    const createdCollection = await emno.createCollection({
      name: collectionName,
      config: {
        dim: 384,
      },
    });
    expect(createdCollection).toBeTruthy();
    // console.log(createdCollection);
    expect(createdCollection!.name).toEqual(collectionName);
    collectionMap.set(collectionName, createdCollection!);
  }, 30_000);

  it('should list collections successfully', async () => {
    const emno = new Emno(config);
    const collections = await emno.listCollections();
    expect(collections).toBeTruthy();
    // ensure what we created here exists
    const collsNameList = Array.from(collectionMap.keys());
    collections?.forEach((c) => {
      expect(collsNameList.includes(c.name!));
    });
  }, 30_000);

  it('should get a collection by name successfully', async () => {
    const emno = new Emno(config);
    const collsNameList = Array.from(collectionMap.keys());
    const collectionName = collsNameList[0];
    const collection = await emno.getCollection(collectionName);
    expect(collection).toBeTruthy();
    // console.log(collection!);
    expect(collection!.name).toEqual(collectionName);

    // expect(mockedAxios.post).toBeCalledWith('/collections', expect.anything());
  }, 30_000);

  it('should get a collection by id successfully', async () => {
    const emno = new Emno(config);
    const collList = Array.from(collectionMap.values());
    const collectionId = collList[0].id!;
    const collection = await emno.getCollection(collectionId);
    expect(collection).toBeTruthy();
    // console.log(collection!);
    expect(collection!.id).toEqual(collectionId);
  }, 30_000);

  it('should delete a collection by id successfully', async () => {
    const emno = new Emno(config);
    const collList = Array.from(collectionMap.values());
    const deleteColllectionId = collList[0].id!;

    // delete collection
    const deletedCollection = await emno.deleteCollection(deleteColllectionId);
    expect(deletedCollection).toBeTruthy();
    // console.log(deletedCollection!);
    expect(deletedCollection!.id).toEqual(deleteColllectionId);
  }, 90_000);

  it('should delete a collection by name successfully', async () => {
    const emno = new Emno(config);
    const collList = Array.from(collectionMap.values());
    const deleteColllectionName = collList[1].name!;

    // delete collection
    const deletedCollection = await emno.deleteCollection(
      deleteColllectionName
    );
    expect(deletedCollection).toBeTruthy();
    // console.log(deletedCollection);
    expect(deletedCollection!.name).toEqual(deleteColllectionName);
  }, 60_000);
});
