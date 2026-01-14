import React, { useState, useEffect } from 'react';
import '../styles/IntroOverlay.css';
import '../styles/IntroOverlay.css';

interface IntroOverlayProps {
    theme: string;
}

// ==========================================
// CONFIGURATION
// ==========================================

// Time ranges for idle states (in milliseconds)
const IDLE_TIME = { min: 2000, max: 5000 };
const HOLD_TIME = { min: 2000, max: 4000 };
const PRE_BLINK_DELAY = 1000; // Pause in middle before blinking

// Durations based on 100ms/frame * 10 frames
const DURATIONS = {
    blink: 1000,
    down: 1000,
    left: 1000,
    right: 1000
};

type Direction = 'down' | 'left' | 'right';

const getAssetPath = (path: string) => {
    return process.env.PUBLIC_URL + path;
};

// File mappings
const ASSETS = {
    idle: getAssetPath('/middle.png'),
    blink: getAssetPath('/blink_middle_10.gif'),
    down: {
        move: getAssetPath('/middle_down_10.gif'),
        hold: getAssetPath('/down.png'),
        return: getAssetPath('/down_middle_10.gif')
    },
    left: {
        move: getAssetPath('/middle_left_10.gif'),
        hold: getAssetPath('/left.png'),
        return: getAssetPath('/left_middle_10.gif')
    },
    right: {
        move: getAssetPath('/middle_right_10.gif'),
        hold: getAssetPath('/right.png'),
        return: getAssetPath('/right_middle_10.gif')
    }
};

// Strict State Machine
type EyePhase =
    | 'MIDDLE'         // Showing middle.png
    | 'BLINKING'       // Showing blink gif
    | 'MOVING'         // Middle -> Direction gif
    | 'HOLDING'        // Direction png
    | 'RETURNING';     // Direction -> Middle gif

const IntroOverlay: React.FC<IntroOverlayProps> = ({ theme }) => {
    // Current logical state
    const [phase, setPhase] = useState<EyePhase>('MIDDLE');

    // The direction we are interacting with (if any)
    const [targetDir, setTargetDir] = useState<Direction>('down'); // default dummy

    // Current Assets to display
    const [leftSrc, setLeftSrc] = useState<string>(ASSETS.idle);
    const [rightSrc, setRightSrc] = useState<string>(ASSETS.idle);

    // Helpers to get assets for Left (Standard) and Right (Mirrored) eyes
    const getLeftEyeAsset = (type: 'move' | 'hold' | 'return', dir: Direction) => {
        return ASSETS[dir][type];
    };

    const getRightEyeAsset = (type: 'move' | 'hold' | 'return', dir: Direction) => {
        // Mirrored Eye Logic:
        // If we want to look LEFT, we need the RIGHT asset (which looks right, mirrored -> left)
        // If we want to look RIGHT, we need the LEFT asset (which looks left, mirrored -> right)
        // If we want to look DOWN, we use DOWN asset.
        let mirroredDir = dir;
        if (dir === 'left') mirroredDir = 'right';
        else if (dir === 'right') mirroredDir = 'left';

        return ASSETS[mirroredDir][type];
    };

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const runSequence = () => {
            switch (phase) {
                case 'MIDDLE':
                    // Showing static middle. Wait, then Blink.
                    setLeftSrc(ASSETS.idle);
                    setRightSrc(ASSETS.idle);

                    const delay = Math.random() * (IDLE_TIME.max - IDLE_TIME.min) + IDLE_TIME.min;
                    timeout = setTimeout(() => {
                        setPhase('BLINKING');
                    }, delay);
                    break;

                case 'BLINKING':
                    // Show blink GIF
                    setLeftSrc(ASSETS.blink);
                    setRightSrc(ASSETS.blink); // Blink is symmetric usually

                    timeout = setTimeout(() => {
                        // After blink, pick a direction and move
                        const dirs: Direction[] = ['left', 'right', 'down'];
                        const nextDir = dirs[Math.floor(Math.random() * dirs.length)];
                        setTargetDir(nextDir);
                        setPhase('MOVING'); // Go to move
                    }, DURATIONS.blink);
                    break;

                case 'MOVING':
                    // Show Move GIF (Middle -> Dir)
                    setLeftSrc(getLeftEyeAsset('move', targetDir));
                    setRightSrc(getRightEyeAsset('move', targetDir));

                    timeout = setTimeout(() => {
                        setPhase('HOLDING');
                    }, DURATIONS[targetDir]);
                    break;

                case 'HOLDING':
                    // Show Static Dir PNG
                    setLeftSrc(getLeftEyeAsset('hold', targetDir));
                    setRightSrc(getRightEyeAsset('hold', targetDir));

                    const holdTime = Math.random() * (HOLD_TIME.max - HOLD_TIME.min) + HOLD_TIME.min;
                    timeout = setTimeout(() => {
                        setPhase('RETURNING');
                    }, holdTime);
                    break;

                case 'RETURNING':
                    // Show Return GIF (Dir -> Middle)
                    setLeftSrc(getLeftEyeAsset('return', targetDir));
                    setRightSrc(getRightEyeAsset('return', targetDir));

                    timeout = setTimeout(() => {
                        setPhase('MIDDLE');
                    }, DURATIONS[targetDir]);
                    break;
            }
        };

        runSequence();

        return () => clearTimeout(timeout);
    }, [phase, targetDir]);

    if (theme === 'premium') return null;

    return (
        <div className="intro-overlay-container">
            {/* Left Eye: Standard */}
            <img
                key={`left-${phase}`}
                src={leftSrc}
                alt="Watching Eye"
                className="intro-eye intro-eye-left"
            />

            {/* Right Eye: Mirrored via CSS (.intro-eye-right has scaleX(-1)) */}
            <img
                key={`right-${phase}`}
                src={rightSrc}
                alt="Watching Eye"
                className="intro-eye intro-eye-right"
            />
        </div>
    );
};

export default IntroOverlay;
