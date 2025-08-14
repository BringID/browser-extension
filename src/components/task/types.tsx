import { TVerificationStatus } from "../../popup/types";

export type TProps = {
  credentialGroupId: string;
  icon?: string;
  title: string;
  description?: string;
  points: number;
  status: TVerificationStatus
};
