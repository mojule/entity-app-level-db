import { LevelUp } from 'levelup'
import { AbstractLevelDOWN } from 'abstract-leveldown'

export type LevelStore = LevelUp<AbstractLevelDOWN<string, string>>

export interface LevelOptions {
  dataPath: string
}
