import { Level } from 'level'
import { TUser, TUserStatus, TVerification } from '../types'
import TDBStorage from './types'
import { setId, setKey, setStatus } from '../store/reducers/user'
import store from '../store'

const charwise = require('charwise')

class DBStorage implements TDBStorage {
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


  async addInitialUser(): Promise<TUser> {
    const existingUserId = await this.getUserId()
    console.log({ existingUserId })
    if (existingUserId) {
      const user =  await this.userDb.get(existingUserId)
      console.log({ user })
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

    console.log({ userId })
    store.dispatch(setId(userId))
    return userNew
  }

  async getUserId(): Promise<string | null> {
    // address is always single

    try {
      let id = null
      for await (const [key, value] of this.userDb.iterator()) {
        id = value.id
      }
      return id
    } catch (err) {
      return null
    }

  }


  async addUserKey(
    id: string,
    key: string
  ): Promise<string> {
    const currentUser = await this.userDb.get(id)
    await this.userDb.put(id, {
      ...currentUser,
      key
    })
    store.dispatch(setKey(key))
    return key
  }


  async getUserKey(
    id: string
  ): Promise<string | null> {
    return (await this.userDb.get(id)).key
  }


  async addVerification(
    verification: TVerification,
  ): Promise<TVerification> {
    await this.verificationsDb.put(verification.verificationId, verification)
    return verification
  }

  async getVerifications(): Promise<TVerification[]> {
    const retVal = []
    for await (const [key, value] of this.verificationsDb.iterator()) {
      retVal.push(value)
    }
    return retVal
  }

}


export default DBStorage