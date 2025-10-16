import { Level } from 'level';
import { TUser, TVerification, TVerificationStatus } from '../common/types';
import TDBStorage from './types';
import {
  setId,
  setKey,
  setAddress,
  setLoading,
} from '../popup/store/reducers/user';
import {
  addVerification,
  addVerifications,
} from '../popup/store/reducers/verifications';
import { setUser } from '../popup/store/reducers/user';
import store from '../popup/store';
import {
  TAddInitialUser,
  TAddInitialVerifications,
  TGetUserId,
  TGetVerifications,
  TGetUserKey,
  TGetUser,
  TUpdateVerificationStatus,
  TAddUserKey,
  TAddVerification,
  TSyncUser,
  TSyncVerifications,
  TDestroyUser,
  TSetUserLoading,
} from './types';
import { tasks } from '../common/core';
import semaphore from '../semaphore';

const charwise = require('charwise');

export class DBStorage implements TDBStorage {
  #verificationsDb?: any;
  #userDb?: any;

  constructor() {
    const db = new Level('./ext-db', {
      valueEncoding: 'json',
    });

    this.#verificationsDb = db.sublevel<string, TVerification>(
      'verifications',
      {
        valueEncoding: 'json',
      },
    );

    this.#userDb = db.sublevel<string, TUser>('user', {
      valueEncoding: 'json',
    });
  }

  init = async () => {
    await this.addInitialUser();
  };

  addInitialUser: TAddInitialUser = async () => {
    const existingUserId = await this.getUserId();
    if (existingUserId) {
      const user: TUser = await this.#userDb.get(existingUserId);
      if (user) {
        user.id && store.dispatch(setId(user.id));
        user.key && store.dispatch(setKey(user.key));
        user.address && store.dispatch(setAddress(user.address));
      }

      return user;
    }

    const userId = charwise.encode(Date.now()).toString('hex');
    const userNew = {
      key: null,
      id: userId,
      address: null,
      loading: false,
    };
    await this.#userDb.put(userId, userNew);

    store.dispatch(setId(userId));
    return userNew;
  };

  addInitialVerifications: TAddInitialVerifications = async () => {
    const availableTasks = tasks();
    const existingUserId = await this.getUserId();
    if (!existingUserId) {
      return [];
    }

    const user: TUser = await this.#userDb.get(existingUserId);
    const verifications: TVerification[] = [];
    this.setUserLoading(true);

    for (const task of availableTasks) {
      for (const group of task.groups) {
        const identity = semaphore.createIdentity(
          String(user.key),
          group.credentialGroupId,
        );
        const { commitment } = identity;

        try {
          const proof = await semaphore.getProof(
            String(commitment),
            group.semaphoreGroupId,
          );
          if (proof) {
            const verificationAdded = await this.addVerification({
              credentialGroupId: group.credentialGroupId,
              status: 'completed',
              scheduledTime: +new Date(),
              fetched: true,
              taskId: task.id,
            });
            store.dispatch(addVerification(verificationAdded));
            verifications.push(verificationAdded);
          }
        } catch (err) {
          console.log(`proof for ${commitment} was not added before`);
        }
      }
    }

    this.setUserLoading(false);

    return verifications;
  };

  getUserId: TGetUserId = async () => {
    // address is always single
    try {
      let id = null;
      for await (const [_, value] of this.#userDb.iterator()) {
        id = value.id;
      }
      return id;
    } catch (err) {
      return null;
    }
  };

  getVerifications: TGetVerifications = async () => {
    const retVal: TVerification[] = [];
    for await (const [_, value] of this.#verificationsDb.iterator()) {
      retVal.push(value as TVerification);
    }
    return retVal;
  };

  updateVerificationStatus: TUpdateVerificationStatus = async (
    credentialGroupId: string,
    status: TVerificationStatus,
  ) => {
    const verification: TVerification =
      await this.#verificationsDb.get(credentialGroupId);
    await this.#verificationsDb.put(credentialGroupId, {
      ...verification,
      status,
    });

    await this.syncVerifications();
  };

  addUserKey: TAddUserKey = async (key: string, address: string) => {
    const existingUserId = await this.getUserId();
    if (existingUserId) {
      const user: TUser = await this.#userDb.get(existingUserId);

      await this.#userDb.put(existingUserId, {
        ...user,
        key,
        address,
      });

      store.dispatch(setKey(key));

      await this.addInitialVerifications();

      return key;
    } else {
      throw new Error('No user detected');
    }
  };

  setUserLoading: TSetUserLoading = async (loading) => {
    const existingUserId = await this.getUserId();
    if (existingUserId) {
      const user: TUser = await this.#userDb.get(existingUserId);

      await this.#userDb.put(existingUserId, {
        ...user,
        loading,
      });

      store.dispatch(setLoading(loading));

      return loading;
    } else {
      throw new Error('No user detected');
    }
  };

  destroyUser: TDestroyUser = async () => {
    await this.#userDb.clear();
    await this.#verificationsDb.clear();
    await this.addInitialUser();

    return true;
  };

  getUserKey: TGetUserKey = async () => {
    const existingUserId = await this.getUserId();
    if (existingUserId) {
      return (await this.#userDb.get(existingUserId)).key;
    }
  };

  getUser: TGetUser = async () => {
    const existingUserId = await this.getUserId();
    if (existingUserId) {
      return await this.#userDb.get(existingUserId);
    }
  };

  addVerification: TAddVerification = async (verification) => {
    await this.#verificationsDb.put(
      verification.credentialGroupId,
      verification,
    );
    store.dispatch(addVerification(verification));
    return verification;
  };

  syncUser: TSyncUser = async () => {
    const user = await this.getUser();
    store.dispatch(setUser(user));
  };

  syncVerifications: TSyncVerifications = async () => {
    const verifications = await this.getVerifications();
    store.dispatch(addVerifications(verifications));
  };
}

const getStorage = (() => {
  let storage: null | DBStorage = null;

  return async () => {
    if (!storage) {
      const dbStorage = new DBStorage();
      await dbStorage.init();
      storage = dbStorage;

      return dbStorage;
    }

    return storage;
  };
})();

export default getStorage;
