import IVerifier, {
  TVerify
} from './types'
import verifierApi from '../api/verify-service'
import config from '../configs'

class Verifier implements IVerifier {

  apiUrl: string = ''

  constructor (
  
  ) {
    this.apiUrl = config.VERIFIER_API
  }


  verify: TVerify = async (
    apiKey,
    presentationData,
    credentialGroupId,
    semaphoreIdentityCommitment
  ) => {

    try {
      const response = await verifierApi.verify(
        this.apiUrl,
        apiKey,
        presentationData,
        config.REGISTRY,
        credentialGroupId,
        semaphoreIdentityCommitment
      )
      const { verifier_hash, signature, verifier_message } = response

      // {
//     "verifier_message": {
//         "registry": "0xe6912badd4bf0194986c11cbb67876c4bfc0215f",
//         "credential_group_id": "1",
//         "id_hash": "0x9db17693e5a0a9b75d1648e1a33c3f9f00060dc87e8f269d677a3d6c07b43773",
//         "semaphore_identity_commitment": "6646167149526664179010472926214744446217405702075751723991327397131222474354"
//     },
//     "verifier_hash": "0xa44eec5a5c0b459035dae34ebc8960476b2f7506d7fe85e02ffcb62c754f5d9f",
//     "signature": "0x6323615ab519cdaa3bb800da478758f748d2ae05acd82123d4fe403a85d8e22a432b6a7707fd79468bccb932ed02313b95799ee1576b1f10aa77376255edd9ca1c"
// }

      if (
        verifier_hash &&
        signature && 
        verifier_message
      ) {

        const result = {
          verifierHash: verifier_hash,
          signature,
          verifierMessage: {
            registry: verifier_message.registry,
            credentialGroupId: verifier_message.credential_group_id,
            idHash: verifier_message.id_hash,
            identityCommitment: verifier_message.semaphore_identity_commitment
          }
        }

        return result
      }
    } catch (err) {
      console.error('Verify failed')
      return
    }
    
    
  }
}

const verifier = new Verifier()

export default verifier