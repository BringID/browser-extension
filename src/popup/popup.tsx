import React, { FC } from 'react';
import { Page } from '../components';
import { Home } from './pages';
import './styles.css';
import { Navigate, Route, Routes } from 'react-router';
import { useUser } from './store/reducers/user';
import { LoadingOverlay } from './components';

const Popup: FC = () => {
  const user = useUser();
  return (
    <Page>
      {user.loading && <LoadingOverlay title="Loading..." />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Page>
  );
};

export default Popup;
