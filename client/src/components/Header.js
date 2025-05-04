import React, { useContext } from 'react';
import './Header.css';
import { UIContext } from '../contexts/UIContext';

const Header = () => {
  const { theme, toggleTheme, openSettingsModal } = useContext(UIContext);

  return (
    <header className="header">
      <div className="header-logo">
        <h1>GPT Image UI</h1>
      </div>
      
      <div className="header-controls">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        
        <button
          className="settings-button"
          onClick={openSettingsModal}
          aria-label="Open settings"
        >
          ⚙️
        </button>
      </div>
    </header>
  );
};

export default Header;