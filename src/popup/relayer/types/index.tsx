import TCreateVerification from './create-verification';
import TGetVerification from './get-verification';

interface IRelayer {
  createVerification: TCreateVerification;

  getVerification: TGetVerification
}

export default IRelayer;

export {
  TCreateVerification,
  TGetVerification
};
