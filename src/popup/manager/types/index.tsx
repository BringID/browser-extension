import TAddUserKey from "./add-user-key"
import TInit from "./init"
import TRunTask from './run-task'
import TRunVerify from "./run-verifier"
import TSaveVerification from "./save-verification"


interface TManager {
  addUserKey: TAddUserKey
  runTask: TRunTask
  runVerify: TRunVerify
  saveVerification: TSaveVerification
}

export default TManager

export {
  TAddUserKey,
  TInit,
  TRunTask,
  TRunVerify,
  TSaveVerification
}