import ISemaphore, { TGetProof, TCreateIdentity } from './types';
import { indexer } from '../api';
import { createSemaphoreIdentity, defineApiUrl } from '../../common/utils';

class Semaphore implements ISemaphore {
  #apiUrl: string;

  constructor() {
    this.#apiUrl = defineApiUrl();
  }

  getProof: TGetProof = async (identityCommitment, semaphoreGroupId) => {
    try {
      const response = await indexer.getProof(
        this.#apiUrl,
        identityCommitment,
        semaphoreGroupId,
      );
      const { success, proof } = response;

      if (success) {
        return proof;
      }
    } catch (err) {
      // @ts-ignore
      alert(err.message);
    }
  };

  createIdentity: TCreateIdentity = (
    masterKey: string,
    credentialGroupId: string,
  ) => {
    return createSemaphoreIdentity(masterKey, credentialGroupId);
  };
}

const semaphore = new Semaphore();

export default semaphore;
