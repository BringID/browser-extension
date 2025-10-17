import { TVerification } from '../../common/types';

type TCreateVerification = (
  credentialGroupId: string,
  idHash: string,
  identityCommitment: string,
  verifierSignature: string,
) => Promise<TVerification | void>;

export default TCreateVerification;
