import { Level } from 'level';
import TAddInitialUser from './add-initial-user';
import TAddInitialVerifications from './add-initial-verifications';
import TGetUserId from './get-user-id';
import TGetVerifications from './get-verifications';
import TGetUserKey from './get-user-key';
import TGetUser from './get-user';
import TUpdateVerificationStatus from './update-verification-status';
import TAddUserKey from './add-user-key';
import TAddVerification from './add-verification';
import TSyncUser from './sync-user';
import TSyncVerifications from './sync-verifications';
import TDestroyUser from './destroy-user';

interface TDBStorage {
  db?: Level;

  addInitialUser: TAddInitialUser;

  addInitialVerifications: TAddInitialVerifications;

  getUserId: TGetUserId;

  getVerifications: TGetVerifications;

  getUserKey: TGetUserKey;

  getUser: TGetUser;

  updateVerificationStatus: TUpdateVerificationStatus;

  addUserKey: TAddUserKey;

  addVerification: TAddVerification;

  syncUser: TSyncUser;

  syncVerifications: TSyncVerifications;

  destroyUser: TDestroyUser;
}

export default TDBStorage;

export {
  TAddInitialUser,
  TAddInitialVerifications,
  TDestroyUser,
  TGetUserId,
  TGetVerifications,
  TGetUserKey,
  TGetUser,
  TUpdateVerificationStatus,
  TAddUserKey,
  TAddVerification,
  TSyncUser,
  TSyncVerifications,
};
