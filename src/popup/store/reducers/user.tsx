import { TUser } from '../../../common/types';
import { AppRootState } from './index';
import { useSelector } from 'react-redux';
import deepEqual from 'fast-deep-equal';

enum ActionType {
  '/user/setKey' = '/user/setKey',
  '/user/setId' = '/user/setId',
  '/user/setUser' = '/user/setUser',
  '/user/setLoading' = '/user/setLoading',
  '/user/setAddress' = '/user/setAddress',
  '/user/setDevMode' = '/user/setDevMode', 
}

type Action<payload> = {
  type: ActionType;
  payload?: payload;
  error?: boolean;
};

type State = TUser;

const initState: State = {
  key: null,
  id: null,
  address: null,
  loading: false,
  devMode: false
};

export const setKey = (key: string): Action<string> => ({
  type: ActionType['/user/setKey'],
  payload: key,
});

export const setLoading = (loading: boolean): Action<boolean> => ({
  type: ActionType['/user/setLoading'],
  payload: loading,
});

export const setId = (id: string): Action<string> => ({
  type: ActionType['/user/setId'],
  payload: id,
});

export const setUser = (user: TUser): Action<TUser> => ({
  type: ActionType['/user/setUser'],
  payload: user,
});

export const setAddress = (address: string): Action<string> => ({
  type: ActionType['/user/setAddress'],
  payload: address,
});

export const setDevMode = (devMode: boolean): Action<boolean> => ({
  type: ActionType['/user/setDevMode'],
  payload: devMode,
});

export default function user(state = initState, action: Action<any>): State {
  switch (action.type) {
    case ActionType['/user/setKey']:
      return { ...state, key: action.payload };

    case ActionType['/user/setUser']:
      return action.payload;

    case ActionType['/user/setId']:
      return { ...state, id: action.payload };

    case ActionType['/user/setLoading']:
      return { ...state, loading: action.payload };

    case ActionType['/user/setDevMode']:
      return { ...state, devMode: action.payload };

    case ActionType['/user/setAddress']:
      return { ...state, address: action.payload };

    default:
      return state;
  }
}

export const useUser: () => State = () => {
  return useSelector((state: AppRootState) => {
    return state.user;
  }, deepEqual);
};
