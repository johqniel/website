import React, { useRef, useEffect } from 'react';
import siteConfig from '../siteConfig.json';

interface CanvasBackgroundProps {
    theme?: 'premium' | 'retro' | 'hybrid'; // Passed from App
}

const CanvasBackground: React.FC<CanvasBackgroundProps> = ({ theme = 'premium' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Get styling for the current theme from config
    // @ts-ignore
    const themeConfig = siteConfig.themes[theme] || siteConfig.themes.premium;
    const bgConfig = themeConfig.background;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = window.innerWidth;
        let height = window.innerHeight;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', resize);
        resize();

        // If solid, just draw once and return (or keep loop if we want to support dynamic switching efficiently)
        // For simplicity, we'll keep the loop but just fill rect if solid.

        let particles: any[] = [];
        if (bgConfig.type === 'particles') {
            // Particle configuration
            const particleCount = 100;
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1,
                });
            }
        }

        const render = () => {
            // 1. Draw Background
            ctx.fillStyle = bgConfig.color;
            ctx.fillRect(0, 0, width, height);

            if (bgConfig.type === 'particles') {
                // Update and draw particles
                ctx.fillStyle = bgConfig.accent;

                particles.forEach((p, i) => {
                    p.x += p.vx;
                    p.y += p.vy;

                    // Bounce off edges
                    if (p.x < 0 || p.x > width) p.vx *= -1;
                    if (p.y < 0 || p.y > height) p.vy *= -1;

                    // Draw particle
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.globalAlpha = 0.5;
                    ctx.fill();

                    // Draw connections
                    for (let j = i + 1; j < particles.length; j++) {
                        const p2 = particles[j];
                        const dx = p.x - p2.x;
                        const dy = p.y - p2.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < 150) {
                            ctx.beginPath();
                            ctx.strokeStyle = bgConfig.accent;
                            ctx.globalAlpha = 1 - dist / 150;
                            ctx.lineWidth = 0.5;
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.stroke();
                        }
                    }
                });
            } else if (bgConfig.type === 'solid') {
                // Nothing else to draw
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme, bgConfig]); // Re-run if theme changes

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
            }}
        />
    );
};

export default CanvasBackground;
