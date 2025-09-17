import React from 'react';
import { TVerificationStatus } from '../../popup/types';
import { TNotarizationGroup } from '../../common/types';

type TProps = {
  status: TVerificationStatus;
  children: React.ReactNode | React.ReactNode[];
  icon?: string;
  title: string;
  description?: string;
  selectable: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  id: string;
  groups?: TNotarizationGroup[];
};

export default TProps;
