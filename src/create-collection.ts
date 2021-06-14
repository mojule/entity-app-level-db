import { PutBatch, DelBatch } from 'abstract-leveldown'

import { 
  DbCollection, DbCreate, DbCreateMany, DbIds, DbItem, DbLoad, DbRemove, 
  DbRemoveMany, DbSave, DbSaveMany, defaultFind, defaultFindOne, 
  defaultLoadMany, defaultLoadPaged 
} from '@mojule/entity-app'

import { randId } from '@mojule/util'

import { LevelStore } from './types'

const entityToDbEntity = <TEntity>( entity: TEntity ): TEntity & DbItem => {
  const _id = randId()
  const dbEntity = Object.assign( {}, entity, { _id } )

  return dbEntity
}

const createPutBatch = <TEntity>( documents: ( TEntity & DbItem )[] ) => {
  const type = 'put' as const

  const batch: PutBatch<string, string>[] = documents.map( d => {
    const key = d._id
    const value = JSON.stringify( d )

    return { type, key, value }
  } )

  return batch
}

const createDelBatch = ( ids: string[] ) => {
  const type = 'del' as const

  const batch: DelBatch<string, string>[] = ids.map( key => {
    return { type, key }
  } )

  return batch
}

export const createCollection = <TEntity>(
  collection: LevelStore
) => {
  const ids: DbIds = () => new Promise( ( resolve, reject ) => {
    const stream = collection.createKeyStream()
    const keys: string[] = []

    stream
      .on( 'data', key => keys.push( key ) )
      .on( 'error', reject )
      .on( 'close', () => resolve( keys ) )
  } )

  const create: DbCreate<TEntity> = async entity => {
    const dbEntity = entityToDbEntity( entity )

    await collection.put( dbEntity._id, JSON.stringify( dbEntity ) )

    return dbEntity._id
  }

  const createMany: DbCreateMany<TEntity> = async entities => {
    const dbEntities = entities.map( entityToDbEntity )
    const batch = createPutBatch( dbEntities )

    await collection.batch( batch )

    return dbEntities.map( d => d._id )
  }

  const load: DbLoad<TEntity> = async _id => {
    const dbEntity = await collection.get( _id )

    return JSON.parse( dbEntity )
  }

  const loadMany = defaultLoadMany( load )

  const save: DbSave<TEntity> = async document => {
    const { _id } = document

    if ( typeof _id !== 'string' )
      throw Error( 'Expected document to have _id:string' )

    // must exist
    await collection.get( _id )
    await collection.put( _id, JSON.stringify( document ) )
  }

  const saveMany: DbSaveMany<TEntity> = async documents => {
    const ids = documents.map( d => d._id )

    for( let i = 0; i < ids.length; i++ ){
      const _id = ids[ i ]
      if ( typeof _id !== 'string' )
        throw Error( 'Expected document to have _id:string' )

      // must exist
      await collection.get( _id )
    }

    const batch = createPutBatch( documents )

    await collection.batch( batch )
  }

  const remove: DbRemove = async id => {
    await collection.get( id )
    await collection.del( id )
  }

  const removeMany: DbRemoveMany = async ids => {
    for( let i = 0; i < ids.length; i++ ){
      await collection.get( ids[ i ] )
    }

    const batch = createDelBatch( ids )
    await collection.batch( batch )
  }

  const find = defaultFind( ids, loadMany )
  const findOne = defaultFindOne( ids, loadMany )

  const loadPaged = defaultLoadPaged( ids, loadMany )

  const entityCollection: DbCollection<TEntity> = {
    ids, create, createMany, load, loadMany, save, saveMany, remove, removeMany,
    find, findOne, loadPaged
  }

  return entityCollection
}
