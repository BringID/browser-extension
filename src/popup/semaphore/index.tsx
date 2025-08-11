import ISemaphore, {
  TGetProof,
  TCreateIdentity
} from './types'
import { indexer } from '../api'

import config from '../configs'
import { keccak256, AbiCoder } from 'ethers'
import { Identity } from "@semaphore-protocol/identity"

class Semaphore implements ISemaphore {

  #apiUrl: string

  constructor (
  
  ) {
    this.#apiUrl = config.INDEXER_API
  }


  getProof: TGetProof = async (
    identityCommitment,
    semaphoreGroupId
  ) => {
    const response = await indexer.getProof(
      this.#apiUrl,
      identityCommitment,
      semaphoreGroupId
    )
    const { success, proof } = response
    if (success) {
      return proof
    }
  }

  createIdentity: TCreateIdentity = (
    masterKey: string,
    credentialGroupId: string
  ) => {
    if (!masterKey) {
      throw new Error('MASTER KEY IS NOT PROVIDED')
    }
    const coder = new AbiCoder()
    const encoded = coder.encode(
      ["string", "string"],
      [masterKey, credentialGroupId]
    )
    const identityKey = keccak256(encoded)
    const identity = new Identity(identityKey)
    return identity
  }
}

const semaphore = new Semaphore()

export default semaphore