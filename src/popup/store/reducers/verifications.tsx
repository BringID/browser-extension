import { TVerification } from "../../types"
import { AppRootState } from './index'
import { useSelector } from 'react-redux'
import deepEqual from 'fast-deep-equal'

enum ActionType {
  '/tasks/addTask' = '/tasks/addTask',
  '/tasks/addTasks' = '/tasks/addTasks',
}

type Action<payload> = {
  type: ActionType;
  payload?: payload;
  error?: boolean;
}

type State = TVerification[]

const initState: State = []

export const addTask = (task: TVerification): Action<TVerification> => ({
  type: ActionType['/tasks/addTask'],
  payload: task
})

export const addTasks = (tasks: TVerification[]): Action<TVerification[]> => ({
  type: ActionType['/tasks/addTasks'],
  payload: tasks
})

export default function verifications(state = initState, action: Action<any>): State {
  console.log({ action })
  switch (action.type) {
    case ActionType['/tasks/addTask']:
      return [ action.payload, ...state ]
    case ActionType['/tasks/addTasks']:
      return action.payload
  
    default:
      return state;
  }
}

export const useVerifications: (() => State) = () => {
  return useSelector((state: AppRootState) => {
    return state.verifications
  }, deepEqual)
}

