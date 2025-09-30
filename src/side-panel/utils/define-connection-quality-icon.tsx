import React from 'react';
import { Icons } from '../../components';
import chains from '../../configs/chains';

import styled from 'styled-components';
import { TConnectionQuality } from '../../common/types';

const GoodConnectionQuality = styled(Icons.ConnectionIcon)`
  color: ${(props) => props.theme.successStatusTextColor};
`;

const MediumConnectionQuality = styled(Icons.ConnectionIcon)`
  color: ${(props) => props.theme.warningStatusTextColor};
`;

const PoorConnectionQuality = styled(Icons.ConnectionIcon)`
  color: ${(props) => props.theme.errorStatusTextColor};
`;

const defineConnectionQualityIcon = (connectionQuality: TConnectionQuality) => {
  switch (connectionQuality) {
    case 'good':
    case 'excellent':
      return <GoodConnectionQuality />;
    case 'fair':
      return <MediumConnectionQuality />;
    case 'poor':
      return <PoorConnectionQuality />;
  }
};

export default defineConnectionQualityIcon;
