import { Level } from 'level'
import { TUser, TUserStatus, TVerification, TVerificationStatus } from '../types'
import TDBStorage from './types'
import { setId, setKey, setStatus } from '../store/reducers/user'
import {
  addVerification
} from '../store/reducers/verifications'

import store from '../store'
import {
  TAddInitialUser,
  TAddInitialVerifications,
  TGetUserId,
  TGetVerifications,
  TGetUserKey
} from './types'
import {
  tasks
} from '../../common/core/task'
import semaphore from '../semaphore'

const charwise = require('charwise')

export class DBStorage implements TDBStorage {
  db?: Level
  verificationsDb?: any
  userDb?: any

  constructor () {
    this.db = new Level('./ext-db', {
      valueEncoding: 'json',
    })

    this.verificationsDb = this.db.sublevel<string, TVerification>('verifications', {
      valueEncoding: 'json',
    });

    this.userDb = this.db.sublevel<string, TUser>('user', {
      valueEncoding: 'json',
    })

  }

  init = async () => {
    await this.addInitialUser()
    await this.addInitialVerifications()
  }


  addInitialUser: TAddInitialUser = async () => {
    const existingUserId = await this.getUserId()
    console.log('RUNNING addInitialUser', existingUserId)
    if (existingUserId) {
      const user =  await this.userDb.get(existingUserId)
      store.dispatch(setId(user.id))
      store.dispatch(setKey(user.key))
      store.dispatch(setStatus(user.status))
      return user
    }
  
    const userId = charwise.encode(Date.now()).toString('hex')
    const userNew = {
      status: 'basic' as TUserStatus,
      key: null,
      id: userId
    }
    await this.userDb.put(userId, userNew)

    store.dispatch(setId(userId))
    return userNew
  }

  addInitialVerifications: TAddInitialVerifications = async () => {
    // const availableTasks = tasks()
    // const existingUserId = await this.getUserId()
    // if (!existingUserId) {
    //   return []
    // }
    // const user: TUser =  await this.userDb.get(existingUserId);
    // const verifications: TVerification[] = []
    // availableTasks.forEach(async (task, idx) => {
    //   const identity = semaphore.createIdentity(
    //     String(user.key),
    //     String(idx)
    //   )
    //   const { commitment } = identity

    //   try {
    //     const proof = await semaphore.getProof(String(commitment), task.semaphoreGroupId)
    //     if (proof) {
    //       const verificationAdded = await this.addVerification({
    //         credentialGroupId: String(idx),
    //         status: 'completed',
    //         scheduledTime: +new Date(),
    //         fetched: true
    //       })
    //       store.dispatch(addVerification(verificationAdded))
    //       verifications.push(verificationAdded)
    //     }
    //   } catch (err) {
    //     console.log(`proof for ${commitment} was not added before`)
    //   }
    // })

    // return verifications
      const result = [{
        status: 'completed' as TVerificationStatus,
        scheduledTime: +new Date(),
        credentialGroupId: '1',
        fetched: false
      }]

      const verificationAddedToDB = await this.addVerification(result[0])
      store.dispatch(addVerification(verificationAddedToDB))
      return result

  }

  getUserId: TGetUserId = async () => {
    // address is always single

    try {
      let id = null
      for await (const [key, value] of this.userDb.iterator()) {
        id = value.id
      }
      return id
      console.log('RUNNING getUserId', id)
    } catch (err) {
      return null
    }
  }

  getVerifications: TGetVerifications = async () => {
    const retVal: TVerification[] = []
    for await (const [key, value] of this.verificationsDb.iterator()) {
      console.log({ value })
      retVal.push(value as TVerification)
    }
    return retVal
  }



  async addUserKey(
    key: string
  ): Promise<string | void> {
    const existingUserId = await this.getUserId()
    console.log('RUNNING addUserKey', existingUserId)
    if (existingUserId) {
      const user: TUser =  await this.userDb.get(existingUserId);

      console.log('addUserKey', { user })
      await this.userDb.put(existingUserId, {
        ...user,
        key
      })
      
      store.dispatch(setKey(key))
      console.log('addUserKey', { key })
      return key
    } else {
      throw new Error('No user detected')
    }
    
  }


  getUserKey: TGetUserKey = async () => {
    const existingUserId = await this.getUserId()
    console.log('RUNNING getUserKey', existingUserId)
    if (existingUserId) {
      return (await this.userDb.get(existingUserId)).key
    }
  }


  addVerification = async (
    verification: TVerification,
  ) => {

    console.log('RUNNING addVerification: ', verification)
    await this.verificationsDb.put(verification.credentialGroupId, verification)
    return verification
  }
}

const getStorage = (() => {

  let storage: null | DBStorage = null

  return async () => {

    if (!storage) {
      const dbStorage = new DBStorage()
      await dbStorage.init()
      storage = dbStorage

      return dbStorage
    }

    return storage
  }


})()



export default getStorage

