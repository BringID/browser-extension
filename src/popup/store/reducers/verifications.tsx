import { TVerification } from '../../../common/types';
import { AppRootState } from './index';
import { useSelector } from 'react-redux';

enum ActionType {
  '/verifications/addVerification' = '/verifications/addVerification',
  '/verifications/addVerifications' = '/verifications/addVerifications',
  '/verifications/setLoading' = '/verifications/setLoading',
}

type Action<payload> = {
  type: ActionType;
  payload?: payload;
  error?: boolean;
};

type State = {
  verifications: TVerification[];
  loading: boolean;
};

const initState: State = {
  verifications: [],
  loading: false,
};

export const addVerification = (
  verification: TVerification,
): Action<TVerification> => ({
  type: ActionType['/verifications/addVerification'],
  payload: verification,
});

export const addVerifications = (
  verifications: TVerification[],
): Action<TVerification[]> => ({
  type: ActionType['/verifications/addVerifications'],
  payload: verifications,
});

export const setLoading = (loading: boolean): Action<boolean> => ({
  type: ActionType['/verifications/setLoading'],
  payload: loading,
});

export default function verifications(
  state = initState,
  action: Action<any>,
): State {
  switch (action.type) {
    case ActionType['/verifications/addVerification']: {
      const exists = state.verifications.find(
        (verification) => verification.credentialGroupId,
      );
      if (exists) {
        const verifications = state.verifications.map((verification) => {
          if (
            verification.credentialGroupId === action.payload.credentialGroupId
          ) {
            return action.payload;
          }
          return verification;
        });
        return {
          ...state,
          verifications,
        };
      } else {
        return {
          ...state,
          verifications: [action.payload, ...state.verifications],
        };
      }
    }
    case ActionType['/verifications/addVerifications']:
      return {
        ...state,
        verifications: action.payload,
      };

    case ActionType['/verifications/setLoading']:
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
}

export const useVerifications: () => State = () => {
  return useSelector((state: AppRootState) => {
    return state.verifications;
  });
};
