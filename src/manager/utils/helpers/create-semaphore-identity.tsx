import { Identity } from "@semaphore-protocol/identity"
import { keccak256, AbiCoder } from 'ethers'

const createSemaphoreIdentity = (
  master_key: string,
  verification_id: string
) => {
  if (!master_key) {
    throw new Error('MASTER KEY IS NOT PROVIDED')
  }
  const coder = new AbiCoder()
  const encoded = coder.encode(
    ["string", "string"],
    [master_key, verification_id]
  )
  const identityKey = keccak256(encoded)
  console.log({ identityKey })
  const identity = new Identity(identityKey)
  return identity
}

export default createSemaphoreIdentity
