import React, { useContext } from 'react';
import './ControlPanel.css';
import MessageInput from './MessageInput';
import ImageUpload from './ImageUpload';
import { ChatContext } from '../contexts/ChatContext';
import { UIContext } from '../contexts/UIContext';

const ControlPanel = () => {
  const { sendMessage, isLoading } = useContext(ChatContext);
  const { isMobile } = useContext(UIContext);
  
  return (
    <div className={`control-panel ${isMobile ? 'mobile' : 'desktop'}`}>
      <div className="control-panel-content">
        <ImageUpload />
        <MessageInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ControlPanel;