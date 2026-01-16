import React from 'react';

interface LinkItem {
    label: string;
    url: string;
}

interface InfoSectionConfig {
    title: string;
    links: LinkItem[];
    styles?: {
        backgroundColor?: string;
        textColor?: string;
        linkColor?: string;
    };
}

interface InfoSectionProps {
    themeConfig: any;
    sharedLinks?: LinkItem[];
    activeTheme?: string;
}

const InfoSection: React.FC<InfoSectionProps> = ({ themeConfig, sharedLinks, activeTheme }) => {
    // Fallback if config isn't present yet, or use the specific section
    const config: InfoSectionConfig = themeConfig.infoSection || {
        title: "Supplementary Information",
        links: [],
        styles: {}
    };

    const styles = config.styles || {};
    const bgColor = styles.backgroundColor || 'transparent'; // Default to transparent if not set
    const textColor = styles.textColor || 'inherit';
    const linkColor = styles.linkColor || '#3b82f6';

    const allLinks = [
        ...(config.links || []),
        ...(sharedLinks || [])
    ];

    if (allLinks.length === 0) return null;

    return (
        <section style={{
            width: '100%',
            padding: '4rem 2rem',
            backgroundColor: bgColor,
            color: textColor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '40vh', // Takes up some space
            boxSizing: 'border-box',
            zIndex: 10,
            position: 'relative',
            overflow: 'hidden' // Ensure GIFs don't overflow horizontally if on edge
        }}>
            {activeTheme === 'retro' && (
                <>
                    <img
                        src="/phone_1.gif"
                        alt=""
                        style={{
                            position: 'absolute',
                            left: '5%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            height: '80%', // Adjust size as needed
                            maxHeight: '300px',
                            objectFit: 'contain',
                            pointerEvents: 'none',
                            opacity: 0.8
                        }}
                    />
                    <img
                        src="/phone_2.gif"
                        alt=""
                        style={{
                            position: 'absolute',
                            right: '5%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            height: '80%', // Adjust size as needed
                            maxHeight: '300px',
                            objectFit: 'contain',
                            pointerEvents: 'none',
                            opacity: 0.8
                        }}
                    />
                </>
            )}

            <h2 style={{
                fontSize: '2rem',
                marginBottom: '2rem',
                fontWeight: 'bold',
                textAlign: 'center',
                fontFamily: themeConfig.headline?.fontFamily // Match headline font if possible
            }}>
                {config.title}
            </h2>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                alignItems: 'center',
                zIndex: 2 // Ensure links are above images
            }}>
                {allLinks.map((link, index) => (
                    <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            fontSize: '1.2rem',
                            color: linkColor,
                            textDecoration: 'none',
                            borderBottom: `1px solid ${linkColor}`,
                            paddingBottom: '2px',
                            transition: 'opacity 0.2s'
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.opacity = '0.8')}
                        onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                        {link.label}
                    </a>
                ))}
            </div>

            <p style={{
                marginTop: '3rem',
                fontSize: '0.8rem',
                opacity: 0.5,
                textAlign: 'center',
                maxWidth: '600px'
            }}>
                Disclaimer: We claim no responsibility for the content of linked pages.
            </p>
        </section>
    );
};

export default InfoSection;
