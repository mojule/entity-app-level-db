import { DbCollection } from '@mojule/entity-app';
import { LevelStore } from './types';
export declare const createCollection: <TEntity>(collection: LevelStore) => DbCollection<TEntity>;
