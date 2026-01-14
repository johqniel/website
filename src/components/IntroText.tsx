import React from 'react';

interface IntroProps {
    config: any;
}

const IntroText: React.FC<IntroProps> = ({ config }) => {
    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
            padding: '2rem 25vw',
            color: config.fontColor,
        }}>
            <p style={{
                fontSize: config.fontSize,
                fontWeight: config.fontWeight || 300,
                lineHeight: 1.6,
                margin: 0,
                whiteSpace: 'pre-wrap'
            }}>
                {config.text}
            </p>
        </div>
    );
};

export default IntroText;
