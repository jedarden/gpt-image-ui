import React from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import MainLayout from './components/MainLayout';
import ImageViewerModal from './components/ImageViewerModal';
import ImageMaskingModal from './components/ImageMaskingModal';
import StorageManager from './components/StorageManager';
import { UIProvider } from './contexts/UIContext';
import { ChatProvider } from './contexts/ChatContext';
import { ImageProvider } from './contexts/ImageContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <UIProvider>
      <AuthProvider>
        <ChatProvider>
          <ImageProvider>
            <div className="app">
              <Header />
              <StorageManager />
              <MainLayout />
              <Footer />
              
              {/* Modals */}
              <ImageViewerModal />
              <ImageMaskingModal />
            </div>
          </ImageProvider>
        </ChatProvider>
      </AuthProvider>
    </UIProvider>
  );
}

export default App;