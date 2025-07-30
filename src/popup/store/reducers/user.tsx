import { TUserStatus } from "../../types"
import { AppRootState } from './index'
import { useSelector } from 'react-redux'
import deepEqual from 'fast-deep-equal'

enum ActionType {
  '/user/setKey' = '/user/setKey',
  '/user/setStatus' = '/user/setStatus'
}

type Action<payload> = {
  type: ActionType;
  payload?: payload;
  error?: boolean;
}

type State = {
  key: string | null
  status: TUserStatus
}

const initState: State = {
  key: null,
  status: 'basic'
}

export const setPrivateKey = (privateKey: string): Action<string> => ({
  type: ActionType['/user/setKey'],
  payload: privateKey
})

export const setStatus = (status: TUserStatus): Action<string> => ({
  type: ActionType['/user/setStatus'],
  payload: status
})

export default function user(state = initState, action: Action<any>): State {
  switch (action.type) {
    case ActionType['/user/setKey']:
      return { ...state, key: action.payload }
    case ActionType['/user/setStatus']:
      return { ...state, status: action.payload }
    default:
      return state;
  }
}

export const useUser: (() => State) = () => {
  return useSelector((state: AppRootState) => {
    return state.user
  }, deepEqual)
}

