import { posix } from 'path'
import * as level from 'level'
import { LevelUp } from 'levelup'

import { 
  DbCollections, defaultDrop, eachEntityKey, EntityDb, EntityKeys 
} from '@mojule/entity-app'

import { KeyValueMap, kebabCase } from '@mojule/util'

import { createCollection } from './create-collection'
import { LevelStore, LevelOptions } from './types'

const loadDataStore = async ( name: string ) => {
  return new Promise<LevelUp>( ( resolve, reject ) => {
    const store = level( name, {}, err => {
      if ( err ) return reject( err )
    } )

    resolve( store )
  } )
}

const initCollections = async <TEntityMap>(
  name: string, keys: EntityKeys<TEntityMap>, dataPath: string
) => {
  const collections: DbCollections<TEntityMap> = <any>{}
  const stores: KeyValueMap<TEntityMap, LevelStore> = <any>{}

  await eachEntityKey( keys, async key => {
    const storePath = posix.join( dataPath, `${ name }.${ key }.db` )
    const store = await loadDataStore( storePath )

    collections[ key ] = createCollection( store )
    stores[ key ] = store
  } )

  return { stores, collections }
}

export const createLevelDb = async <TEntityMap>(
  name: string, keys: EntityKeys<TEntityMap>,
  { dataPath }: LevelOptions = { dataPath: './data/level' }
) => {
  name = kebabCase( name )

  const drop = async () => defaultDrop( db )()

  const close = async () => {
    await eachEntityKey( keys, async key => {
      await stores[ key ].close()
    } )
  }

  const { collections, stores } = await initCollections( name, keys, dataPath )

  const db: EntityDb<TEntityMap> = { drop, close, collections }

  return db
}