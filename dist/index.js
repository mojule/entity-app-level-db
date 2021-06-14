"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLevelDb = void 0;
const path_1 = require("path");
const level = require("level");
const entity_app_1 = require("@mojule/entity-app");
const util_1 = require("@mojule/util");
const create_collection_1 = require("./create-collection");
const loadDataStore = async (name) => {
    return new Promise((resolve, reject) => {
        const store = level(name, {}, err => {
            if (err)
                return reject(err);
        });
        resolve(store);
    });
};
const initCollections = async (name, keys, dataPath) => {
    const collections = {};
    const stores = {};
    await entity_app_1.eachEntityKey(keys, async (key) => {
        const storePath = path_1.posix.join(dataPath, `${name}.${key}.db`);
        const store = await loadDataStore(storePath);
        collections[key] = create_collection_1.createCollection(store);
        stores[key] = store;
    });
    return { stores, collections };
};
const createLevelDb = async (name, keys, { dataPath } = { dataPath: './data/level' }) => {
    name = util_1.kebabCase(name);
    const drop = async () => entity_app_1.defaultDrop(db)();
    const close = async () => {
        await entity_app_1.eachEntityKey(keys, async (key) => {
            await stores[key].close();
        });
    };
    const { collections, stores } = await initCollections(name, keys, dataPath);
    const db = { drop, close, collections };
    return db;
};
exports.createLevelDb = createLevelDb;
//# sourceMappingURL=index.js.map