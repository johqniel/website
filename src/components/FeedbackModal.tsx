import React, { useState } from 'react';

interface FeedbackModalProps {
    onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
    const [message, setMessage] = useState('');
    const [contact, setContact] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async () => {
        if (!message.trim()) return;

        setIsSubmitting(true);
        setStatus('idle');

        try {
            const response = await fetch('/api/save_feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, contact })
            });

            if (response.ok) {
                setStatus('success');
                setTimeout(onClose, 2000);
            } else {
                setStatus('error');
            }
        } catch (e) {
            setStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                background: '#1A1A1A',
                border: '1px solid #333',
                borderRadius: '16px',
                padding: '30px',
                width: '100%',
                maxWidth: '400px',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        fontSize: '20px',
                        cursor: 'pointer'
                    }}
                >
                    ×
                </button>

                <h2 style={{ color: 'white', marginTop: 0, fontSize: '20px' }}>Feedback hinterlassen</h2>
                <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
                    Fehler gefunden? Oder einen Vorschlag? Lass es uns wissen!
                </p>

                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Dein Feedback..."
                    rows={5}
                    style={{
                        width: '100%',
                        background: '#111',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        padding: '10px',
                        color: 'white',
                        marginBottom: '10px',
                        resize: 'none',
                        outline: 'none',
                        fontSize: '14px'
                    }}
                />

                <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Kontakt (optional, z.B. E-Mail/Twitter)"
                    style={{
                        width: '100%',
                        background: '#111',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        padding: '10px',
                        color: 'white',
                        marginBottom: '20px',
                        outline: 'none',
                        fontSize: '14px'
                    }}
                />

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !message.trim()}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '25px',
                        background: status === 'success' ? '#44ff44' : 'white',
                        color: 'black',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: (isSubmitting || !message.trim()) ? 'not-allowed' : 'pointer',
                        opacity: (isSubmitting || !message.trim()) ? 0.5 : 1
                    }}
                >
                    {isSubmitting ? 'Senden...' : status === 'success' ? 'Gesendet!' : 'Feedback absenden'}
                </button>

                {status === 'error' && (
                    <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '10px', textAlign: 'center' }}>
                        Etwas ist schiefgelaufen. Bitte versuche es erneut.
                    </p>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;
