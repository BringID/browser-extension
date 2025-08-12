import IRelayer, { TCreateVerification } from './types';
import taskManager from '../api/task-manager';
import configs from '../configs';

class Relayer implements IRelayer {
  #apiUrl: string;

  constructor() {
    this.#apiUrl = configs.INDEXER_API;
  }

  createVerification: TCreateVerification = async (
    credentialGroupId,
    idHash,
    identityCommitment,
    verifierSignature,
  ) => {
    const { success, task } = await taskManager.addVerification(
      this.#apiUrl,
      configs.REGISTRY,
      credentialGroupId,
      idHash,
      identityCommitment,
      verifierSignature,
    );

    if (success) {
      const verification = {
        scheduledTime: task.scheduled_time,
        taskId: task.id,
        taskType: task.type,
        status: task.status,
        batchId: task.batch_id,
        credentialGroupId: task.credential_group_id,
        fetched: false,
      };

      return verification;
    }
  };
}

const relayer = new Relayer();

export default relayer;
