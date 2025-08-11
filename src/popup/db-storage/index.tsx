import { Level } from 'level'
import { TUser, TUserStatus, TTask } from '../types'
import TDBStorage from './types'
import { setId, setKey, setStatus } from '../store/reducers/user'
import store from '../store'

const charwise = require('charwise')

class DBStorage implements TDBStorage {
  db?: Level
  taskDb?: any
  userDb?: any

  constructor () {
    this.db = new Level('./ext-db', {
      valueEncoding: 'json',
    })

    this.taskDb = this.db.sublevel<string, TTask>('task', {
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


  async addTask(
    task: TTask,
  ): Promise<TTask> {
    await this.taskDb.put(task.taskId, task)
    return task
  }

  async getTasks(): Promise<TTask[]> {
    const retVal = []
    for await (const [key, value] of this.taskDb.iterator()) {
      retVal.push(value)
    }
    return retVal
  }

}


export default DBStorage