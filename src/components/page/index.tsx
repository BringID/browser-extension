import React, { FC } from 'react';
import { PageContainer } from './styled-components';
import { ThemeProvider } from 'styled-components';
import { light } from '../../themes';
import '../../assets/fonts/index.css';
import TProps from './types';
import './styles.css';

const Page: FC<TProps> = ({ children }) => {
  return (
    <ThemeProvider theme={light}>
      <PageContainer>{children}</PageContainer>
    </ThemeProvider>
  );
};

export default Page;
