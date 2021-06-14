"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCollection = void 0;
const entity_app_1 = require("@mojule/entity-app");
const util_1 = require("@mojule/util");
const entityToDbEntity = (entity) => {
    const _id = util_1.randId();
    const dbEntity = Object.assign({}, entity, { _id });
    return dbEntity;
};
const createPutBatch = (documents) => {
    const type = 'put';
    const batch = documents.map(d => {
        const key = d._id;
        const value = JSON.stringify(d);
        return { type, key, value };
    });
    return batch;
};
const createDelBatch = (ids) => {
    const type = 'del';
    const batch = ids.map(key => {
        return { type, key };
    });
    return batch;
};
const createCollection = (collection) => {
    const ids = () => new Promise((resolve, reject) => {
        const stream = collection.createKeyStream();
        const keys = [];
        stream
            .on('data', key => keys.push(key))
            .on('error', reject)
            .on('close', () => resolve(keys));
    });
    const create = async (entity) => {
        const dbEntity = entityToDbEntity(entity);
        await collection.put(dbEntity._id, JSON.stringify(dbEntity));
        return dbEntity._id;
    };
    const createMany = async (entities) => {
        const dbEntities = entities.map(entityToDbEntity);
        const batch = createPutBatch(dbEntities);
        await collection.batch(batch);
        return dbEntities.map(d => d._id);
    };
    const load = async (_id) => {
        const dbEntity = await collection.get(_id);
        return JSON.parse(dbEntity);
    };
    const loadMany = entity_app_1.defaultLoadMany(load);
    const save = async (document) => {
        const { _id } = document;
        if (typeof _id !== 'string')
            throw Error('Expected document to have _id:string');
        // must exist
        await collection.get(_id);
        await collection.put(_id, JSON.stringify(document));
    };
    const saveMany = async (documents) => {
        const ids = documents.map(d => d._id);
        for (let i = 0; i < ids.length; i++) {
            const _id = ids[i];
            if (typeof _id !== 'string')
                throw Error('Expected document to have _id:string');
            // must exist
            await collection.get(_id);
        }
        const batch = createPutBatch(documents);
        await collection.batch(batch);
    };
    const remove = async (id) => {
        await collection.get(id);
        await collection.del(id);
    };
    const removeMany = async (ids) => {
        for (let i = 0; i < ids.length; i++) {
            await collection.get(ids[i]);
        }
        const batch = createDelBatch(ids);
        await collection.batch(batch);
    };
    const find = entity_app_1.defaultFind(ids, loadMany);
    const findOne = entity_app_1.defaultFindOne(ids, loadMany);
    const loadPaged = entity_app_1.defaultLoadPaged(ids, loadMany);
    const entityCollection = {
        ids, create, createMany, load, loadMany, save, saveMany, remove, removeMany,
        find, findOne, loadPaged
    };
    return entityCollection;
};
exports.createCollection = createCollection;
//# sourceMappingURL=create-collection.js.map