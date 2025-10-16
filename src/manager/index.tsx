import IManager, {
  TAddUserKey,
  TInit,
  TRunVerify,
  TSaveVerification,
  TGetProofs,
} from './types';
import getStorage, { DBStorage } from '../db-storage';
import TRunTask from './types/run-task';
import semaphore from '../semaphore';
import verifier from '../verifier';
import relayer from '../relayer';
import { TSemaphoreProof } from '../common/types';
import { tasks, sendMessage } from '../common/core';
import { calculateScope, defineTaskByCredentialGroupId } from '../common/utils';
import { generateProof } from '@semaphore-protocol/core';

class Manager implements IManager {
  #db?: DBStorage;

  constructor() {
    this.init();
  }

  init: TInit = async () => {
    this.#db = await getStorage();
  };

  addUserKey: TAddUserKey = async (key, address) => {
    await this.#db?.addUserKey(key, address);
  };

  runTask: TRunTask = async (taskIndex, masterKey) => {
    window.setTimeout(() => {
      sendMessage({
        type: 'NOTARIZE',
        task_id: taskIndex,
        master_key: masterKey,
      });
    }, 1000);
  };

  runVerify: TRunVerify = async (presentationData, credentialGroupId) => {
    const userKey = await this.#db?.getUserKey();

    if (userKey) {
      const identity = semaphore.createIdentity(userKey, credentialGroupId);

      try {
        const verification = await verifier.verify(
          presentationData,
          credentialGroupId,
          String(identity.commitment),
        );

        if (verification) {
          return verification;
        }
      } catch (err) {
        console.log({ err });
      }
    }
  };

  getProofs: TGetProofs = async (
    dropAddress,
    pointsRequired,
    selectedVerifications,
  ) => {
    const userKey = await this.#db?.getUserKey();

    if (!userKey) {
      throw new Error('userKey is not available');
    }
    const semaphoreProofs: TSemaphoreProof[] = [];
    const availableTasks = tasks();
    let totalScore = 0;

    const verifications = await this.#db?.getVerifications();

    if (!verifications || verifications.length === 0) {
      throw new Error('no verifications found');
    }
    if (verifications) {
      for (let x = 0; x < verifications.length; x++) {
        if (
          !selectedVerifications.includes(verifications[x].credentialGroupId)
        ) {
          continue;
        }
        const { credentialGroupId, status } = verifications[x];
        if (totalScore >= pointsRequired) {
          break;
        }
        if (status !== 'completed') {
          continue;
        }

        const relatedTask = defineTaskByCredentialGroupId(credentialGroupId);

        if (!relatedTask) {
          continue;
        }

        const { group } = relatedTask;

        totalScore = totalScore + group.points;
        const identity = semaphore.createIdentity(userKey, credentialGroupId);
        const { commitment } = identity;

        const data = await semaphore.getProof(
          String(commitment),
          group.semaphoreGroupId,
          true,
        );

        if (!data) {
          throw new Error('no proof found');
        }

        const scope = calculateScope(dropAddress);

        const { merkleTreeDepth, merkleTreeRoot, message, points, nullifier } =
          await generateProof(identity, data as any, 'verification', scope);

        semaphoreProofs.push({
          credential_group_id: credentialGroupId,
          semaphore_proof: {
            merkle_tree_depth: merkleTreeDepth,
            merkle_tree_root: merkleTreeRoot,
            nullifier: nullifier,
            message: message,
            scope,
            points,
          },
        });
      }
    }

    return semaphoreProofs;
  };

  saveVerification: TSaveVerification = async (
    verificationData,
    credentialGroupId,
  ) => {
    const userKey = await this.#db?.getUserKey();

    if (userKey) {
      const identity = semaphore.createIdentity(userKey, credentialGroupId);

      try {
        const verification = await relayer.createVerification(
          credentialGroupId,
          verificationData.verifierMessage.idHash,
          String(identity.commitment),
          verificationData.signature,
        );

        if (verification) {
          await this.#db?.addVerification(verification);
        }
        return verification;
      } catch (err) {
        // @ts-ignore
        alert(`Error occured: ${err.message}`);
        console.error(err);
      }
    }
  };
}

const manager = new Manager();

export default manager;
