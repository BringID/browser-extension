import { Level } from 'level'
import { TUser, TUserStatus, TVerification, TVerificationStatus } from '../types'
import TDBStorage from './types'
import { setId, setKey, setStatus } from '../store/reducers/user'
import {
  addVerification,
  addVerifications
} from '../store/reducers/verifications'
import { setUser } from '../store/reducers/user'
import store from '../store'
import {
  TAddInitialUser,
  TAddInitialVerifications,
  TGetUserId,
  TGetVerifications,
  TGetUserKey,
  TGetUser,
  TUpdateVerificationStatus,
  TAddUserKey,
  TAddUserStatus,
  TAddVerification,
  TSyncUser,
  TSyncVerifications
} from './types'
import { calculateAvailablePoints, defineUserStatus } from '../utils'

const charwise = require('charwise')

export class DBStorage implements TDBStorage {
  #verificationsDb?: any
  #userDb?: any

  constructor () {
    const db = new Level('./ext-db', {
      valueEncoding: 'json',
    })

    this.#verificationsDb = db.sublevel<string, TVerification>('verifications', {
      valueEncoding: 'json',
    });

    this.#userDb = db.sublevel<string, TUser>('user', {
      valueEncoding: 'json',
    })

  }

  init = async () => {
    await this.addInitialUser()
  }


  addInitialUser: TAddInitialUser = async () => {
    const existingUserId = await this.getUserId()
    console.log('RUNNING addInitialUser', existingUserId)
    if (existingUserId) {
      const user =  await this.#userDb.get(existingUserId)
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
    await this.#userDb.put(userId, userNew)

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
      status: 'scheduled' as TVerificationStatus,
      scheduledTime: +new Date() + 30000,
      credentialGroupId: '1',
      fetched: true
    }]

    const verificationAddedToDB = await this.addVerification(result[0])
    console.log('verificationAddedToDB: ', { verificationAddedToDB })

    const actualPoints = calculateAvailablePoints(result)
    const actualStatus = defineUserStatus(actualPoints)
    await this.addUserStatus(actualStatus)
    console.log('verifications after update of key:', { store: store.getState() })
    return result
  }

  getUserId: TGetUserId = async () => {
    // address is always single
    try {
      let id = null
      for await (const [key, value] of this.#userDb.iterator()) {
        id = value.id
      }
      console.log('RUNNING getUserId', id)
      return id
    } catch (err) {
      return null
    }
  }

  getVerifications: TGetVerifications = async () => {
    const retVal: TVerification[] = []
    for await (const [key, value] of this.#verificationsDb.iterator()) {
      retVal.push(value as TVerification)
    }
    return retVal
  }

  updateVerificationStatus: TUpdateVerificationStatus = async (
    credentialGroupId: string,
    status: TVerificationStatus
  ) => {
    const verification: TVerification =  await this.#verificationsDb.get(credentialGroupId)
    console.log({ verification })
    await this.#verificationsDb.put(credentialGroupId, {
      ...verification,
      status
    })

    await this.syncVerifications()
  }

  addUserKey: TAddUserKey = async (
    key: string
  ) => {
    const existingUserId = await this.getUserId()
    console.log('RUNNING addUserKey', existingUserId)
    if (existingUserId) {
      const user: TUser =  await this.#userDb.get(existingUserId);

      await this.#userDb.put(existingUserId, {
        ...user,
        key
      })
      
      store.dispatch(setKey(key))
      console.log('addUserKey', { key })

      await this.addInitialVerifications()

      return key
    } else {
      throw new Error('No user detected')
    }
  }

  addUserStatus: TAddUserStatus = async (
    status: TUserStatus
  ) => {
    const existingUserId = await this.getUserId()
    console.log('RUNNING addUserStatus', existingUserId)
    if (existingUserId) {
      const user: TUser =  await this.#userDb.get(existingUserId);
      await this.#userDb.put(existingUserId, {
        ...user,
        status
      })
      
      store.dispatch(setStatus(status))
      return status
    } else {
      throw new Error('No user detected')
    }
  }


  getUserKey: TGetUserKey = async () => {
    const existingUserId = await this.getUserId()
    console.log('RUNNING getUserKey', existingUserId)
    if (existingUserId) {
      return (await this.#userDb.get(existingUserId)).key
    }
  }

  getUser: TGetUser = async () => {
    const existingUserId = await this.getUserId()
    if (existingUserId) {
      return (await this.#userDb.get(existingUserId))
    }
  }

  addVerification: TAddVerification = async (
    verification
  ) => {
    console.log('RUNNING addVerification: ', verification)
    await this.#verificationsDb.put(verification.credentialGroupId, verification)
    store.dispatch(addVerification(verification))
    return verification
  }

  syncUser: TSyncUser = async () => {
    const user = await this.getUser()
    store.dispatch(setUser(user))
  }

  syncVerifications: TSyncVerifications = async () => {
    const verifications = await this.getVerifications()
    store.dispatch(addVerifications(verifications))
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

