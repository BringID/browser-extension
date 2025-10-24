import { TVerification } from '../../common/types';

type TGetVerification = (
  verificationId: string,
) => Promise<TVerification | void>;

export default TGetVerification;
