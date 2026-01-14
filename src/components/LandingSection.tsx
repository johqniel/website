import IntroOverlay from './IntroOverlay';
import MarqueeHeadline from './MarqueeHeadline';
import IntroText from './IntroText';
import ArrowOverlay from './ArrowOverlay';

interface LandingProps {
    themeConfig: any;
    activeTheme: string;
}

const LandingSection: React.FC<LandingProps> = ({ themeConfig, activeTheme }) => {
    return (
        <section style={{
            minHeight: '100vh',
            height: 'auto',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            zIndex: 10,
            paddingBottom: '100px' // Ensure padding for scroll arrow
        }}>
            <MarqueeHeadline config={themeConfig.headline} />
            {themeConfig.subHeadline && (
                <h2 style={{
                    fontSize: themeConfig.subHeadline.fontSize,
                    color: themeConfig.subHeadline.fontColor,
                    fontFamily: themeConfig.subHeadline.fontFamily,
                    textAlign: 'center',
                    margin: '2rem 0',
                    maxWidth: '90%',
                    zIndex: 2 // Ensure it sits above particles/background but below overlay if needed
                }}>
                    {themeConfig.subHeadline.text}
                </h2>
            )}
            <IntroOverlay theme={activeTheme} />
            <IntroText config={themeConfig.intro} />
            <ArrowOverlay theme={activeTheme} color={themeConfig.intro.fontColor} />
        </section>
    );
};

export default LandingSection;
