import { Level } from 'level'
import TAddInitialUser from './add-initial-user'
import TAddInitialVerifications from './add-initial-verifications'
import TGetUserId from './get-user-id'
import TGetVerifications from './get-verifications'
import TGetUserKey from './get-user-key'

interface TDBStorage {
  db?: Level

  addInitialUser: TAddInitialUser

  addInitialVerifications: TAddInitialVerifications

  getUserId: TGetUserId

  getVerifications: TGetVerifications

  getUserKey: TGetUserKey
}

export default TDBStorage

export {
  TAddInitialUser,
  TAddInitialVerifications,
  TGetUserId,
  TGetVerifications,
  TGetUserKey
}