import ISemaphore, { TGetProof, TCreateIdentity } from './types';
import { indexer } from '../api';
import { createSemaphoreIdentity } from '../../common/utils';
import config from '../../configs';


class Semaphore implements ISemaphore {
  #apiUrl: string;

  constructor() {
    this.#apiUrl = config.INDEXER_API;
  }

  getProof: TGetProof = async (identityCommitment, semaphoreGroupId) => {
    const response = await indexer.getProof(
      this.#apiUrl,
      identityCommitment,
      semaphoreGroupId,
    );
    const { success, proof } = response;
    if (success) {
      return proof;
    }
  };

  createIdentity: TCreateIdentity = (
    masterKey: string,
    credentialGroupId: string,
  ) => {
    return createSemaphoreIdentity(masterKey, credentialGroupId)
  };
}

const semaphore = new Semaphore();

export default semaphore;
