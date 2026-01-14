import React from 'react';
import '../styles/MarqueeHeadline.css';

interface MarqueeProps {
    config: any;
}

const MarqueeHeadline: React.FC<MarqueeProps> = ({ config }) => {
    return (
        <div className="marquee-container" style={{ color: config.fontColor }}>
            <div className="marquee-content" style={{ animationDuration: `${config.speed}s` }}>
                <h1 style={{ fontSize: config.fontSize, fontFamily: config.fontFamily, color: config.fontColor }}>{config.text}</h1>
            </div>
            {/* Duplicate for seamless loop */}
            <div className="marquee-content" style={{ animationDuration: `${config.speed}s` }}>
                <h1 style={{ fontSize: config.fontSize, fontFamily: config.fontFamily, color: config.fontColor }}>{config.text}</h1>
            </div>
        </div>
    );
};

export default MarqueeHeadline;
