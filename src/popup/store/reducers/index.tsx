import { combineReducers } from 'redux'
import user from './user'
import verifications from './verifications'

const rootReducer = combineReducers({
  user,
  verifications
})

export type AppRootState = ReturnType<typeof rootReducer>
export default rootReducer
