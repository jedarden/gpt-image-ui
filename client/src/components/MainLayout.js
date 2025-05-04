import React, { useContext } from 'react';
import './MainLayout.css';
import ChatContainer from './ChatContainer';
import ControlPanel from './ControlPanel';
import { UIContext } from '../contexts/UIContext';

const MainLayout = () => {
  const { isMobile } = useContext(UIContext);
  
  return (
    <main className={`main-layout ${isMobile ? 'mobile' : 'desktop'}`}>
      <ChatContainer />
      <ControlPanel />
    </main>
  );
};

export default MainLayout;