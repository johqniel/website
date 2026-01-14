import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult } from '../types';

interface TerminalWindowProps {
  analysis: AnalysisResult | null;
}

// --- Helper: A function for the typing interval ---
const typeText = (
  fullText: string,
  setText: (s: string) => void,
  speed: number,
  onComplete: () => void
) => {
  let i = 0;
  const intervalId = setInterval(() => {
    if (i >= fullText.length) {
      clearInterval(intervalId);
      onComplete();
    } else {
      setText(fullText.substring(0, i + 1));
      i++;
    }
  }, speed);

  return intervalId;
};

// --- Helper: Formats the percentage ---
const formatPercent = (score: number) => {
  return (score * 100).toFixed(1) + '%';
};


const TerminalWindow: React.FC<TerminalWindowProps> = ({ analysis }) => {
  // State
  const [summary, setSummary] = useState('');
  const [predictionsLabel, setPredictionsLabel] = useState('');
  // We store an array of typed strings for predictions
  const [typedPredictions, setTypedPredictions] = useState<string[]>([]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const typingSpeed = 25;

  // Auto-scroll
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [summary, predictionsLabel, typedPredictions]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Reset
    setSummary('');
    setPredictionsLabel('');
    setTypedPredictions([]);

    if (analysis) {
      // 1. Normalize scores to sum to 100% (1.0)
      let totalScore = analysis.predictions.reduce((acc, p) => acc + p.score, 0);
      if (totalScore === 0) totalScore = 1; // avoid zero div

      const normalizedPredictions = analysis.predictions.map(p => ({
        ...p,
        normalizedScore: p.score / totalScore
      }));

      // --- Build the full text strings ---
      const fullSummary = analysis.summary;
      const fullPredLabel = '> EINSCHÄTZUNG:';

      // Step 1: Type Summary
      const t1 = setTimeout(() => {
        timers.push(
          typeText(fullSummary, setSummary, typingSpeed, () => {
            // Step 2: Type "EINSCHÄTZUNG:"
            timers.push(
              typeText(fullPredLabel, setPredictionsLabel, typingSpeed, () => {
                // Step 3: Loop through predictions
                let currentPredIndex = 0;

                const typeNextPrediction = () => {
                  if (currentPredIndex >= normalizedPredictions.length) {
                    return; // Done
                  }

                  const p = normalizedPredictions[currentPredIndex];
                  // user wants: Label: XX.X% (no risk level text)
                  const textToType = `  ${p.label}: ${formatPercent(p.normalizedScore)}`;

                  // We need a specialized setter that updates the ARRAY at specific index
                  // We can't pass setTypedPredictions directly to typeText helper easily 
                  // because typeText expects a simpler setter.
                  // So we make a wrapper.
                  let charIndex = 0;
                  const predInterval = setInterval(() => {
                    if (charIndex >= textToType.length) {
                      clearInterval(predInterval);
                      currentPredIndex++;
                      typeNextPrediction(); // Recursive call for next line
                    } else {
                      const substr = textToType.substring(0, charIndex + 1);
                      setTypedPredictions(prev => {
                        const newArr = [...prev];
                        newArr[currentPredIndex] = substr;
                        return newArr;
                      });
                      charIndex++;
                    }
                  }, typingSpeed);
                  timers.push(predInterval);
                };

                // Initialize array
                setTypedPredictions(new Array(normalizedPredictions.length).fill(''));
                // Start typing
                typeNextPrediction();
              })
            );
          })
        );
      }, 300);
      timers.push(t1);
    }

    return () => {
      timers.forEach(clearInterval);
    };
  }, [analysis]);

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

        {predictionsLabel && (
          <div className="terminal-line">
            <span className="terminal-prompt">&gt;</span>
            <span className="terminal-text terminal-label">{predictionsLabel}</span>
          </div>
        )}

        {/* Dynamic Predictions List */}
        {typedPredictions.map((text, idx) => {
          // Get original color from analysis
          // We use the index to match up with analysis.predictions
          const color = analysis?.predictions[idx]?.color || 'inherit';
          return (
            <div key={idx} className="terminal-line">
              <span className="terminal-prompt"> </span>
              <span className="terminal-text" style={{ color }}>{text}</span>
            </div>
          );
        })}

        {/* Blinking cursor */}
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