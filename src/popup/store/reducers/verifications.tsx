import { TVerification } from "../../types"
import { AppRootState } from './index'
import { useSelector } from 'react-redux'
import deepEqual from 'fast-deep-equal'

enum ActionType {
  '/verifications/addVerification' = '/verifications/addVerification',
  '/verifications/addVerifications' = '/verifications/addVerifications',
}

type Action<payload> = {
  type: ActionType;
  payload?: payload;
  error?: boolean;
}

type State = TVerification[]

const initState: State = []

export const addVerification = (verification: TVerification): Action<TVerification> => ({
  type: ActionType['/verifications/addVerification'],
  payload: verification
})

export const addVerifications = (verifications: TVerification[]): Action<TVerification[]> => ({
  type: ActionType['/verifications/addVerifications'],
  payload: verifications
})

export default function verifications(state = initState, action: Action<any>): State {

  console.log('verifications store:', { action })
  switch (action.type) {
    case ActionType['/verifications/addVerification']:
      console.log('adding to store addVerification: ', { result: [ action.payload, ...state ] })
      return [ action.payload, ...state ]
    case ActionType['/verifications/addVerifications']:
      console.log('adding to store addVerifications: ', { result: action.payload })

      return action.payload
  
    default:
      console.log('default: ', { state })
      return state;
  }
}

export const useVerifications: (() => State) = () => {
  return useSelector((state: AppRootState) => {
    console.log('useVerifications: ', { state })
    return state.verifications
  })
}

