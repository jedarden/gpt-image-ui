import React from 'react';
import './TextMessage.css';
import ReactMarkdown from 'react-markdown';

const TextMessage = ({ content }) => {
  return (
    <div className="text-message">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default TextMessage;