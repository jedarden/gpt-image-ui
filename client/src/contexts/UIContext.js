import React, { createContext, useState, useEffect } from 'react';

export const UIContext = createContext();

export const UIProvider = ({ children }) => {
  // Modal states
  const [modalState, setModalState] = useState({
    imageViewer: {
      isOpen: false,
      images: [],
      currentIndex: 0
    },
    masking: {
      isOpen: false,
      image: null
    },
    settings: {
      isOpen: false
    }
  });

  // Theme state
  const [theme, setTheme] = useState('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Image viewer modal functions
  const openImageViewer = (images, startIndex = 0) => {
    setModalState(prevState => ({
      ...prevState,
      imageViewer: {
        isOpen: true,
        images,
        currentIndex: startIndex
      }
    }));
  };

  const closeImageViewer = () => {
    setModalState(prevState => ({
      ...prevState,
      imageViewer: {
        ...prevState.imageViewer,
        isOpen: false
      }
    }));
  };

  const navigateImage = (direction) => {
    setModalState(prevState => {
      const { images, currentIndex } = prevState.imageViewer;
      let newIndex;
      
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % images.length;
      } else {
        newIndex = (currentIndex - 1 + images.length) % images.length;
      }
      
      return {
        ...prevState,
        imageViewer: {
          ...prevState.imageViewer,
          currentIndex: newIndex
        }
      };
    });
  };

  // Masking modal functions
  const openMaskingModal = (image) => {
    setModalState(prevState => ({
      ...prevState,
      masking: {
        isOpen: true,
        image
      }
    }));
  };

  const closeMaskingModal = () => {
    setModalState(prevState => ({
      ...prevState,
      masking: {
        ...prevState.masking,
        isOpen: false
      }
    }));
  };

  // Settings modal functions
  const openSettingsModal = () => {
    setModalState(prevState => ({
      ...prevState,
      settings: {
        isOpen: true
      }
    }));
  };

  const closeSettingsModal = () => {
    setModalState(prevState => ({
      ...prevState,
      settings: {
        isOpen: false
      }
    }));
  };

  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Update mobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <UIContext.Provider
      value={{
        modalState,
        theme,
        isMobile,
        toggleTheme,
        openImageViewer,
        closeImageViewer,
        navigateImage,
        openMaskingModal,
        closeMaskingModal,
        openSettingsModal,
        closeSettingsModal
      }}
    >
      {children}
    </UIContext.Provider>
  );
};