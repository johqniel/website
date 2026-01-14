import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult } from '../types';
// css imported globally in index.tsx

interface TerminalWindowProps {
  analysis: AnalysisResult | null;
}

// --- Helper: A function for the typing interval ---
// We put this outside the component so it doesn't reinvoke
const typeText = (
  fullText: string,
  setText: React.Dispatch<React.SetStateAction<string>>,
  speed: number,
  onComplete: () => void // A callback to start the next step
) => {
  let i = 0;
  const intervalId = setInterval(() => {
    if (i >= fullText.length) {
      clearInterval(intervalId);
      onComplete(); // We're done, call the next function
    } else {
      setText(fullText.substring(0, i + 1));
      i++;
    }
  }, speed);

  return intervalId; // Return the ID so we can clear it
};

// --- Helper: Formats the percentage ---
const formatPercent = (score: number) => {
  return (score * 100).toFixed(1) + '%';
};


const TerminalWindow: React.FC<TerminalWindowProps> = ({ analysis }) => {
  // --- 1. Internal state for the text we are *currently* showing ---
  const [summary, setSummary] = useState('');
  const [pred1Label, setPred1Label] = useState('');
  const [pred1, setPred1] = useState('');
  const [pred2Label, setPred2Label] = useState('');
  const [pred2, setPred2] = useState('');

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const typingSpeed = 25; // Typing speed in ms (lower is faster)

  // --- 2. This effect triggers when 'analysis' changes ---
  useEffect(() => {
    // A list of all timers we create
    const timers: NodeJS.Timeout[] = [];

    // Clear all text when new analysis arrives
    setSummary('');
    setPred1Label('');
    setPred1('');
    setPred2Label('');
    setPred2('');

    if (analysis) {
      // --- Build the full text strings ---
      const fullSummary = analysis.summary;
      const fullPred1Label = '> EINSCHÄTZUNG:';
      const fullPred1 = analysis.predictions[0]
        ? `  ${analysis.predictions[0].label}: ${formatPercent(analysis.predictions[0].score)} [${analysis.predictions[0].risk_level || 'unknown'}]`
        : '';
      const fullPred2Label = '';
      const fullPred2 = analysis.predictions[1]
        ? `  ${analysis.predictions[1].label}: ${formatPercent(analysis.predictions[1].score)} [${analysis.predictions[1].risk_level || 'unknown'}]`
        : '';

      // --- 3. Start the typing cascade ---
      // We nest the `typeText` calls in the `onComplete` callback
      // This ensures they run one after another.
      const t1 = setTimeout(() => {
        timers.push(
          typeText(fullSummary, setSummary, typingSpeed, () => {
            timers.push(
              typeText(fullPred1Label, setPred1Label, typingSpeed, () => {
                timers.push(
                  typeText(fullPred1, setPred1, typingSpeed, () => {
                    timers.push(
                      typeText(fullPred2Label, setPred2Label, typingSpeed, () => {
                        timers.push(
                          typeText(fullPred2, setPred2, typingSpeed, () => { })
                        );
                      })
                    );
                  })
                );
              })
            );
          })
        );
      }, 300); // Start after a short delay
      timers.push(t1);
    }

    // --- 4. Cleanup ---
    // This is critical. If 'analysis' changes mid-type,
    // we clear all old timers to stop the old effect.
    return () => {
      timers.forEach(clearInterval);
    };
  }, [analysis]); // The effect re-runs when 'analysis' changes

  // Auto-scroll to the bottom
  // Smart Auto-scroll to the bottom
  // Only scroll if we are already near the bottom to avoid fighting the user


  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-buttons">
          <span className="terminal-dot red"></span>
          <span className="terminal-dot yellow"></span>
          <span className="terminal-dot green"></span>
        </div>
        <span>analysis_feed.log</span>
      </div>

      <div className="terminal-body">
        {/* Placeholder */}
        {!analysis && (
          <div className="terminal-line">
            <span className="terminal-prompt">&gt;</span>
            <span className="terminal-text">
              Analysis pending...
            </span>
          </div>
        )}

        {/* --- 5. Render the *internal state* text --- */}
        {summary && (
          <>
            <div className="terminal-line">
              <span className="terminal-prompt">&gt;</span>
              <span className="terminal-text terminal-label">SUMMARY:</span>
            </div>
            <div className="terminal-line">
              <span className="terminal-prompt"> </span>
              <span className="terminal-text">{summary}</span>
            </div>
          </>
        )}

        {pred1Label && (
          <div className="terminal-line">
            <span className="terminal-prompt">&gt;</span>
            <span className="terminal-text terminal-label">{pred1Label}</span>
          </div>
        )}

        {pred1 && (
          <div className="terminal-line">
            <span className="terminal-prompt"> </span>
            <span className="terminal-text" style={{ color: analysis?.predictions[0]?.color || 'inherit' }}>{pred1}</span>
          </div>
        )}

        {pred2 && (
          <div className="terminal-line">
            <span className="terminal-prompt"> </span>
            <span className="terminal-text" style={{ color: analysis?.predictions[1]?.color || 'inherit' }}>{pred2}</span>
          </div>
        )}

        {/* Blinking cursor appears only when analysis is done */}
        {analysis && (
          <div className="terminal-line">
            <span className="terminal-prompt">&gt;</span>
            <span className="terminal-cursor">_</span>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

export default TerminalWindow;