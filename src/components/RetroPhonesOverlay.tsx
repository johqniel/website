import React from 'react';
import '../styles/RetroPhonesOverlay.css';

interface RetroPhonesOverlayProps {
    theme: string;
}

const getAssetPath = (path: string) => {
    return process.env.PUBLIC_URL + path;
};

const RetroPhonesOverlay: React.FC<RetroPhonesOverlayProps> = ({ theme }) => {
    if (theme !== 'retro') return null;

    return (
        <div className="retro-phones-overlay">
            <img
                src={getAssetPath('/phone_1.gif')}
                alt="Retro Phone Left"
                className="retro-phone left"
            />
            <img
                src={getAssetPath('/phone_2.gif')}
                alt="Retro Phone Right"
                className="retro-phone right"
            />
        </div>
    );
};

export default RetroPhonesOverlay;
