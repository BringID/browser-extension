import IManager, {
  TAddUserKey,
  TInit,
  TRunVerify,
  TSaveVerification
}  from './types'
import DBStorage from '../db-storage'
import TRunTask from './types/run-task'
import semaphore from '../semaphore'
import verifier from '../verifier'
import relayer from '../relayer'


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

  runTask: TRunTask = async (
    credentialGroupId
  ) => {
    // presentation data 

    return 'presentation data '
  }

  runVerify: TRunVerify = async (
    presentationData,
    credentialGroupId
  ) => {
    const userKey = ''
    const identity = semaphore.createIdentity(
      userKey,
      credentialGroupId
    )

    try {
      const verification = await verifier.verify(
        '',
        presentationData,
        credentialGroupId,
        String(identity.commitment)
      )

      if (verification) {
        return verification
      }
    } catch (err) {
      console.log({ err })
    }
  }

  saveVerification: TSaveVerification = async (
    verificationData,
    credentialGroupId
  ) => {
    const userKey = ''

    const identity = semaphore.createIdentity(
      userKey,
      credentialGroupId
    )
    const verification = await relayer.createVerification(
      credentialGroupId,
      verificationData.verifierMessage.idHash,
      String(identity.commitment),
      verificationData.signature
    )
  }







  // runTask => presentation data  +
  // runVerifier => verifier_hash: string ; signature: string ; verifier_message +
  // saveTask => task +

  // getProofs => proofs[]

  // 
}

const manager = new Manager()
console.log({ manager })
export default manager
