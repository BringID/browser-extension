import { TVerificationStatus } from '../../types';

type TUpdateVerificationStatus = (
  credentialGroupId: string,
  status: TVerificationStatus,
) => Promise<void>;

export default TUpdateVerificationStatus;
