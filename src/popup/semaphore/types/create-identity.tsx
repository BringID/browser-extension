import { Identity } from "@semaphore-protocol/identity"

type TCreateIdentity = (
  master_key: string,
  credential_group_id: string
) => Identity


export default TCreateIdentity