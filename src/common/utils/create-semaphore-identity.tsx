import { keccak256, AbiCoder } from 'ethers';
import { Identity } from '@semaphore-protocol/identity';

const createSemaphoreIdentity = (
  masterKey: string,
  credentialGroupId: string,
) => {
  if (!masterKey) {
    throw new Error('MASTER KEY IS NOT PROVIDED');
  }
  const coder = new AbiCoder();
  const encoded = coder.encode(
    ['string', 'string'],
    [masterKey, credentialGroupId],
  );
  const identityKey = keccak256(encoded);
  const identity = new Identity(identityKey);
  return identity;
};

export default createSemaphoreIdentity;
