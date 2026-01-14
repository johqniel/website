import React from 'react';
import '../styles/ChatIntroPopup.css';

interface ChatIntroPopupProps {
    title: string;
    content: string;
    onClose: () => void;
}

const ChatIntroPopup: React.FC<ChatIntroPopupProps> = ({ title, content, onClose }) => {
    return (
        <div className="chat-intro-popup-overlay">
            <div className="chat-intro-popup-content">
                <div className="chat-intro-popup-title">
                    Chat Context: {title}
                </div>
                <div className="chat-intro-popup-text">
                    {content}
                </div>
                <button className="chat-intro-popup-close" onClick={onClose}>
                    Start Analysis
                </button>
            </div>
        </div>
    );
};

export default ChatIntroPopup;
