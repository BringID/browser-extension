import { TVerification } from '../../types';

type TGetVerification = (
 verificationId: string
) => Promise<TVerification | void>;

export default TGetVerification;
