import { LevelUp } from 'levelup';
import { AbstractLevelDOWN } from 'abstract-leveldown';
export declare type LevelStore = LevelUp<AbstractLevelDOWN<string, string>>;
export interface LevelOptions {
    dataPath: string;
}
