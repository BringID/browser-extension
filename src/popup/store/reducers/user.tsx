import { TUserStatus, TUser } from '../../types';
import { AppRootState } from './index';
import { useSelector } from 'react-redux';
import deepEqual from 'fast-deep-equal';

enum ActionType {
  '/user/setKey' = '/user/setKey',
  '/user/setStatus' = '/user/setStatus',
  '/user/setId' = '/user/setId',
  '/user/setUser' = '/user/setUser',
}

type Action<payload> = {
  type: ActionType;
  payload?: payload;
  error?: boolean;
};

type State = TUser;

const initState: State = {
  key: null,
  status: 'basic',
  id: null,
};

export const setKey = (key: string): Action<string> => ({
  type: ActionType['/user/setKey'],
  payload: key,
});

export const setId = (id: string): Action<string> => ({
  type: ActionType['/user/setId'],
  payload: id,
});

export const setStatus = (status: TUserStatus): Action<string> => ({
  type: ActionType['/user/setStatus'],
  payload: status,
});

export const setUser = (user: TUser): Action<TUser> => ({
  type: ActionType['/user/setUser'],
  payload: user,
});

export default function user(state = initState, action: Action<any>): State {
  switch (action.type) {
    case ActionType['/user/setKey']:
      return { ...state, key: action.payload };
    case ActionType['/user/setUser']:
      return action.payload;
    case ActionType['/user/setId']:
      return { ...state, id: action.payload };
    case ActionType['/user/setStatus']:
      return { ...state, status: action.payload };
    default:
      return state;
  }
}

export const useUser: () => State = () => {
  return useSelector((state: AppRootState) => {
    return state.user;
  }, deepEqual);
};
