import { TUserStatus } from '../../types';

type TProps = {
  host: string;
  pointsRequired: number;
  dropAddress: string;
  onClose: () => void;
  points: number;
  userStatus: TUserStatus;
};

export default TProps;
