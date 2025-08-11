import IManager, {
  TAddUserKey,
  TInit
}  from './types'
import DBStorage from '../db-storage'

class Manager implements IManager {
  db?: DBStorage

  constructor () {
    console.log('HELLO')
    this.init()
  }

  init: TInit = async () => {
    this.db = new DBStorage()
    this.db.addInitialUser()
  }

  addUserKey: TAddUserKey = async (
    id: string,
    key: string
  ) => {
    await this.db?.addUserKey(id, key)
  }
}

const manager = new Manager()
console.log({ manager })
export default manager
