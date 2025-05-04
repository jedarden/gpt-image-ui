import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          GPT Image UI - Powered by OpenAI's gpt-image-1 model
        </p>
        <p className="copyright">
          &copy; {new Date().getFullYear()} - All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;