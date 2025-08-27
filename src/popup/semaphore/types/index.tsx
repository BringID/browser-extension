import TGetProof from './get-proof';
import TCreateIdentity from './create-identity';

interface ISemaphore {
  getProof: TGetProof;

  createIdentity: TCreateIdentity;
}

export default ISemaphore;

export { TGetProof, TCreateIdentity };
