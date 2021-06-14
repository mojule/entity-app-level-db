import { EntityDb, EntityKeys } from '@mojule/entity-app';
import { LevelOptions } from './types';
export declare const createLevelDb: <TEntityMap>(name: string, keys: EntityKeys<TEntityMap>, { dataPath }?: LevelOptions) => Promise<EntityDb<TEntityMap>>;
